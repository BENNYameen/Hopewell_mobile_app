import { useFocusEffect } from "@react-navigation/native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
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
import { WebView, WebViewMessageEvent } from "react-native-webview";

import {
  ChargingStationMapItem,
  useGetChargersQuery,
} from "@/charging/stations.api";
import { V } from "@/theme/vajra";
import { useGetWalletBalanceQuery } from "@/wallet/wallet.api";
import { IconSymbol } from "components/ui/icon-symbol";
import { WalletContent } from "./profile/wallet";

type StationTab = "all" | "available" | "favorites";

type MarkerPayload = {
  type: "stationPress";
  stationId: string;
};

const DEFAULT_MAP_CENTER = { latitude: 12.9716, longitude: 77.5946 };

export default function MapScreen() {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const googleMapsApiKey =
    Constants.expoConfig?.extra?.googleMapsApiKey ??
    Constants.manifest2?.extra?.expoClient?.extra?.googleMapsApiKey ??
    "";
  const [activeTab, setActiveTab] = useState<StationTab>("all");
  const [selectedStationId, setSelectedStationId] = useState<string | null>(
    null,
  );
  const [likedStations, setLikedStations] = useState<string[]>([]);
  const [infoStation, setInfoStation] = useState<ChargingStationMapItem | null>(
    null,
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [walletOpen, setWalletOpen] = useState(false);
  const { data: walletData, refetch: refetchWallet } =
    useGetWalletBalanceQuery();
  const {
    data: allStations = [],
    isLoading,
    isFetching,
    refetch: refetchStations,
  } = useGetChargersQuery();
  const sheetScrollMaxHeight = Math.min(
    420,
    Math.max(240, Math.floor(height * 0.38)),
  );

  useFocusEffect(
    useCallback(() => {
      refetchWallet();
      refetchStations();
    }, [refetchStations, refetchWallet]),
  );

  const stations = useMemo(() => {
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

  const markers = useMemo(
    () =>
      stations.filter(
        (station) =>
          typeof station.latitude === "number" &&
          typeof station.longitude === "number",
      ),
    [stations],
  );

  const mapHtml = useMemo(() => {
    const markerData = JSON.stringify(
      markers.map((station) => ({
        id: station.id,
        name: station.name,
        address: station.address,
        latitude: station.latitude,
        longitude: station.longitude,
        availabilityLabel: station.availabilityLabel,
        color: station.isAvailable ? "#21B3A7" : "#E0586A",
      })),
    );
    const center = markers[0]
      ? {
          latitude: markers[0].latitude ?? DEFAULT_MAP_CENTER.latitude,
          longitude: markers[0].longitude ?? DEFAULT_MAP_CENTER.longitude,
        }
      : DEFAULT_MAP_CENTER;

    if (!googleMapsApiKey) {
      return `<!doctype html>
<html>
  <body style="margin:0;display:flex;align-items:center;justify-content:center;background:#F3F6FB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="padding:24px;text-align:center;color:#13233D;">
      Google Maps API key is missing.
    </div>
  </body>
</html>`;
    }

    return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <style>
      html, body, #map { height: 100%; margin: 0; padding: 0; }
      .gm-style-cc { display: none; }
    </style>
    <script>
      const markers = ${markerData};

      function postStationPress(stationId) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "stationPress",
            stationId
          }));
        }
      }

      function initMap() {
        const center = { lat: ${center.latitude}, lng: ${center.longitude} };
        const map = new google.maps.Map(document.getElementById("map"), {
          center,
          zoom: markers.length > 0 ? 12 : 10,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        markers.forEach((station) => {
          const marker = new google.maps.Marker({
            map,
            position: { lat: station.latitude, lng: station.longitude },
            title: station.name,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: station.color,
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
              scale: 9,
            },
          });

          marker.addListener("click", () => postStationPress(station.id));
        });
      }
    </script>
    <script async src="https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=initMap"></script>
  </head>
  <body>
    <div id="map"></div>
  </body>
</html>`;
  }, [googleMapsApiKey, markers]);

  const openDirections = useCallback((station: ChargingStationMapItem) => {
    if (
      typeof station.latitude !== "number" ||
      typeof station.longitude !== "number"
    ) {
      return;
    }

    const label = encodeURIComponent(station.name);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}&query=${label}`;

    Linking.openURL(url);
  }, []);

  const toggleLike = useCallback((id: string) => {
    setLikedStations((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const handleMapMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const payload = JSON.parse(event.nativeEvent.data) as MarkerPayload;

        if (payload.type !== "stationPress") {
          return;
        }

        const station = allStations.find(
          (item) => item.id === payload.stationId,
        );

        if (!station) {
          return;
        }

        setSelectedStationId(station.id);
        setInfoStation(station);
      } catch {
        // Ignore malformed marker messages from the embedded map.
      }
    },
    [allStations],
  );

  return (
    <View style={styles.container}>
      <WebView
        style={StyleSheet.absoluteFillObject}
        source={{ html: mapHtml }}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleMapMessage}
      />

      <View style={styles.topOverlay} pointerEvents="box-none">
        <View style={styles.headerRow}>
          <View style={styles.searchCard}>
            {isSearching ? (
              <View style={styles.searchInputWrap}>
                <IconSymbol name="search" size={16} color="#6C7CA6" />
                <TextInput
                  autoFocus
                  placeholder="Search stations"
                  placeholderTextColor="#8B97B2"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchInput}
                />
              </View>
            ) : (
              <Pressable
                style={styles.searchPlaceholder}
                onPress={() => setIsSearching(true)}
              >
                <IconSymbol name="search" size={16} color="#6C7CA6" />
                <Text style={styles.searchPlaceholderText}>
                  Search stations
                </Text>
              </Pressable>
            )}
          </View>
          <Pressable
            style={styles.walletCard}
            onPress={() => setWalletOpen(true)}
          >
            <Text style={styles.walletText}>
              {(walletData?.currency ?? "INR") === "INR" ? "₹" : ""}
              {walletData?.balance ?? 0}
            </Text>
          </Pressable>
        </View>
        {isSearching ? (
          <Pressable
            onPress={() => {
              setIsSearching(false);
              setSearchQuery("");
            }}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        ) : null}
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
                style={[
                  styles.sheetTabText,
                  activeTab === tab && styles.sheetTabTextActive,
                ]}
              >
                {tab === "all"
                  ? "All"
                  : tab === "available"
                    ? "Available"
                    : "Favorites"}
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
          {isLoading || isFetching ? (
            <Text style={styles.emptyText}>Loading charging stations...</Text>
          ) : null}

          {!isLoading && !isFetching && stations.length === 0 ? (
            <Text style={styles.emptyText}>
              No charging stations match the current filters.
            </Text>
          ) : null}

          {stations.map((station) => {
            const isLiked = likedStations.includes(station.id);
            const isSelected = selectedStationId === station.id;
            const hasCoordinates =
              typeof station.latitude === "number" &&
              typeof station.longitude === "number";

            return (
              <Pressable
                key={station.id}
                onPress={() => {
                  setSelectedStationId(station.id);
                  setInfoStation(station);
                }}
                style={[
                  styles.stationCard,
                  isSelected && styles.stationCardSelected,
                ]}
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
                      style={[
                        styles.circleIcon,
                        !hasCoordinates && styles.circleIconDisabled,
                      ]}
                      onPress={(event) => {
                        event.stopPropagation();
                        openDirections(station);
                      }}
                      disabled={!hasCoordinates}
                    >
                      <IconSymbol name="directions" size={14} color="#0F6A6A" />
                    </Pressable>
                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation();
                        setInfoStation(station);
                      }}
                      style={styles.circleIcon}
                    >
                      <Text style={styles.circleText}>i</Text>
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
                  <Text style={styles.stationMeta}>
                    {station.connectorSummary}
                  </Text>
                </View>
                <View style={styles.tagRow}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{station.model}</Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{station.vendor}</Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>
                      {station.connectorCount} connectors
                    </Text>
                  </View>
                  {!hasCoordinates ? (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>No map location</Text>
                    </View>
                  ) : null}
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
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setInfoStation(null)}
        >
          <Pressable style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {infoStation?.name ?? "Station"}
              </Text>
              <Pressable onPress={() => setInfoStation(null)}>
                <IconSymbol name="xmark" size={16} color="#1A2850" />
              </Pressable>
            </View>
            <Text style={styles.modalAddress}>{infoStation?.address}</Text>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Status</Text>
              <Text style={styles.modalValue}>
                {infoStation?.availabilityLabel ?? "Unknown"}
              </Text>
            </View>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Connectors</Text>
              <Text style={styles.modalValue}>
                {infoStation?.connectorSummary ?? "Unknown"}
              </Text>
            </View>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Model</Text>
              <Text style={styles.modalValue}>
                {infoStation?.model ?? "Unknown"}
              </Text>
            </View>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Vendor</Text>
              <Text style={styles.modalValue}>
                {infoStation?.vendor ?? "Unknown"}
              </Text>
            </View>
            <Pressable
              style={[
                styles.directionButton,
                (!infoStation ||
                  typeof infoStation.latitude !== "number" ||
                  typeof infoStation.longitude !== "number") &&
                  styles.directionButtonDisabled,
              ]}
              onPress={() => infoStation && openDirections(infoStation)}
              disabled={
                !infoStation ||
                typeof infoStation.latitude !== "number" ||
                typeof infoStation.longitude !== "number"
              }
            >
              <Text style={styles.directionButtonText}>Get Directions</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={walletOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setWalletOpen(false)}
      >
        <View style={styles.walletModal}>
          <WalletContent
            onBack={() => setWalletOpen(false)}
            onAddMoney={() => router.push("/profile/add-money")}
            onTransactions={() => router.push("/profile/transactions")}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F6FB" },
  topOverlay: {
    position: "absolute",
    top: 40,
    left: 16,
    right: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(40, 92, 153, 0.12)",
    shadowColor: "#0B2A5E",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  searchPlaceholder: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchPlaceholderText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#6C7CA6",
  },
  walletCard: {
    marginLeft: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: V.borderNavy,
    shadowColor: V.shadowNavy,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  walletText: {
    fontSize: 13,
    fontWeight: "800",
    color: V.primary,
  },
  searchInputWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#0F172A",
    paddingVertical: 0,
  },
  cancelButton: {
    marginTop: 8,
    alignSelf: "flex-end",
  },
  cancelText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F6A6A",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 104,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "rgba(40, 92, 153, 0.12)",
  },
  sheetTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "rgba(40, 92, 153, 0.1)",
  },
  sheetScroll: {},
  sheetTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  sheetTabText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7B8AB0",
  },
  sheetTabTextActive: {
    color: "#0F172A",
  },
  tabActive: {},
  tabLine: {
    marginTop: 8,
    width: "70%",
    height: 3,
    borderRadius: 999,
    backgroundColor: "#21B3A7",
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 190,
  },
  stationCard: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "rgba(40, 92, 153, 0.12)",
  },
  stationCardSelected: {
    backgroundColor: "rgba(33, 179, 167, 0.08)",
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  stationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stationName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#13233D",
    paddingRight: 12,
  },
  stationActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  circleIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#C6D4EA",
    alignItems: "center",
    justifyContent: "center",
  },
  circleIconDisabled: {
    opacity: 0.4,
  },
  circleText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6C7CA6",
  },
  stationAddress: {
    marginTop: 6,
    fontSize: 12,
    color: "#6C7CA6",
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  statusBadge: {
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: "700",
  },
  statusBadgeAvailable: {
    color: "#0F6A6A",
    backgroundColor: "rgba(33, 179, 167, 0.14)",
  },
  statusBadgeUnavailable: {
    color: "#A93F4D",
    backgroundColor: "rgba(224, 88, 106, 0.14)",
  },
  stationMeta: {
    marginLeft: 8,
    fontSize: 12,
    color: "#0F6A6A",
    fontWeight: "600",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    backgroundColor: "#F1F6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#62739A",
  },
  emptyText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6C7CA6",
    paddingVertical: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#13233D",
    paddingRight: 12,
  },
  modalAddress: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#6C7CA6",
  },
  modalRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8B97B2",
  },
  modalValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1A2850",
  },
  directionButton: {
    marginTop: 18,
    backgroundColor: V.primary,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  directionButtonDisabled: {
    opacity: 0.45,
  },
  directionButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  walletModal: {
    flex: 1,
    backgroundColor: "#F3F6FB",
  },
});
