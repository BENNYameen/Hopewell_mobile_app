/**
 * Home dashboard — parity with Vajra web `src/pages/DashboardPage.tsx`
 * (`/charging/active`, live card, empty state, History / Wallet links).
 */
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import {
  useGetActiveChargingSessionQuery,
  useStopChargingMutation,
} from "@/charging/charging.api";
import { useChargingSocket } from "@/charging/charging.socket";
import { isSessionLive, sessionStatusLabel } from "@/charging/sessionStatus";
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
  const { data: me } = useGetMeQuery();
  const { refetch: refetchWallet } = useGetWalletBalanceQuery();
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

  useFocusEffect(
    useCallback(() => {
      refetchActive();
      refetchWallet();
    }, [refetchActive, refetchWallet]),
  );

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

  const firstName = useMemo(() => {
    const raw = me?.full_name?.trim() ?? "";
    if (!raw) return "";
    return raw.split(/\s+/)[0] ?? "";
  }, [me?.full_name]);

  const greetingText =
    firstName.length > 0 ? `Hello, ${firstName} 👋` : "Hello 👋";

  const hasLoadError = isError;

  const onStopCharging = async () => {
    if (!liveSession) return;
    Alert.alert(
      "Stop charging?",
      "End this session from the app?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Stop",
          style: "destructive",
          onPress: async () => {
            try {
              await stopCharging({ session_id: liveSession.id }).unwrap();
              refetchActive();
            } catch {
              Alert.alert(
                "Could not stop",
                "Try again or finish from the charger.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => {
              refetchActive();
              refetchWallet();
            }}
            tintColor={V.primary}
          />
        }
      >
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
                <Text style={styles.liveTitle}>
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
                <Text style={styles.statValue}>
                  {energy.toFixed(2)} kWh
                </Text>
              </View>
              <View style={styles.statBlock}>
                <Text style={styles.statLabel}>Duration</Text>
                <Text style={styles.statValue}>{dur} min</Text>
              </View>
              <View style={styles.statBlock}>
                <Text style={styles.statLabel}>Cost</Text>
                <Text style={styles.statValue}>₹{cost.toFixed(2)}</Text>
              </View>
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
              {liveStatus === "charging" ? (
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
            <View
              style={[
                styles.emptyIcon,
                Platform.OS === "web" ? styles.emptyIconWeb : null,
              ]}
            >
              <IconSymbol
                name="bolt.fill"
                size={32}
                color={Platform.OS === "web" ? "#FFFFFF" : V.primary}
              />
            </View>
            <Text style={styles.emptyTitle}>No active session</Text>
            <Text style={styles.emptyBody}>
              Enter the charger ID to begin a session.
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
              <Text style={styles.metricValue}>Past sessions</Text>
            </Pressable>
            <Pressable
              style={styles.metricCard}
              onPress={() => router.push("/profile/wallet")}
            >
              <Text style={styles.metricLabel}>Wallet</Text>
              <Text style={styles.metricValue}>Balance & top up</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: V.pageBg,
  },
  scroll: {
    paddingHorizontal: V.appPadH,
    paddingTop: 20,
    paddingBottom: 128,
  },
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
  },
  liveHeaderRight: {
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
  emptyIconWeb: {
    backgroundColor: "#2EC6C9",
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
    alignItems: "center",
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
});
