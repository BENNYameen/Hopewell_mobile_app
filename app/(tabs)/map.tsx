import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import { useCallback, useMemo, useState } from "react";
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import type { Charger } from "../../components/maps/types";
import MapWrapper from "../../components/maps/MapWrapper";
import {
  type ChargingStationMapItem,
  useGetChargersQuery,
} from "@/charging/stations.api";
import { IconSymbol } from "components/ui/icon-symbol";

type StationTab = "all" | "available" | "favorites";

type LocationState = {
  latitude: number;
  longitude: number;
};

function toCharger(station: ChargingStationMapItem): Charger | null {
  if (typeof station.latitude !== "number" || typeof station.longitude !== "number") {
    return null;
  }

  return {
    id: station.id,
    name: station.name,
    latitude: station.latitude,
    longitude: station.longitude,
    address: station.address,
    availability: station.availabilityLabel,
    connectorCount: station.connectorCount,
    status: station.isAvailable ? "available" : "unavailable",
  };
}

export default function MapScreen() {
  const { height } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<StationTab>("all");
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [likedStations, setLikedStations] = useState<string[]>([]);
  const [infoStation, setInfoStation] = useState<ChargingStationMapItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLocation, setCurrentLocation] = useState<LocationState | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const {
    data: allStations = [],
    isLoading,
    isFetching,
    error,
    refetch: refetchStations,
  } = useGetChargersQuery();

  useFocusEffect(
    useCallback(() => {
      refetchStations();
    }, [refetchStations]),
  );

  const filteredStations = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return allStations.filter((station) => {
      const matchesTab =
        activeTab === "all"
          ? true
          : activeTab === "available"
            ? station.isAvailable
            : likedStations.includes(station.id);

      const matchesSearch =
        normalizedQuery.length === 0
          ? true
          : `${station.name} ${station.address} ${station.id}`
              .toLowerCase()
              .includes(normalizedQuery);

      return matchesTab && matchesSearch;
    });
  }, [activeTab, allStations, likedStations, searchQuery]);

  const mapChargers = useMemo(
    () => filteredStations.map(toCharger).filter((item): item is Charger => !!item),
    [filteredStations],
  );

  const selectedChargerId = useMemo(() => {
    if (!selectedStationId) return null;
    return mapChargers.some((charger) => charger.id === selectedStationId)
      ? selectedStationId
      : null;
  }, [mapChargers, selectedStationId]);

  const mapErrorMessage = useMemo(() => {
    if (error) return "Could not fetch charger locations. Please try again.";
    return undefined;
  }, [error]);

  const toggleLike = useCallback((id: string) => {
    setLikedStations((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const openDirections = useCallback((station: ChargingStationMapItem) => {
    if (typeof station.latitude !== "number" || typeof station.longitude !== "number") {
      return;
    }

    const label = encodeURIComponent(station.name);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}&query=${label}`;
    Linking.openURL(url);
  }, []);

  const requestCurrentLocation = useCallback(async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setLocationError("Location permission denied. Enable it to center the map.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocationError(null);
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch {
      setLocationError("Unable to read current location right now.");
    }
  }, []);

  const onMarkerPress = useCallback(
    (chargerId: string) => {
      setSelectedStationId(chargerId);
      const station = allStations.find((item) => item.id === chargerId) ?? null;
      setInfoStation(station);
    },
    [allStations],
  );

  const sheetScrollMaxHeight = Math.min(420, Math.max(240, Math.floor(height * 0.38)));

  return (
    <View style={styles.container}>
      <MapWrapper
        chargers={mapChargers}
        selectedChargerId={selectedChargerId}
        currentLocation={currentLocation}
        isLoading={isLoading || isFetching}
        errorMessage={mapErrorMessage}
        onMarkerPress={onMarkerPress}
      />

      <View style={styles.topOverlay} pointerEvents="box-none">
        <View style={styles.headerRow}>
          <View style={styles.searchCard}>
            <IconSymbol name="search" size={16} color="#6C7CA6" />
            <TextInput
              placeholder="Search stations"
              placeholderTextColor="#8B97B2"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
          </View>
          <Pressable style={styles.locationButton} onPress={requestCurrentLocation}>
            <IconSymbol name="location.fill" size={14} color="#1A2850" />
            <Text style={styles.locationText}>Locate</Text>
          </Pressable>
        </View>
        {locationError ? <Text style={styles.locationHint}>{locationError}</Text> : null}
      </View>

      <View style={styles.sheet}>
        <View style={styles.sheetTabs}>
          {(["all", "available", "favorites"] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.sheetTab, activeTab === tab && styles.tabActive]}
            >
              <Text
                style={[styles.sheetTabText, activeTab === tab && styles.sheetTabTextActive]}
              >
                {tab === "all" ? "All" : tab === "available" ? "Available" : "Favorites"}
              </Text>
              {activeTab === tab ? <View style={styles.tabLine} /> : null}
            </Pressable>
          ))}
        </View>

        <ScrollView
          style={[styles.sheetScroll, { maxHeight: sheetScrollMaxHeight }]}
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator
        >
          {!isLoading && !isFetching && filteredStations.length === 0 ? (
            <Text style={styles.emptyText}>No charging stations match the current filters.</Text>
          ) : null}

          {filteredStations.map((station) => {
            const isLiked = likedStations.includes(station.id);
            const isSelected = selectedStationId === station.id;
            const hasCoordinates =
              typeof station.latitude === "number" && typeof station.longitude === "number";

            return (
              <Pressable
                key={station.id}
                onPress={() => {
                  setSelectedStationId(station.id);
                  setInfoStation(station);
                }}
                style={[styles.stationCard, isSelected && styles.stationCardSelected]}
              >
                <View style={styles.stationHeader}>
                  <Text style={styles.stationName}>{station.name}</Text>
                  <View style={styles.stationActions}>
                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation();
                        toggleLike(station.id);
                      }}
                      style={styles.circleIcon}
                    >
                      <IconSymbol
                        name={isLiked ? "heart.fill" : "heart"}
                        size={14}
                        color={isLiked ? "#E0586A" : "#6C7CA6"}
                      />
                    </Pressable>
                    <Pressable
                      style={[styles.circleIcon, !hasCoordinates && styles.circleIconDisabled]}
                      onPress={(event) => {
                        event.stopPropagation();
                        openDirections(station);
                      }}
                      disabled={!hasCoordinates}
                    >
                      <IconSymbol name="directions" size={14} color="#0F6A6A" />
                    </Pressable>
                  </View>
                </View>
                <Text style={styles.stationAddress}>{station.address}</Text>
                <View style={styles.metaRow}>
                  <Text
                    style={[
                      styles.statusBadge,
                      station.isAvailable
                        ? styles.statusBadgeAvailable
                        : styles.statusBadgeUnavailable,
                    ]}
                  >
                    {station.availabilityLabel}
                  </Text>
                  <Text style={styles.stationMeta}>{station.connectorSummary}</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <Modal
        visible={!!infoStation}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoStation(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setInfoStation(null)}>
          <Pressable style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{infoStation?.name ?? "Station"}</Text>
              <Pressable onPress={() => setInfoStation(null)}>
                <IconSymbol name="xmark" size={16} color="#1A2850" />
              </Pressable>
            </View>
            <Text style={styles.modalAddress}>{infoStation?.address}</Text>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Status</Text>
              <Text style={styles.modalValue}>{infoStation?.availabilityLabel ?? "Unknown"}</Text>
            </View>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Connectors</Text>
              <Text style={styles.modalValue}>{infoStation?.connectorSummary ?? "Unknown"}</Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F6FB" },
  topOverlay: { position: "absolute", top: 40, left: 16, right: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  searchCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(40, 92, 153, 0.12)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: { flex: 1, color: "#1A2850", fontWeight: "600" },
  locationButton: {
    backgroundColor: "#EAF7F6",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(33,179,167,0.3)",
  },
  locationText: { color: "#1A2850", fontWeight: "700", fontSize: 12 },
  locationHint: {
    marginTop: 8,
    color: "#A42E3B",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 4,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "#FFFFFF",
    paddingTop: 10,
    shadowColor: "#0B2A5E",
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -10 },
    elevation: 16,
  },
  sheetTabs: { flexDirection: "row", paddingHorizontal: 16, marginBottom: 8 },
  sheetTab: { flex: 1, alignItems: "center", paddingVertical: 8, gap: 6 },
  tabActive: { backgroundColor: "rgba(26,40,80,0.04)", borderRadius: 10 },
  sheetTabText: { color: "#6C7CA6", fontWeight: "700", fontSize: 13 },
  sheetTabTextActive: { color: "#13233D" },
  tabLine: { width: 18, height: 3, borderRadius: 999, backgroundColor: "#21B3A7" },
  sheetScroll: { paddingHorizontal: 16 },
  sheetContent: { paddingBottom: 20 },
  emptyText: { textAlign: "center", color: "#6C7CA6", fontWeight: "600", paddingVertical: 24 },
  stationCard: {
    backgroundColor: "#F7FAFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(39,79,141,0.08)",
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },
  stationCardSelected: { borderColor: "#21B3A7", backgroundColor: "#EEF9F8" },
  stationHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  stationName: { color: "#13233D", fontWeight: "800", fontSize: 14 },
  stationActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  circleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(39,79,141,0.2)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  circleIconDisabled: { opacity: 0.35 },
  stationAddress: { color: "#5C6D95", fontWeight: "500", fontSize: 12 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  statusBadge: {
    fontSize: 11,
    fontWeight: "800",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden",
  },
  statusBadgeAvailable: { color: "#0E655D", backgroundColor: "rgba(33,179,167,0.18)" },
  statusBadgeUnavailable: { color: "#A42E3B", backgroundColor: "rgba(224,88,106,0.18)" },
  stationMeta: { color: "#4E5F88", fontWeight: "700", fontSize: 12 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(12, 22, 46, 0.42)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: 16,
    gap: 10,
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { color: "#13233D", fontWeight: "800", fontSize: 17 },
  modalAddress: { color: "#556689", fontSize: 13, marginBottom: 6 },
  modalRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  modalLabel: { color: "#6C7CA6", fontWeight: "700" },
  modalValue: { color: "#1A2850", fontWeight: "700", flex: 1, textAlign: "right" },
});
