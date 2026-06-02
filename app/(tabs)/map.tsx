import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMapScreenLayout } from "@/hooks/use-map-screen-layout";

import type { Charger, MapRoute, MapZoomDirection } from "../../components/maps/types";
import MapWrapper from "../../components/maps/MapWrapper";
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
import { fetchDrivingRoute, formatRouteSummary } from "@/location/mapRoute";

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
  const [activeTab, setActiveTab] = useState<StationTab>("all");
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [likedStations, setLikedStations] = useState<string[]>([]);
  const [infoStation, setInfoStation] = useState<ChargingStationMapItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLocation, setCurrentLocation] = useState<LocationState | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const { sheetBottomInset, overlayTop } = useMapScreenLayout();
  const [locationRevision, setLocationRevision] = useState(0);
  const [recenterSignal, setRecenterSignal] = useState(0);
  const [isLocating, setIsLocating] = useState(false);
  const [zoomCommand, setZoomCommand] = useState<
    { direction: MapZoomDirection; id: number } | undefined
  >();
  const [activeRoute, setActiveRoute] = useState<MapRoute | null>(null);
  const [routeTargetId, setRouteTargetId] = useState<string | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  const {
    data: allStations = [],
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

  const openExternalDirections = useCallback((station: ChargingStationMapItem) => {
    if (typeof station.latitude !== "number" || typeof station.longitude !== "number") {
      return;
    }

    const label = encodeURIComponent(station.name);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}&query=${label}`;
    void Linking.openURL(url);
  }, []);

  const requestCurrentLocation = useCallback(async () => {
    setIsLocating(true);
    try {
      const result = await getMapLocation();
      if (!result.ok) {
        setLocationError(getMapLocationErrorMessage(result.reason));
        setRecenterSignal((value) => value + 1);
        return;
      }

      setLocationError(null);
      setCurrentLocation(result.coords);
      setLocationRevision((value) => value + 1);
      setRecenterSignal((value) => value + 1);
    } finally {
      setIsLocating(false);
    }
  }, []);

  useEffect(() => {
    void requestCurrentLocation();
  }, [requestCurrentLocation]);

  const showRouteInApp = useCallback(
    async (station: ChargingStationMapItem) => {
      if (typeof station.latitude !== "number" || typeof station.longitude !== "number") {
        return;
      }

      if (!currentLocation) {
        setLocationError("Turn on location to show a route on the map.");
        void requestCurrentLocation();
        return;
      }

      setIsRouting(true);
      setRouteError(null);
      setSelectedStationId(station.id);
      setInfoStation(station);

      const route = await fetchDrivingRoute(currentLocation, {
        latitude: station.latitude,
        longitude: station.longitude,
      });

      if (!route) {
        setRouteError("Could not show a route for this station.");
        setActiveRoute(null);
        setRouteTargetId(null);
      } else {
        setRouteError(null);
        setActiveRoute(route);
        setRouteTargetId(station.id);
        setInfoStation(null);
      }

      setIsRouting(false);
    },
    [currentLocation, requestCurrentLocation],
  );

  const onMarkerPress = useCallback(
    (chargerId: string) => {
      setSelectedStationId(chargerId);
      const station = allStations.find((item) => item.id === chargerId) ?? null;
      setInfoStation(station);
      setRouteError(null);
      if (routeTargetId && routeTargetId !== chargerId) {
        setActiveRoute(null);
        setRouteTargetId(null);
      }
    },
    [allStations, routeTargetId],
  );

  const onZoom = useCallback((direction: MapZoomDirection) => {
    setZoomCommand((prev) => ({
      direction,
      id: (prev?.id ?? 0) + 1,
    }));
  }, []);

  const topChromeHeight = locationError ? 132 : 100;

  const mapPadding = useMemo(
    () => ({
      top: overlayTop + topChromeHeight + 8,
      right: 56,
      bottom: sheetBottomInset + 24,
      left: 16,
    }),
    [overlayTop, sheetBottomInset, topChromeHeight],
  );

  const filterChips = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.chipRow}
    >
      {(["all", "available", "favorites"] as const).map((tab) => {
        const isActive = activeTab === tab;
        const label = tab === "all" ? "All" : tab === "available" ? "Available" : "Favorites";
        return (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.chip, isActive && styles.chipActive]}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  const topOverlay = (
    <View style={styles.topOverlay} pointerEvents="box-none">
      <View style={styles.searchCard}>
        <IconSymbol name="search" size={18} color="#5F6368" />
        <TextInput
          placeholder="Search stations"
          placeholderTextColor="#9AA0A6"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>
      {filterChips}
      {locationError ? (
        <View style={styles.locationBanner}>
          <Text style={styles.locationHint}>{locationError}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.mapLayer}>
        <MapWrapper
          chargers={mapChargers}
          selectedChargerId={selectedChargerId}
          currentLocation={currentLocation}
          mapType="default"
          locationRevision={locationRevision}
          recenterSignal={recenterSignal}
          zoomCommand={zoomCommand}
          route={activeRoute}
          mapPadding={mapPadding}
          isLoading={false}
          errorMessage={mapErrorMessage}
          onMarkerPress={onMarkerPress}
        />
      </View>

      <View style={[styles.topOverlayWrap, { top: overlayTop }]} pointerEvents="box-none">
        {topOverlay}
      </View>

      <View
        style={[
          styles.zoomOverlay,
          { top: overlayTop + topChromeHeight + 4 },
        ]}
        pointerEvents="box-none"
      >
        <MapZoomControls onZoomIn={() => onZoom("in")} onZoomOut={() => onZoom("out")} />
      </View>

      <View
        style={[styles.locateFabWrap, { bottom: sheetBottomInset + 16 }]}
        pointerEvents="box-none"
      >
        <Pressable
          style={[styles.locateFab, isLocating && styles.locationButtonBusy]}
          onPress={() => void requestCurrentLocation()}
          disabled={isLocating}
          accessibilityRole="button"
          accessibilityLabel="Locate me"
        >
          <IconSymbol name="location.fill" size={22} color="#1A73E8" />
        </Pressable>
      </View>

      <Modal
        visible={!!infoStation}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoStation(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setInfoStation(null)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={2}>
                {infoStation?.name ?? "Station"}
              </Text>
              <View style={styles.modalHeaderActions}>
                {infoStation ? (
                  <Pressable
                    onPress={() => toggleLike(infoStation.id)}
                    style={styles.modalFavorite}
                    accessibilityRole="button"
                    accessibilityLabel="Favorite station"
                  >
                    <IconSymbol
                      name={likedStations.includes(infoStation.id) ? "heart.fill" : "heart"}
                      size={18}
                      color={
                        likedStations.includes(infoStation.id) ? "#E0586A" : "#6C7CA6"
                      }
                    />
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={() => setInfoStation(null)}
                  hitSlop={8}
                  style={styles.modalClose}
                >
                  <IconSymbol name="xmark" size={16} color="#1A2850" />
                </Pressable>
              </View>
            </View>
            <Text style={styles.modalAddress}>{infoStation?.address}</Text>
            <View style={styles.modalDetails}>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Status</Text>
                <Text style={styles.modalValue}>{infoStation?.availabilityLabel ?? "Unknown"}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Connectors</Text>
                <Text style={styles.modalValue}>{infoStation?.connectorSummary ?? "Unknown"}</Text>
              </View>
            </View>
            {infoStation && routeTargetId === infoStation.id && activeRoute ? (
              <Text style={styles.routeSummary}>{formatRouteSummary(activeRoute)}</Text>
            ) : null}
            {routeError ? <Text style={styles.routeErrorText}>{routeError}</Text> : null}
            {infoStation ? (
              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalPrimaryButton, isRouting && styles.modalButtonDisabled]}
                  onPress={() => void showRouteInApp(infoStation)}
                  disabled={isRouting}
                >
                  <Text style={styles.modalPrimaryButtonText}>
                    {isRouting ? "Calculating route…" : "Show route on map"}
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.modalSecondaryButton}
                  onPress={() => openExternalDirections(infoStation)}
                >
                  <Text style={styles.modalSecondaryButtonText}>Open in Google Maps</Text>
                </Pressable>
              </View>
            ) : null}
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
  topOverlayWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 4,
  },
  topOverlay: {
    paddingHorizontal: 16,
    gap: 10,
  },
  zoomOverlay: {
    position: "absolute",
    right: 16,
    zIndex: 3,
  },
  locateFabWrap: {
    position: "absolute",
    right: 16,
    zIndex: 3,
  },
  locateFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(60, 64, 67, 0.18)",
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  searchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: 4,
    paddingHorizontal: 16,
    minHeight: 48,
    borderWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    color: "#202124",
    fontWeight: "500",
    paddingVertical: 10,
    fontSize: 16,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(60, 64, 67, 0.12)",
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  chipActive: {
    backgroundColor: "#E8F5F4",
    borderColor: "#21B3A7",
  },
  chipText: {
    color: "#3C4043",
    fontWeight: "600",
    fontSize: 13,
  },
  chipTextActive: {
    color: "#0F6A6A",
    fontWeight: "700",
  },
  locationButtonBusy: { opacity: 0.65 },
  locationBanner: {
    backgroundColor: "rgba(254, 242, 242, 0.96)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(224, 88, 106, 0.25)",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  locationHint: {
    color: "#A42E3B",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
  routeSummary: { color: "#2563EB", fontWeight: "700", fontSize: 12 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(12, 22, 46, 0.42)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  modalHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalTitle: { flex: 1, color: "#13233D", fontWeight: "800", fontSize: 17, lineHeight: 22 },
  modalFavorite: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F6FB",
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F6FB",
  },
  modalAddress: { color: "#556689", fontSize: 13, lineHeight: 18 },
  modalDetails: {
    backgroundColor: "#F7FAFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  modalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 16 },
  modalLabel: { color: "#6C7CA6", fontWeight: "700", fontSize: 13 },
  modalValue: { color: "#1A2850", fontWeight: "700", fontSize: 13, flexShrink: 1, textAlign: "right" },
  modalActions: { marginTop: 4, gap: 10 },
  modalPrimaryButton: {
    backgroundColor: "#0F6A6A",
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonDisabled: { opacity: 0.7 },
  modalPrimaryButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14, lineHeight: 18 },
  modalSecondaryButton: {
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(39,79,141,0.2)",
  },
  modalSecondaryButtonText: { color: "#0F6A6A", fontWeight: "700", fontSize: 14, lineHeight: 18 },
  routeErrorText: { color: "#A42E3B", fontWeight: "600", fontSize: 12, lineHeight: 16 },
});
