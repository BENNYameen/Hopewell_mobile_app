import { FlatList, StyleSheet, Text, View } from "react-native";

import { IconName } from "components/ui/icon-names";
import { IconSymbol } from "components/ui/icon-symbol";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useGetNotificationsQuery } from "@/profile/profile.api";

type NotificationProps = {
  embedded?: boolean;
};

export default function Notification({ embedded = false }: NotificationProps) {
  const { data: notifications = [], refetch, isFetching } = useGetNotificationsQuery();
  const { refreshControl } = usePullToRefresh(refetch, isFetching);

  return (
    <View style={[styles.container, embedded && styles.containerEmbedded]}>
      {embedded ? null : (
        <>
          <View pointerEvents="none" style={styles.glowTop} />
          <View pointerEvents="none" style={styles.glowBottom} />
        </>
      )}

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.subheader}>Charging updates and payments</Text>
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        style={embedded ? styles.listFlex : undefined}
        contentContainerStyle={styles.list}
        refreshControl={refreshControl}
        ListEmptyComponent={
          <Text style={styles.empty}>No notifications yet</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconWrap}>
              <IconSymbol
                name={item.icon as IconName}
                size={28}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.textBlock}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.time}>
                {new Date(item.created_at).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </Text>
            </View>

            {item.read_at === null ? <View style={styles.unreadDot} /> : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6FB",
    paddingHorizontal: 16,
  },
  containerEmbedded: {
    flex: 1,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subheader: {
    fontSize: 14,
    color: "#60739A",
    marginTop: 6,
    marginBottom: 16,
  },
  clearAll: {
    fontSize: 13,
    fontWeight: "700",
    color: "#21B3A7",
  },
  clearAllDisabled: {
    color: "#A7B4CC",
  },
  list: {
    paddingBottom: 32,
  },
  listFlex: {
    flex: 1,
  },
  empty: {
    textAlign: "center",
    color: "#8B97B2",
    marginTop: 32,
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(40, 92, 153, 0.12)",
    shadowColor: "#0B2A5E",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#2EC6C9",
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    color: "#13233D",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  time: {
    color: "#5E6F8F",
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#21B3A7",
    marginLeft: 8,
  },
  glowTop: {
    position: "absolute",
    top: -120,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(73, 155, 255, 0.22)",
  },
  glowBottom: {
    position: "absolute",
    bottom: -140,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(46, 198, 201, 0.18)",
  },
});
