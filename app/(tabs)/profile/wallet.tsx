import { Platform, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTabScreenInsets } from "@/hooks/use-tab-screen-insets";
import { V } from "@/theme/vajra";
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
    : `₹ ${Number(data?.balance ?? 0).toFixed(2)}`;

  return (
    <View style={[styles.container, containerStyle]}>
      {showBack ? (
        <Pressable style={styles.backBtn} onPress={onBack}>
          <IconSymbol name="arrow.left" size={18} color={V.headingDeep} />
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
        <Pressable
          style={[
            styles.addButton,
            Platform.OS === "web" ? styles.addButtonWeb : styles.addButtonNative,
          ]}
          onPress={onAddMoney}
        >
          {Platform.OS === "web" ? (
            <>
              <Text style={styles.addPlus}>+</Text>
              <Text style={styles.addTextWeb}>Add money</Text>
            </>
          ) : (
            <Text style={styles.addTextNative}>+ Add money</Text>
          )}
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
  const { top, bottom, horizontal } = useTabScreenInsets();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <WalletContent
        showBack={Platform.OS !== "web"}
        onBack={() => router.back()}
        onAddMoney={() => router.push("/profile/add-money")}
        onTransactions={() => router.push("/profile/transactions")}
        containerStyle={{
          paddingTop: top,
          paddingBottom: bottom,
          paddingHorizontal: horizontal,
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: V.pageBg,
  },
  container: {
    flex: 1,
    backgroundColor: V.pageBg,
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
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: V.headingDeep,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  refreshButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: V.borderNavy,
    backgroundColor: V.card,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: "700",
    color: V.heading,
  },
  card: {
    backgroundColor: V.primaryHover,
    borderRadius: V.radiusWallet,
    padding: 24,
    overflow: "hidden",
    shadowColor: V.primary,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  cardGlow: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  cardLabel: {
    color: "rgba(255, 255, 255, 0.80)",
    fontSize: 14,
    fontWeight: "500",
  },
  cardValue: {
    marginTop: 8,
    fontSize: 36,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  addButton: {
    marginTop: 20,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  addButtonWeb: {
    backgroundColor: "#FFFFFF",
    borderWidth: 0,
  },
  addButtonNative: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.30)",
  },
  addPlus: {
    fontSize: 16,
    fontWeight: "800",
    color: V.primary,
  },
  addTextWeb: {
    fontSize: 13,
    fontWeight: "600",
    color: V.primary,
  },
  addTextNative: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
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
    color: V.heading,
    marginRight: 6,
  },
});
