import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { useGetChargingSessionsQuery } from "@/charging/charging.api";
import { isSessionLive } from "@/charging/sessionStatus";
import { useTabScreenInsets } from "@/hooks/use-tab-screen-insets";
import { useWebContentPadding } from "@/hooks/use-web-content-padding";
import { V } from "@/theme/vajra";
import { IconSymbol } from "components/ui/icon-symbol";
import { PulsingLiveDot } from "components/vajra/PulsingLiveDot";

const formatDateTime = (value: string | null) => {
  if (!value) return "--";
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

type ChargingSessionItem = {
  id: string;
  charger_id: string;
  connector_id: number;
  start_time: string;
  end_time: string | null;
  energy_kwh: number;
  cost: number;
  status: string;
};

type RecentProps = {
  showHeader?: boolean;
  topPadding?: number;
  withContainer?: boolean;
};

export function RecentContent({
  showHeader = true,
  topPadding,
  withContainer = true,
}: RecentProps) {
  const router = useRouter();
  const tabInsets = useTabScreenInsets();
  const webPadding = useWebContentPadding();
  const resolvedTop = topPadding ?? tabInsets.top;
  const listBottom = tabInsets.bottom;
  const {
    data: activeSessions,
    isError: activeError,
    refetch,
    isFetching,
  } = useGetChargingSessionsQuery(
    {
      status: "all",
    },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );
  const sessions = useMemo(
    () => (Array.isArray(activeSessions) ? activeSessions : []),
    [activeSessions],
  );
  const liveSession = useMemo(
    () => sessions.find((session) => isSessionLive(session.status)),
    [sessions],
  );
  const liveFields = useMemo(() => {
    if (!liveSession) {
      return null;
    }
    return {
      startedAt: liveSession.start_time,
      stationName: liveSession.charger_id,
      location: `Connector ${liveSession.connector_id}`,
      energyKwh: liveSession.energy_kwh,
      durationMin: Math.max(
        0,
        Math.round(
          (Date.now() - new Date(liveSession.start_time).getTime()) / 60000,
        ),
      ),
      batteryStartPct: undefined,
      batteryEndPct: undefined,
    };
  }, [liveSession]);
  const listSessions = useMemo(
    () => sessions.filter((session) => session.id !== liveSession?.id),
    [sessions, liveSession?.id],
  );

  const openDetails = (sessionId: string) => {
    router.push({ pathname: "/recent/[id]", params: { id: sessionId } });
  };

  const renderSession = (item: ChargingSessionItem) => {
    const durationMin = Math.max(
      0,
      Math.round(
        ((item.end_time ? new Date(item.end_time) : new Date()).getTime() -
          new Date(item.start_time).getTime()) /
          60000,
      ),
    );
    const title = isSessionLive(item.status)
      ? "Live Charging"
      : "Charging Session";
    const isLive = isSessionLive(item.status);
    return (
    <Pressable onPress={() => openDetails(item.id)} style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardRow}>
          <View style={styles.iconWrap}>
            <IconSymbol name="bolt.fill" size={22} color={V.primary} />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardMeta}>
              {item.charger_id} • Connector {item.connector_id}
            </Text>
            <View style={styles.cardFoot}>
              <Text style={styles.cardValue}>
                {(item.energy_kwh ?? 0).toFixed(2)} kWh
              </Text>
              <Text style={styles.cardDot}>•</Text>
              <Text style={styles.cardValue}>
                ₹{(item.cost ?? 0).toFixed(2)}
              </Text>
              <Text style={styles.cardDot}>•</Text>
              <Text style={styles.cardValue}>{durationMin} min</Text>
            </View>
          </View>
        </View>
        <View
          style={[
            styles.sessionStatusPill,
            isLive ? styles.sessionStatusLive : styles.sessionStatusDone,
          ]}
        >
          <Text
            style={isLive ? styles.sessionStatusLiveText : styles.sessionStatusDoneText}
          >
            {isLive ? "Live" : "Done"}
          </Text>
        </View>
      </View>
      <Text style={styles.cardTime}>
        {formatDateTime(item.start_time)}
        {item.end_time ? ` - ${formatDateTime(item.end_time)}` : ""}
      </Text>
    </Pressable>
    );
  };

  const listHeader = (
    <>
      {showHeader ? (
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.header}>Charging Sessions</Text>
            <Text style={styles.subheader}>
              Live status and past activity
            </Text>
          </View>
          <Pressable
            onPress={() => refetch()}
            disabled={isFetching}
            style={[styles.refreshBtn, isFetching && styles.refreshBtnDisabled]}
          >
            <Text style={styles.refreshBtnText}>
              {isFetching ? "Refreshing..." : "Refresh"}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {activeError ? (
        <Text style={styles.errorBanner}>
          Unable to load sessions. Try refreshing.
        </Text>
      ) : null}

      {liveSession && liveFields ? (
              <View style={styles.liveWrap}>
                <Text style={styles.sectionLabel}>Live now</Text>
                <Pressable
                  onPress={() => openDetails(liveSession.id)}
                  style={styles.liveCard}
                >
                  <View style={styles.liveHeader}>
                    <View style={styles.liveBadge}>
                      <View style={styles.liveBadgeInner}>
                        <PulsingLiveDot />
                        <Text style={styles.liveBadgeText}>Charging</Text>
                      </View>
                    </View>
                    <Text style={styles.liveTime}>
                      {formatDateTime(liveFields.startedAt)}
                    </Text>
                  </View>
                  <Text style={styles.liveTitle}>{liveFields.stationName}</Text>
                  <Text style={styles.liveMeta}>{liveFields.location}</Text>
                  <View style={styles.liveStats}>
                    <View>
                      <Text style={styles.statLabel}>Energy</Text>
                      <Text style={styles.statValue}>
                        {(liveSession.energy_kwh ?? 0).toFixed(2)} kWh
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.statLabel}>Duration</Text>
                      <Text style={styles.statValue}>
                        {liveFields.durationMin} min
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.statLabel}>Cost</Text>
                      <Text style={styles.statValue}>
                        ₹{(liveSession.cost ?? 0).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              </View>
            ) : null}
            {liveSession && listSessions.length > 0 ? (
              <Text style={[styles.sectionLabel, styles.pastSessionsLabel]}>
                Past sessions
              </Text>
            ) : null}
    </>
  );

  const content = (
    <FlatList
      style={Platform.OS === "web" ? styles.webList : undefined}
      data={listSessions}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        styles.list,
        Platform.OS === "web"
          ? {
              paddingTop: webPadding.scrollPaddingTop,
              paddingHorizontal: webPadding.paddingHorizontal,
              width: webPadding.width,
              alignSelf: webPadding.alignSelf,
            }
          : null,
        { paddingBottom: listBottom },
      ]}
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={refetch} />
      }
      ListHeaderComponent={listHeader}
      ListFooterComponent={
          sessions.length === 0 && !activeError ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No sessions yet.</Text>
              <Pressable
                onPress={() => router.push("/qr")}
                style={styles.emptyCta}
              >
                <Text style={styles.emptyCtaText}>Start your first session</Text>
              </Pressable>
            </View>
          ) : null
        }
      renderItem={({ item }) => renderSession(item)}
    />
  );

  if (!withContainer) {
    return content;
  }

  if (Platform.OS === "web") {
    return (
      <View style={styles.webPage}>
        {content}
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: resolvedTop }]}>
      {content}
    </View>
  );
}

export default function Recent() {
  return <RecentContent />;
}

const styles = StyleSheet.create({
  webPage: {
    flex: 1,
    minHeight: 0,
    backgroundColor: V.pageBg,
  },
  webList: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: V.pageBg,
    paddingHorizontal: V.appPadH,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: V.headingDeep,
  },
  subheader: {
    fontSize: 14,
    fontWeight: "600",
    color: V.bodySecondary,
    marginTop: 6,
    marginBottom: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  titleBlock: {
    flex: 1,
  },
  refreshBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: V.borderNavy,
    backgroundColor: V.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  refreshBtnDisabled: {
    opacity: 0.5,
  },
  refreshBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: V.heading,
  },
  pastSessionsLabel: {
    marginTop: 4,
  },
  errorBanner: {
    marginBottom: 16,
    padding: 16,
    borderRadius: V.radiusCard,
    fontSize: 14,
    fontWeight: "600",
    color: V.error,
    backgroundColor: "#FEF2F2",
  },
  emptyCard: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: V.borderNavy,
    backgroundColor: V.card,
    ...V.shadowCard,
  },
  emptyCta: {
    marginTop: 16,
    borderRadius: V.radiusPill,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: V.primary,
  },
  emptyCtaText: {
    fontSize: 14,
    fontWeight: "700",
    color: V.card,
  },
  list: {},
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: V.label,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "600",
    color: V.label,
    textAlign: "center",
    marginBottom: 4,
  },
  liveWrap: {
    marginBottom: 12,
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
    alignItems: "center",
    justifyContent: "space-between",
  },
  liveBadge: {
    borderRadius: 999,
    paddingHorizontal: 2,
    paddingVertical: 2,
    backgroundColor: "rgba(33, 179, 167, 0.12)",
  },
  liveBadgeInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  liveBadgeText: {
    color: "#0F6A6A",
    fontSize: 12,
    fontWeight: "700",
  },
  liveTime: {
    fontSize: 12,
    color: V.bodySecondary,
    fontWeight: "600",
  },
  liveTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  liveMeta: {
    marginTop: 4,
    color: "#60739A",
    fontSize: 13,
    fontWeight: "600",
  },
  liveStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  statLabel: {
    fontSize: 11,
    color: "#8B97B2",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "700",
    color: "#1A2850",
  },
  card: {
    backgroundColor: V.card,
    borderRadius: V.radiusPanel,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: V.borderNavy,
    ...V.shadowCard,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8,
  },
  sessionStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: V.radiusPill,
  },
  sessionStatusLive: {
    backgroundColor: V.tealMuted,
  },
  sessionStatusLiveText: {
    fontSize: 11,
    fontWeight: "700",
    color: V.tealBadgeText,
  },
  sessionStatusDone: {
    backgroundColor: V.sessionDoneBg,
  },
  sessionStatusDoneText: {
    fontSize: 11,
    fontWeight: "700",
    color: V.sessionDoneLabel,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: V.tealMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#13233D",
  },
  cardMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "#6C7CA6",
    fontWeight: "600",
  },
  cardFoot: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  cardValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1A2850",
  },
  cardDot: {
    marginHorizontal: 8,
    color: "#A1AEC8",
    fontWeight: "700",
  },
  cardTime: {
    marginTop: 12,
    color: "#5E6F8F",
    fontSize: 12,
    fontWeight: "600",
  },
});
