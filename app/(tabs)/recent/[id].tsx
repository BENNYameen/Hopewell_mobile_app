import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import {
  Alert,
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useGetChargingSessionQuery,
  useStopChargingMutation,
} from "@/charging/charging.api";
import { useChargingSocket } from "@/charging/charging.socket";
import { V } from "@/theme/vajra";
import { IconSymbol } from "components/ui/icon-symbol";

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

  const shouldConnect =
    session?.status === "charging" || session?.status === "starting";
  const { data: liveData } = useChargingSocket(
    shouldConnect ? sessionId : null,
    shouldConnect,
  );
  const [stopCharging, { isLoading: isStopping, error: stopError }] =
    useStopChargingMutation();
  const liveEnergy = liveData?.energy_kwh ?? session?.energy_kwh;
  const liveCost = liveData?.cost ?? session?.cost;
  const liveStatus = liveData?.status ?? session?.status;
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

  useEffect(() => {
    if (liveStatus !== "charging") {
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

  const confirmStopCharging = () => {
    Alert.alert(
      "Stop charging",
      "Are you sure you want to stop this session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Stop",
          style: "destructive",
          onPress: async () => {
            if (!sessionId) {
              return;
            }
            try {
              await stopCharging({ session_id: sessionId }).unwrap();
              refetch();
            } catch {
              // error message handled inline
            }
          },
        },
      ],
    );
  };

  if (!sessionId) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Session not found</Text>
        <Pressable
          onPress={() => router.replace("/recent")}
          style={styles.backBtn}
        >
          <IconSymbol name="arrow.left" size={18} color={V.headingDeep} />
        </Pressable>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Loading session...</Text>
      </View>
    );
  }

  if (isError || !session) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>
          {isNotFound ? "Session not found" : "Unable to load session"}
        </Text>
        <Pressable
          onPress={() => router.replace("/recent")}
          style={styles.backBtn}
        >
          <IconSymbol name="arrow.left" size={18} color={V.headingDeep} />
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={refetch} />
      }
    >
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.replace("/recent")}
          style={styles.backBtn}
        >
          <IconSymbol name="arrow.left" size={18} color={V.headingDeep} />
        </Pressable>
        <Text style={styles.topTitle}>Session details</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.iconWrap}>
            <IconSymbol name="bolt.fill" size={26} color={V.primary} />
          </View>
          <View style={styles.summaryText}>
            <Text style={styles.summaryTitle}>
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
              {liveStatus === "charging" ? (
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
                {liveStatus === "charging" ? "Charging" : "Completed"}
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
          <Text style={styles.gridValue}>--</Text>
        </View>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>Connector</Text>
        <Text style={styles.detailValue}>Connector {session.connector_id}</Text>
      </View>
      {liveStatus === "charging" ? (
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: V.pageBg,
  },
  content: {
    paddingHorizontal: V.appPadH,
    paddingTop: 40,
    paddingBottom: 140,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    color: V.headingDeep,
    paddingTop: 40,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  topBarSpacer: {
    flex: 1,
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
});
