import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { useRouter } from "expo-router";

import { IconSymbol } from "components/ui/icon-symbol";
import { useGetWalletBalanceQuery } from "@/wallet/wallet.api";

type WalletContentProps = {
  showBack?: boolean;
  onBack?: () => void;
  containerStyle?: ViewStyle;
  onAddMoney?: () => void;
  onTransactions?: () => void;
};

export function WalletContent({
  showBack = true,
  onBack,
  containerStyle,
  onAddMoney,
  onTransactions,
}: WalletContentProps) {
  const { data, isLoading, isError, isFetching, refetch } =
    useGetWalletBalanceQuery();

  const balanceText = isLoading
    ? "..."
    : isError
    ? "--"
    : `${data?.currency ?? "INR"} ${data?.balance ?? 0}`;

  return (
    <View style={[styles.container, containerStyle]}>
      {showBack ? (
        <Pressable style={styles.backRow} onPress={onBack}>
          <IconSymbol name="arrow.left" size={18} color="#0F172A" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      ) : null}

      <View style={styles.titleRow}>
        <Text style={styles.title}>My Wallet</Text>
        <Pressable onPress={refetch} style={styles.refreshButton}>
          <Text style={styles.refreshText}>
            {isFetching ? "Refreshing..." : "Refresh"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.cardGlow} />
        <Text style={styles.cardLabel}>Current balance</Text>
        <Text style={styles.cardValue}>{balanceText}</Text>
        <Pressable style={styles.addButton} onPress={onAddMoney}>
          <View style={styles.addIcon}>
            <IconSymbol name="plus" size={14} color="#D11D2E" />
          </View>
          <Text style={styles.addText}>Add money</Text>
        </Pressable>
      </View>

      <Pressable style={styles.transactionsRow} onPress={onTransactions}>
        <Text style={styles.transactionsText}>View All Transactions</Text>
        <IconSymbol name="arrow.right" size={18} color="#1A2850" />
      </Pressable>
    </View>
  );
}

export default function Wallet() {
  const router = useRouter();

  return (
    <WalletContent
      onBack={() => router.back()}
      onAddMoney={() => router.push("/profile/add-money")}
      onTransactions={() => router.push("/profile/transactions")}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6FB",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  backText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#1A2850",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  refreshButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(26, 40, 80, 0.15)",
    backgroundColor: "#FFFFFF",
  },
  refreshText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1A2850",
  },
  card: {
    backgroundColor: "#1E9FA3",
    borderRadius: 22,
    padding: 22,
    overflow: "hidden",
  },
  cardGlow: {
    position: "absolute",
    right: -80,
    top: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },
  cardLabel: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 14,
    fontWeight: "600",
  },
  cardValue: {
    marginTop: 10,
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  addButton: {
    marginTop: 20,
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  addIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(33, 179, 167, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  addText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A7F7C",
  },
  transactionsRow: {
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  transactionsText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A2850",
    marginRight: 6,
  },
});
