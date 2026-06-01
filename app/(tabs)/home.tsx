/**
 * Home dashboard — parity with Vajra web `src/pages/DashboardPage.tsx`
 * (`/charging/active`, live card, empty state, History / Wallet links).
 */
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTabScreenInsets } from "@/hooks/use-tab-screen-insets";
import { TabScreen } from "components/vajra/TabScreen";
import { useFocusEffect } from "@react-navigation/native";

import {
  useGetActiveChargingSessionQuery,
  useGetChargingSessionsQuery,
  useStopChargingMutation,
} from "@/charging/charging.api";
import { useGetChargersQuery } from "@/charging/stations.api";
import { useChargingSocket } from "@/charging/charging.socket";
import { isSessionLive, sessionStatusLabel } from "@/charging/sessionStatus";
import { confirmAction, showAlert } from "@/utils/confirmAction";
import { useGetMeQuery } from "@/profile/profile.api";
import { useGetWalletBalanceQuery } from "@/wallet/wallet.api";
import { V } from "@/theme/vajra";
import { IconSymbol } from "components/ui/icon-symbol";
import { PulsingLiveDot } from "components/vajra/PulsingLiveDot";

const formatDateTime = (value: string | null) => {
  if (!value) return "Live session";
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  const day = parsed.toLocaleString("en-GB", { day: "2-digit" });
  const month = parsed.toLocaleString("en-GB", { month: "short" });
  const time = parsed.toLocaleString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${day} ${month}, ${time.toUpperCase()}`;
};

function durationMin(startTime: string, liveSec?: number | null) {
  if (liveSec != null && liveSec >= 0) {
    return Math.max(0, Math.round(liveSec / 60));
  }
  return Math.max(
    0,
    Math.round((Date.now() - new Date(startTime).getTime()) / 60_000),
  );
}

export default function HomeDashboard() {
  const router = useRouter();
  const { bottom: tabBottom } = useTabScreenInsets();
  const googleMapsApiKey =
    Constants.expoConfig?.extra?.googleMapsApiKey ??
    Constants.manifest2?.extra?.expoClient?.extra?.googleMapsApiKey ??
    "";
  const { data: me } = useGetMeQuery();
  const {
    data: wallet,
    isLoading: walletLoading,
    refetch: refetchWallet,
  } = useGetWalletBalanceQuery();
  const {
    data: sessionsData,
    isLoading: sessionsLoading,
    refetch: refetchSessions,
  } = useGetChargingSessionsQuery({ status: "all" });
  const { data: stations = [] } = useGetChargersQuery();
  const {
    data: activeSession,
    refetch: refetchActive,
    isFetching,
    isLoading,
    isError,
  } = useGetActiveChargingSessionQuery(undefined, {
    pollingInterval: 15_000,
  });
  const [stopCharging, { isLoading: stopping }] = useStopChargingMutation();
  const [showStopConfirm, setShowStopConfirm] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refetchActive();
      refetchWallet();
      refetchSessions();
    }, [refetchActive, refetchWallet, refetchSessions]),
  );

  const walletSummary = useMemo(() => {
    if (walletLoading) return "...";
    if (!wallet) return "--";
    const symbol = wallet.currency === "INR" ? "₹" : wallet.currency;
    return `${symbol} ${Number(wallet.balance).toFixed(2)}`;
  }, [wallet, walletLoading]);

  const historySummary = useMemo(() => {
    if (sessionsLoading) return "...";
    const list = Array.isArray(sessionsData) ? sessionsData : [];
    const pastCount = list.filter((s) => !isSessionLive(s.status)).length;
    if (pastCount === 0) return "No sessions yet";
    return pastCount === 1 ? "1 session" : `${pastCount} sessions`;
  }, [sessionsData, sessionsLoading]);

  const liveSession = activeSession ?? null;
  const isLive = liveSession ? isSessionLive(liveSession.status) : false;
  const { data: wsData, connected: wsConnected } = useChargingSocket(
    liveSession?.id ?? null,
    !!liveSession && isLive,
  );

  const liveStatus = wsData?.status ?? liveSession?.status ?? "";
  const energy = wsData?.energy_kwh ?? liveSession?.energy_kwh ?? 0;
  const cost = wsData?.cost ?? liveSession?.cost ?? 0;
  const dur = liveSession
    ? durationMin(liveSession.start_time, wsData?.duration_sec)
    : 0;
  const battery =
    wsData?.battery_display ??
    (wsData?.battery_current_percentage != null
      ? `${wsData.battery_current_percentage}%`
      : null);

  const firstName = useMemo(() => {
    const raw = me?.full_name?.trim() ?? "";
    if (!raw) return "";
    return raw.split(/\s+/)[0] ?? "";
  }, [me?.full_name]);

  const greetingText =
    firstName.length > 0 ? `Hello, ${firstName} 👋` : "Hello 👋";

  const hasLoadError = isError;
  const mappableStations = useMemo(
    () =>
      stations.filter(
        (station) =>
          typeof station.latitude === "number" &&
          typeof station.longitude === "number",
      ),
    [stations],
  );
  const mapPreviewUrl = useMemo(() => {
    if (Platform.OS === "web") return null;
    if (mappableStations.length === 0 || !googleMapsApiKey) return null;
    const center = mappableStations[0];
    const previewMarkers = mappableStations
      .slice(0, 8)
      .map((station) => `${station.latitude},${station.longitude}`)
      .join("|");
    return `https://maps.googleapis.com/maps/api/staticmap?size=1200x480&scale=2&zoom=12&maptype=roadmap&center=${center.latitude},${center.longitude}&markers=color:0x21B3A7%7C${previewMarkers}&key=${googleMapsApiKey}`;
  }, [googleMapsApiKey, mappableStations]);
  const webPreviewPoints = useMemo(() => {
    if (Platform.OS !== "web" || mappableStations.length === 0) return [];
    const pts = mappableStations.slice(0, 20);
    const lats = pts.map((s) => s.latitude as number);
    const lngs = pts.map((s) => s.longitude as number);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latRange = Math.max(0.0001, maxLat - minLat);
    const lngRange = Math.max(0.0001, maxLng - minLng);
    return pts.map((s) => ({
      id: s.id,
      x: Math.min(98, Math.max(2, (((s.longitude as number) - minLng) / lngRange) * 100)),
      y: Math.min(98, Math.max(2, (1 - ((s.latitude as number) - minLat) / latRange) * 100)),
      available: s.isAvailable,
    }));
  }, [mappableStations]);

  const canStopSession =
    isSessionLive(liveStatus) && liveStatus !== "stopping";

  const onStopCharging = async () => {
    if (!liveSession || !canStopSession) return;
    if (Platform.OS === "web") {
      setShowStopConfirm(true);
      return;
    }
    const confirmed = await confirmAction(
      "Stop charging?",
      "End this session from the app?",
      "Stop",
    );
    if (!confirmed) return;
    try {
      await stopCharging({ session_id: liveSession.id }).unwrap();
      refetchActive();
    } catch {
      showAlert("Could not stop", "Try again or finish from the charger.");
    }
  };

  const handleConfirmStop = async () => {
    if (!liveSession) return;
    try {
      await stopCharging({ session_id: liveSession.id }).unwrap();
      setShowStopConfirm(false);
      refetchActive();
    } catch {
      setShowStopConfirm(false);
      showAlert("Could not stop", "Try again or finish from the charger.");
    }
  };

  const refreshControl = (
    <RefreshControl
      refreshing={isFetching}
      onRefresh={() => {
        refetchActive();
        refetchWallet();
        refetchSessions();
      }}
      tintColor={V.primary}
    />
  );

  const dashboardBody = (
    <>
      <Text style={styles.greeting}>{greetingText}</Text>
      <Text style={styles.subtitle}>
        {liveSession
          ? "You have an active charging session."
          : "No active session right now."}
      </Text>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={V.primary} />
        </View>
      ) : null}

      {hasLoadError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>
            Unable to load session status. Try refreshing.
          </Text>
        </View>
      ) : null}

      {!isLoading && liveSession ? (
        <View style={styles.liveCard}>
          <View style={styles.liveHeader}>
            <View style={styles.liveBadge}>
              <PulsingLiveDot />
              <Text style={styles.liveBadgeText}>
                {sessionStatusLabel(liveStatus || liveSession.status)}
              </Text>
            </View>
            <View style={styles.liveHeaderRight}>
              <Text style={styles.liveTime}>
                {formatDateTime(liveSession.start_time)}
              </Text>
              {isLive ? (
                <Text
                  style={
                    wsConnected ? styles.syncLiveDot : styles.syncSyncing
                  }
                >
                  {wsConnected ? "● Live" : "○ Syncing"}
                </Text>
              ) : null}
            </View>
          </View>
          <View style={styles.liveRow}>
            <View style={styles.chargerIcon}>
              <IconSymbol name="bolt.fill" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.liveMain}>
              <Text style={styles.liveTitle} numberOfLines={1}>
                {wsData?.charger_name ?? liveSession.charger_id}
              </Text>
              <Text style={styles.liveMeta}>
                Connector {liveSession.connector_id}
              </Text>
            </View>
          </View>
          <View style={styles.statsStrip}>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Energy</Text>
              <Text style={styles.statValue}>{energy.toFixed(2)} kWh</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Duration</Text>
              <Text style={styles.statValue}>{dur} min</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Cost</Text>
              <Text style={styles.statValue}>₹{cost.toFixed(2)}</Text>
            </View>
            {battery ? (
              <View style={styles.statBlock}>
                <Text style={styles.statLabel}>Battery</Text>
                <Text style={styles.statValue}>{battery}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.liveActions}>
            <Pressable
              style={styles.btnOutline}
              onPress={() =>
                router.push({
                  pathname: "/recent/[id]",
                  params: { id: liveSession.id },
                })
              }
            >
              <Text style={styles.btnOutlineText}>View details</Text>
            </Pressable>
            {canStopSession ? (
              <Pressable
                style={[styles.btnStop, stopping && styles.btnDisabled]}
                onPress={onStopCharging}
                disabled={stopping}
              >
                {stopping ? (
                  <ActivityIndicator color={V.card} size="small" />
                ) : (
                  <Text style={styles.btnStopText}>Stop Charging</Text>
                )}
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}

      {!isLoading && !liveSession && !hasLoadError ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <IconSymbol name="bolt.fill" size={32} color={V.primary} />
          </View>
          <Text style={styles.emptyTitle}>No active session</Text>
          <Text style={styles.emptyBody}>
            Scan the charger QR code or enter the charger ID to begin.
          </Text>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.push("/qr")}
          >
            <Text style={styles.primaryBtnText}>Start Charging</Text>
          </Pressable>
        </View>
      ) : null}

      {!isLoading ? (
        <View style={styles.metricsRow}>
          <Pressable
            style={styles.metricCard}
            onPress={() => router.push("/recent")}
          >
            <Text style={styles.metricLabel}>History</Text>
            <Text style={styles.metricValue} numberOfLines={1}>
              {historySummary}
            </Text>
          </Pressable>
          <Pressable
            style={styles.metricCard}
            onPress={() => router.push("/profile/wallet")}
          >
            <Text style={styles.metricLabel}>Wallet</Text>
            <Text style={styles.metricValue} numberOfLines={1}>
              {walletSummary}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.mapCard}>
        <Text style={styles.mapTitle}>Nearby Chargers</Text>
        {Platform.OS === "web" ? (
          <View style={styles.mapPreview}>
            {webPreviewPoints.map((point) => (
              <View
                key={point.id}
                style={[
                  styles.webDot,
                  {
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    backgroundColor: point.available ? "#21B3A7" : "#E0586A",
                  },
                ]}
              />
            ))}
          </View>
        ) : mapPreviewUrl ? (
          <Image
            source={{ uri: mapPreviewUrl }}
            resizeMode="cover"
            style={styles.mapPreview}
          />
        ) : (
          <View style={styles.mapFallback}>
            <Text style={styles.mapFallbackText}>
              {mappableStations.length === 0
                ? "Map preview unavailable. Charger locations are missing."
                : "Map preview unavailable. Add Google Maps API key to show it."}
            </Text>
          </View>
        )}
        <Pressable style={styles.mapCta} onPress={() => router.push("/map")}>
          <Text style={styles.mapCtaText}>Open Full Map</Text>
        </Pressable>
      </View>
    </>
  );

  return (
    <>
      <TabScreen
        scroll
        refreshControl={refreshControl}
        contentContainerStyle={
          Platform.OS !== "web" ? { paddingBottom: tabBottom } : undefined
        }
      >
        {dashboardBody}
      </TabScreen>
      <Modal
        visible={Platform.OS === "web" && showStopConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStopConfirm(false)}
      >
        <Pressable
          style={styles.confirmBackdrop}
          onPress={() => setShowStopConfirm(false)}
        >
          <Pressable style={styles.confirmCard} onPress={() => null}>
            <Text style={styles.confirmTitle}>Stop charging?</Text>
            <Text style={styles.confirmText}>
              End this session from the app?
            </Text>
            <View style={styles.confirmActions}>
              <Pressable
                style={styles.confirmCancel}
                onPress={() => setShowStopConfirm(false)}
                disabled={stopping}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmStop, stopping && styles.btnDisabled]}
                disabled={stopping}
                onPress={handleConfirmStop}
              >
                <Text style={styles.confirmStopText}>
                  {stopping ? "Stopping..." : "Stop"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: V.headingDeep,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: V.bodySecondary,
    marginBottom: 22,
  },
  loadingWrap: {
    paddingVertical: 48,
    alignItems: "center",
  },
  errorBanner: {
    borderRadius: V.radiusCard,
    padding: 16,
    marginBottom: 16,
    backgroundColor: V.errorSurface,
    borderWidth: 1,
    borderColor: V.errorBorder,
  },
  errorBannerText: {
    fontSize: 14,
    fontWeight: "600",
    color: V.error,
  },
  liveCard: {
    backgroundColor: V.card,
    borderRadius: V.radiusCard,
    padding: 16,
    borderWidth: 1,
    borderColor: V.borderNavy,
    ...V.shadowCardEmphasis,
  },
  liveHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  liveHeaderRight: {
    flexShrink: 0,
    alignItems: "flex-end",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: V.tealMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: V.radiusPill,
  },
  liveBadgeText: {
    color: V.tealBadgeText,
    fontSize: 12,
    fontWeight: "700",
  },
  liveTime: {
    fontSize: 12,
    color: V.bodySecondary,
    fontWeight: "600",
  },
  syncLiveDot: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "700",
    color: V.primary,
  },
  syncSyncing: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "700",
    color: V.label,
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  chargerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2EC6C9",
    alignItems: "center",
    justifyContent: "center",
  },
  liveMain: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  liveTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: V.headingMuted,
  },
  liveMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: V.bodySecondary,
  },
  statsStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    paddingTop: 4,
  },
  statBlock: {
    flex: 1,
    minWidth: 0,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: V.label,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statValue: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: V.heading,
  },
  liveActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  btnOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: V.borderNavy,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: V.card,
  },
  btnOutlineText: {
    fontSize: 14,
    fontWeight: "700",
    color: V.heading,
  },
  btnStop: {
    flex: 1,
    backgroundColor: V.heading,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnStopText: {
    fontSize: 14,
    fontWeight: "700",
    color: V.card,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  emptyCard: {
    backgroundColor: V.card,
    borderRadius: V.radiusCard,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: V.borderNavy,
    ...V.shadowCard,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: V.tealMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: V.headingDeep,
  },
  emptyBody: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: V.bodySecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  primaryBtn: {
    marginTop: 18,
    alignSelf: "stretch",
    backgroundColor: V.primary,
    borderRadius: V.radiusPill,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: V.card,
    fontSize: 14,
    fontWeight: "700",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 26,
  },
  metricCard: {
    flex: 1,
    backgroundColor: V.card,
    borderRadius: V.radiusPanel,
    padding: 16,
    borderWidth: 1,
    borderColor: V.borderNavy,
    ...V.shadowCard,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: V.label,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  metricValue: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: V.headingDeep,
  },
  mapCard: {
    marginTop: 18,
    backgroundColor: V.card,
    borderRadius: V.radiusCard,
    padding: 14,
    borderWidth: 1,
    borderColor: V.borderNavy,
    ...V.shadowCard,
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: V.headingDeep,
    marginBottom: 10,
  },
  mapPreview: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: "#E7EEF8",
  },
  webDot: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 999,
    marginLeft: -4.5,
    marginTop: -4.5,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  mapFallback: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: "#E7EEF8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  mapFallbackText: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    color: V.bodySecondary,
    lineHeight: 18,
  },
  mapCta: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: V.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: V.radiusPill,
  },
  mapCtaText: {
    color: V.card,
    fontSize: 13,
    fontWeight: "700",
  },
  confirmBackdrop: {
    flex: 1,
    backgroundColor: "rgba(11, 18, 39, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  confirmCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: V.borderNavy,
    backgroundColor: V.card,
    padding: 18,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: V.headingDeep,
  },
  confirmText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "500",
    color: V.bodySecondary,
  },
  confirmActions: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  confirmCancel: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: V.borderNavy,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F5F7FB",
  },
  confirmCancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: V.headingDeep,
  },
  confirmStop: {
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: V.error,
  },
  confirmStopText: {
    fontSize: 14,
    fontWeight: "700",
    color: V.card,
  },
});
