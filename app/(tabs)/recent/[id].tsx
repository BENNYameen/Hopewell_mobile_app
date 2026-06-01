import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { TabScreen } from "components/vajra/TabScreen";

import {
  useGetChargingSessionQuery,
  useStopChargingMutation,
} from "@/charging/charging.api";
import { useChargingSocket, type ChargingUpdate } from "@/charging/charging.socket";
import { isSessionLive, sessionStatusLabel } from "@/charging/sessionStatus";
import { confirmAction, showAlert } from "@/utils/confirmAction";
import { V } from "@/theme/vajra";
import { IconSymbol } from "components/ui/icon-symbol";

const STOP_REASON_LABELS: Record<string, string> = {
  LOW_WALLET_BALANCE: "Wallet spending limit reached",
  EVDisconnected: "Cable unplugged",
  Local: "Cable unplugged",
  Remote: "Charging stopped",
  EmergencyStop: "Emergency stop triggered",
  PowerLoss: "Power loss at station",
  MISSING_STOP_TRANSACTION: "No response from charger",
  CHARGER_OFFLINE: "Charger went offline",
  START_TIMEOUT: "Session failed to start",
};

const getStopReasonLabel = (reason?: string) =>
  (reason && STOP_REASON_LABELS[reason]) ?? (reason ? "Charging stopped" : "");

const formatDateTime = (value: string | null) => {
  if (!value) {
    return "Live session";
  }
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

const getDurationMinutes = (start: string, end: string | null) => {
  const startMs = new Date(start).getTime();
  const endMs = end ? new Date(end).getTime() : Date.now();
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    return "--";
  }
  return Math.max(0, Math.round((endMs - startMs) / 60000));
};

const formatNumber = (value: number | null | undefined, decimals = 2) => {
  if (value == null || Number.isNaN(value)) {
    return "--";
  }
  return Number(value).toFixed(decimals);
};

export default function SessionDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = typeof id === "string" ? id : "";
  const {
    data: session,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useGetChargingSessionQuery(sessionId, {
    skip: !sessionId,
  });

  const shouldConnect = session ? isSessionLive(session.status) : false;
  const { data: liveData } = useChargingSocket(
    shouldConnect ? sessionId : null,
    shouldConnect,
  );
  const [stopCharging, { isLoading: isStopping, error: stopError }] =
    useStopChargingMutation();
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [autoStopEvent, setAutoStopEvent] = useState<ChargingUpdate | null>(null);
  const [stoppedEvent, setStoppedEvent] = useState<ChargingUpdate | null>(null);
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const liveEnergy = liveData?.energy_kwh ?? session?.energy_kwh;
  const liveCost = liveData?.cost ?? session?.cost;
  const liveBattery =
    liveData?.battery_display ??
    (liveData?.battery_current_percentage != null
      ? `${liveData.battery_current_percentage}%`
      : null);
  // Filter out special informational events that are not session status changes
  const liveStatusRaw = liveData?.status;
  const isSpecialEvent =
    liveStatusRaw === "AUTO_STOP_WALLET_LIMIT_REACHED";
  const liveStatus = isSpecialEvent
    ? session?.status ?? ""
    : (liveStatusRaw ?? session?.status ?? "");
  const liveDurationMin =
    liveData?.duration_sec != null
      ? Math.max(0, Math.round(liveData.duration_sec / 60))
      : null;
  const durationMin = useMemo(() => {
    if (!session?.start_time) {
      return "--";
    }
    if (liveDurationMin != null) {
      return liveDurationMin;
    }
    return getDurationMinutes(session.start_time, session.end_time);
  }, [session?.start_time, session?.end_time, liveDurationMin]);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const batteryBarAnim = useRef(new Animated.Value(0)).current;
  const batteryTextAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pct = liveData?.battery_current_percentage ?? 0;
    Animated.timing(batteryBarAnim, {
      toValue: pct,
      duration: 900,
      useNativeDriver: false,
      easing: Easing.out(Easing.quad),
    }).start();
  }, [liveData?.battery_current_percentage, batteryBarAnim]);

  useEffect(() => {
    if (!liveBattery) return;
    batteryTextAnim.setValue(0.3);
    Animated.timing(batteryTextAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [liveBattery, batteryTextAnim]);

  useEffect(() => {
    if (!isSessionLive(liveStatus)) {
      pulseAnim.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [liveStatus, pulseAnim]);
  useEffect(() => {
    if (!liveData) return;
    if (liveData.status === "AUTO_STOP_WALLET_LIMIT_REACHED") {
      setAutoStopEvent(liveData);
    } else if (liveData.status === "stopped") {
      setStoppedEvent(liveData);
      setAutoStopEvent(null);
      setShowSessionSummary(true);
      refetch();
    }
  }, [liveData, refetch]);

  const errorStatus =
    typeof error === "object" && error
      ? "status" in error
        ? error.status
        : "originalStatus" in error
          ? error.originalStatus
          : undefined
      : undefined;
  const isNotFound =
    errorStatus === 404 ||
    (typeof errorStatus === "string" && errorStatus.includes("404"));
  const stopErrorMessage =
    typeof stopError === "object" &&
    stopError &&
    "data" in stopError &&
    (stopError as { data?: { error?: string } }).data?.error
      ? ((stopError as { data?: { error?: string } }).data?.error ??
        "Unable to stop charging.")
      : stopError
        ? "Unable to stop charging."
        : "";

  const confirmStopCharging = async () => {
    if (!sessionId) return;
    if (Platform.OS === "web") {
      setShowStopConfirm(true);
      return;
    }
    const confirmed = await confirmAction(
      "Stop charging",
      "Are you sure you want to stop this session?",
      "Stop",
    );
    if (!confirmed) return;
    try {
      await stopCharging({ session_id: sessionId }).unwrap();
      refetch();
    } catch {
      // error message handled inline via stopErrorMessage
    }
  };

  const handleConfirmStop = async () => {
    if (!sessionId) return;
    try {
      await stopCharging({ session_id: sessionId }).unwrap();
      setShowStopConfirm(false);
      refetch();
    } catch {
      setShowStopConfirm(false);
      showAlert("Could not stop", "Try again or finish from the charger.");
    }
  };

  if (!sessionId) {
    return (
      <TabScreen
        header={
          <Pressable
            onPress={() => router.replace("/recent")}
            style={styles.backBtn}
          >
            <IconSymbol name="arrow.left" size={18} color={V.headingDeep} />
          </Pressable>
        }
      >
        <Text style={styles.stateMessage}>Session not found</Text>
      </TabScreen>
    );
  }

  if (isLoading) {
    return (
      <TabScreen>
        <Text style={styles.stateMessage}>Loading session...</Text>
      </TabScreen>
    );
  }

  if (isError || !session) {
    return (
      <TabScreen
        header={
          <Pressable
            onPress={() => router.replace("/recent")}
            style={styles.backBtn}
          >
            <IconSymbol name="arrow.left" size={18} color={V.headingDeep} />
          </Pressable>
        }
      >
        <Text style={styles.stateMessage}>
          {isNotFound ? "Session not found" : "Unable to load session"}
        </Text>
      </TabScreen>
    );
  }

  return (
    <>
    <TabScreen
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={refetch} />
      }
      header={
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.replace("/recent")}
            style={styles.backBtn}
          >
            <IconSymbol name="arrow.left" size={18} color={V.headingDeep} />
          </Pressable>
          <Text style={styles.topTitle} numberOfLines={1}>
            Session details
          </Text>
          <Pressable
            onPress={refetch}
            style={styles.backBtn}
            disabled={isFetching}
          >
            {isFetching ? (
              <ActivityIndicator size="small" color={V.primary} />
            ) : (
              <IconSymbol name="arrow.clockwise" size={16} color={V.headingDeep} />
            )}
          </Pressable>
        </View>
      }
    >
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.iconWrap}>
            <IconSymbol name="bolt.fill" size={26} color={V.primary} />
          </View>
          <View style={styles.summaryText}>
            <Text style={styles.summaryTitle} numberOfLines={2}>
              {liveData?.charger_name ?? session.charger_id}
            </Text>
            <Text style={styles.summaryMeta}>
              Connector {session.connector_id}
            </Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Status</Text>
          <View style={styles.statusPill}>
            <View style={styles.statusRow}>
              {isSessionLive(liveStatus) ? (
                <Animated.View
                  style={[
                    styles.statusDot,
                    {
                      opacity: pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.35, 1],
                      }),
                      transform: [
                        {
                          scale: pulseAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1.15],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              ) : null}
              <Text style={styles.statusText}>
                {sessionStatusLabel(liveStatus)}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Started</Text>
          <Text style={styles.summaryValue}>
            {formatDateTime(session.start_time)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Ended</Text>
          <Text style={styles.summaryValue}>
            {formatDateTime(session.end_time)}
          </Text>
        </View>
      </View>

      {autoStopEvent && !showSessionSummary ? (
        <View style={styles.autoStopBanner}>
          <IconSymbol name="exclamationmark.triangle.fill" size={15} color={V.error} />
          <Text style={styles.autoStopBannerText}>
            Spending limit reached, stopping...
          </Text>
        </View>
      ) : null}

      <View style={styles.grid}>
        <View style={styles.gridCard}>
          <Text style={styles.gridLabel}>Energy</Text>
          <Text style={styles.gridValue}>{formatNumber(liveEnergy)} kWh</Text>
        </View>
        <View style={styles.gridCard}>
          <Text style={styles.gridLabel}>Duration</Text>
          <Text style={styles.gridValue}>{durationMin} min</Text>
        </View>
        <View style={styles.gridCard}>
          <Text style={styles.gridLabel}>Cost</Text>
          <Text style={styles.gridValue}>
            ₹{formatNumber(liveCost ?? session.cost)}
          </Text>
        </View>
        <View style={styles.gridCard}>
          <Text style={styles.gridLabel}>Battery</Text>
          <Animated.Text style={[styles.gridValue, { opacity: batteryTextAnim }]}>
            {liveBattery ?? "--"}
          </Animated.Text>
          {liveData?.battery_current_percentage != null ? (
            <View style={styles.batteryBar}>
              <Animated.View
                style={[
                  styles.batteryBarFill,
                  {
                    width: batteryBarAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                    }),
                    backgroundColor:
                      (liveData.battery_current_percentage ?? 0) < 20
                        ? V.error
                        : V.primary,
                  },
                ]}
              />
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>Connector</Text>
        <Text style={styles.detailValue}>Connector {session.connector_id}</Text>
      </View>
      {isSessionLive(liveStatus) && liveStatus !== "stopping" ? (
        <View style={styles.actionWrap}>
          <Pressable
            style={[styles.primaryBtn, isStopping && styles.primaryBtnDisabled]}
            onPress={confirmStopCharging}
            disabled={isStopping}
          >
            <Text style={styles.primaryText}>
              {isStopping ? "Stopping..." : "Stop Charging"}
            </Text>
          </Pressable>
          {stopErrorMessage ? (
            <Text style={styles.errorText}>{stopErrorMessage}</Text>
          ) : null}
        </View>
      ) : null}
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
          <Text style={styles.confirmTitle}>Stop charging</Text>
          <Text style={styles.confirmText}>
            Are you sure you want to stop this session?
          </Text>
          <View style={styles.confirmActions}>
            <Pressable
              style={styles.confirmCancel}
              onPress={() => setShowStopConfirm(false)}
              disabled={isStopping}
            >
              <Text style={styles.confirmCancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.confirmStop, isStopping && styles.primaryBtnDisabled]}
              disabled={isStopping}
              onPress={handleConfirmStop}
            >
              <Text style={styles.confirmStopText}>
                {isStopping ? "Stopping..." : "Stop"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>

    {/* Session summary bottom sheet — appears when WebSocket sends "stopped" */}
    <Modal
      visible={showSessionSummary}
      transparent
      animationType="slide"
      onRequestClose={() => setShowSessionSummary(false)}
    >
      <View style={styles.summaryBackdrop}>
        <View style={styles.summarySheet}>
          <View style={styles.summarySheetDragBar} />

          <View style={styles.summarySheetHeader}>
            <View style={styles.summarySheetIconWrap}>
              <IconSymbol name="bolt.fill" size={28} color={V.primary} />
            </View>
            <Text style={styles.summarySheetTitle}>Charging Complete</Text>
            <Text style={styles.summarySheetSubtitle}>
              {stoppedEvent?.charger_name ?? session?.charger_id ?? ""}
            </Text>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryGridCard}>
              <Text style={styles.summaryGridLabel}>Energy Used</Text>
              <Text style={styles.summaryGridValue}>
                {formatNumber(stoppedEvent?.energy_kwh ?? liveEnergy)} kWh
              </Text>
            </View>
            <View style={styles.summaryGridCard}>
              <Text style={styles.summaryGridLabel}>Amount Charged</Text>
              <Text style={styles.summaryGridValue}>
                ₹{formatNumber(stoppedEvent?.cost ?? liveCost)}
              </Text>
            </View>
            <View style={styles.summaryGridCard}>
              <Text style={styles.summaryGridLabel}>Duration</Text>
              <Text style={styles.summaryGridValue}>{durationMin} min</Text>
            </View>
            <View style={styles.summaryGridCard}>
              <Text style={styles.summaryGridLabel}>Wallet Balance</Text>
              <Text style={styles.summaryGridValue}>
                {session?.wallet_after != null
                  ? `₹${formatNumber(session.wallet_after)}`
                  : "--"}
              </Text>
            </View>
          </View>

          {stoppedEvent?.reason ? (
            <View style={styles.summaryReasonRow}>
              <Text style={styles.summaryReasonText}>
                {getStopReasonLabel(stoppedEvent.reason)}
              </Text>
            </View>
          ) : null}

          <Pressable
            style={styles.summaryDoneBtn}
            onPress={() => setShowSessionSummary(false)}
          >
            <Text style={styles.summaryDoneText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  stateMessage: {
    fontSize: 16,
    fontWeight: "600",
    color: V.bodySecondary,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  topTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: V.headingDeep,
    textAlign: "center",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: V.borderNavy,
    backgroundColor: V.card,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCard: {
    backgroundColor: V.card,
    borderRadius: V.radiusCard,
    padding: 16,
    borderWidth: 1,
    borderColor: V.borderNavy,
    ...V.shadowCardEmphasis,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: V.tealMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: V.primary,
  },
  summaryText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: V.headingMuted,
  },
  summaryMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: V.bodySecondary,
  },
  summaryRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: V.bodySecondary,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: "700",
    color: V.heading,
  },
  statusPill: {
    backgroundColor: V.tealMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: V.radiusPill,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: V.tealBadgeText,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: V.tealBadgeText,
  },
  grid: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridCard: {
    width: "48%",
    backgroundColor: V.card,
    borderRadius: V.radiusPanel,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: V.borderNavy,
    ...V.shadowCard,
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: V.label,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  gridValue: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "700",
    color: V.heading,
  },
  batteryBar: {
    marginTop: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: V.borderNavy,
    overflow: "hidden",
  },
  batteryBarFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: V.primary,
  },
  detailCard: {
    backgroundColor: V.card,
    borderRadius: V.radiusPanel,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: V.borderNavy,
    ...V.shadowCard,
  },
  detailTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: V.label,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  detailValue: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "700",
    color: V.heading,
  },
  actionWrap: {
    marginTop: 20,
    marginBottom: 24,
  },
  primaryBtn: {
    backgroundColor: V.error,
    paddingVertical: 14,
    borderRadius: V.radiusPill,
    alignItems: "center",
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryText: {
    color: V.card,
    fontSize: 14,
    fontWeight: "700",
  },
  errorText: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "600",
    color: V.error,
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

  // Auto-stop wallet limit banner
  autoStopBanner: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: V.errorSurface,
    borderWidth: 1,
    borderColor: V.errorBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  autoStopBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: V.error,
  },

  // Session summary bottom sheet
  summaryBackdrop: {
    flex: 1,
    backgroundColor: "rgba(11, 18, 39, 0.55)",
    justifyContent: "flex-end",
  },
  summarySheet: {
    backgroundColor: V.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 48,
    borderTopWidth: 1,
    borderTopColor: V.borderNavy,
  },
  summarySheetDragBar: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: V.borderNavyMedium,
    marginBottom: 20,
  },
  summarySheetHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  summarySheetIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: V.tealMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: V.primary,
    marginBottom: 12,
  },
  summarySheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: V.headingDeep,
  },
  summarySheetSubtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: V.bodySecondary,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  summaryGridCard: {
    width: "48%",
    backgroundColor: V.panelTint,
    borderRadius: V.radiusPanel,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: V.borderNavy,
  },
  summaryGridLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: V.label,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  summaryGridValue: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: V.heading,
  },
  summaryReasonRow: {
    marginBottom: 16,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  summaryReasonText: {
    fontSize: 13,
    fontWeight: "600",
    color: V.bodySecondary,
    textAlign: "center",
  },
  summaryDoneBtn: {
    backgroundColor: V.primary,
    paddingVertical: 14,
    borderRadius: V.radiusPill,
    alignItems: "center",
    marginTop: 4,
  },
  summaryDoneText: {
    color: V.card,
    fontSize: 15,
    fontWeight: "700",
  },
});
