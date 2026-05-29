import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useMapScreenLayout } from "@/hooks/use-map-screen-layout";

import type { Charger, MapZoomDirection } from "../../components/maps/types";
import MapWrapper from "../../components/maps/MapWrapper";
import { MapStationSheet } from "../../components/maps/MapStationSheet";
import { MapTypeToggle, type MapViewType } from "../../components/maps/MapTypeToggle";
import { MapZoomControls } from "../../components/maps/MapZoomControls";
import {
  type ChargingStationMapItem,
  useGetChargersQuery,
} from "@/charging/stations.api";
import { IconSymbol } from "components/ui/icon-symbol";
import {
  getMapLocation,
  getMapLocationErrorMessage,
} from "@/location/mapLocation";

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
  const { sheetBottomInset, overlayTop } = useMapScreenLayout(!!locationError);
  const [locationRevision, setLocationRevision] = useState(0);
  const [isLocating, setIsLocating] = useState(false);
  const [sheetExpandSignal, setSheetExpandSignal] = useState(0);
  const [mapType, setMapType] = useState<MapViewType>("default");
  const [zoomCommand, setZoomCommand] = useState<
    { direction: MapZoomDirection; id: number } | undefined
  >();
  const [sheetHeightPx, setSheetHeightPx] = useState(112);

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
    setIsLocating(true);
    try {
      const result = await getMapLocation();
      if (!result.ok) {
        setLocationError(getMapLocationErrorMessage(result.reason));
        return;
      }

      setLocationError(null);
      setCurrentLocation(result.coords);
      setLocationRevision((value) => value + 1);
    } finally {
      setIsLocating(false);
    }
  }, []);

  useEffect(() => {
    void requestCurrentLocation();
  }, [requestCurrentLocation]);

  const revealStationSheet = useCallback(() => {
    setSheetExpandSignal((value) => value + 1);
  }, []);

  const onMarkerPress = useCallback(
    (chargerId: string) => {
      setSelectedStationId(chargerId);
      const station = allStations.find((item) => item.id === chargerId) ?? null;
      setInfoStation(station);
      revealStationSheet();
    },
    [allStations, revealStationSheet],
  );

  const onZoom = useCallback((direction: MapZoomDirection) => {
    setZoomCommand((prev) => ({
      direction,
      id: (prev?.id ?? 0) + 1,
    }));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.mapLayer}>
        <MapWrapper
          chargers={mapChargers}
          selectedChargerId={selectedChargerId}
          currentLocation={currentLocation}
          mapType={mapType}
          locationRevision={locationRevision}
          zoomCommand={zoomCommand}
          isLoading={isLoading || isFetching}
          errorMessage={mapErrorMessage}
          onMarkerPress={onMarkerPress}
        />
      </View>

      <View style={[styles.topOverlay, { top: overlayTop }]} pointerEvents="box-none">
        <View style={styles.searchRow}>
          <View style={styles.searchCard}>
            <IconSymbol name="search" size={16} color="#6C7CA6" />
            <TextInput
              placeholder="Search stations"
              placeholderTextColor="#8B97B2"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
            <Pressable
              style={[styles.locateInSearch, isLocating && styles.locationButtonBusy]}
              onPress={requestCurrentLocation}
              disabled={isLocating}
              accessibilityRole="button"
              accessibilityLabel="Locate me"
            >
              <IconSymbol name="location.fill" size={18} color="#1A2850" />
            </Pressable>
          </View>
        </View>
        <View style={styles.zoomRow}>
          <MapZoomControls onZoomIn={() => onZoom("in")} onZoomOut={() => onZoom("out")} />
        </View>
        {locationError ? <Text style={styles.locationHint}>{locationError}</Text> : null}
      </View>

      <View
        style={[styles.layerToggleWrap, { bottom: sheetBottomInset + sheetHeightPx + 8 }]}
        pointerEvents="box-none"
      >
        <MapTypeToggle value={mapType} onChange={setMapType} />
      </View>

      <MapStationSheet
        screenHeight={height}
        bottomInset={sheetBottomInset}
        expandSignal={sheetExpandSignal}
        onHeightChange={setSheetHeightPx}
        header={
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
        }
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
                revealStationSheet();
              }}
              style={[styles.stationCard, isSelected && styles.stationCardSelected]}
            >
              <View style={styles.stationHeader}>
                <Text style={styles.stationName} numberOfLines={2}>
                  {station.name}
                </Text>
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
      </MapStationSheet>

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
  mapLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  topOverlay: { position: "absolute", left: 0, right: 0, zIndex: 2, paddingHorizontal: 16 },
  layerToggleWrap: {
    position: "absolute",
    right: 16,
    zIndex: 3,
  },
  searchRow: { width: "100%" },
  searchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 4,
    paddingLeft: 12,
    paddingRight: 4,
    borderWidth: 1,
    borderColor: "rgba(40, 92, 153, 0.12)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#0B2A5E",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  searchInput: { flex: 1, color: "#1A2850", fontWeight: "600", paddingVertical: 10 },
  locateInSearch: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF7F6",
  },
  locationButtonBusy: { opacity: 0.65 },
  zoomRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  locationHint: {
    marginTop: 8,
    color: "#A42E3B",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 4,
  },
  sheetTabs: { flexDirection: "row", paddingHorizontal: 16, marginBottom: 8 },
  sheetTab: { flex: 1, alignItems: "center", paddingVertical: 8, gap: 6 },
  tabActive: { backgroundColor: "rgba(26,40,80,0.04)", borderRadius: 10 },
  sheetTabText: { color: "#6C7CA6", fontWeight: "700", fontSize: 13 },
  sheetTabTextActive: { color: "#13233D" },
  tabLine: { width: 18, height: 3, borderRadius: 999, backgroundColor: "#21B3A7" },
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
  stationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  stationName: { flex: 1, color: "#13233D", fontWeight: "800", fontSize: 14 },
  stationActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
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
