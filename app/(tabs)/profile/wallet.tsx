import { Platform, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { useRouter } from "expo-router";

import { useThemedStyles, useVajraColors } from "@/hooks/use-vajra-colors";
import type { VajraColors } from "@/theme/vajra-colors";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { ProfileSubScreen } from "components/vajra/ProfileSubScreen";
import { IconSymbol } from "components/ui/icon-symbol";
import { useGetWalletBalanceQuery } from "@/wallet/wallet.api";

type WalletContentProps = {
  containerStyle?: ViewStyle;
  onAddMoney?: () => void;
  onTransactions?: () => void;
};

export function WalletContent({
  containerStyle,
  onAddMoney,
  onTransactions,
}: WalletContentProps) {
  const colors = useVajraColors();
  const styles = useThemedStyles(createWalletStyles);
  const { data, isLoading, isError } = useGetWalletBalanceQuery();

  const balanceText = isLoading
    ? "..."
    : isError
      ? "--"
      : `₹ ${Number(data?.balance ?? 0).toFixed(2)}`;

  return (
    <View style={[styles.container, containerStyle]}>
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
        <IconSymbol name="arrow.right" size={18} color={colors.heading} />
      </Pressable>
    </View>
  );
}

export default function Wallet() {
  const router = useRouter();
  const { refetch, isFetching } = useGetWalletBalanceQuery();
  const { refreshControl } = usePullToRefresh(refetch, isFetching);

  return (
    <ProfileSubScreen title="My Wallet" refreshControl={refreshControl}>
      <WalletContent
        onAddMoney={() => router.push("/profile/add-money")}
        onTransactions={() => router.push("/profile/transactions")}
      />
    </ProfileSubScreen>
  );
}

const createWalletStyles = (V: VajraColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
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
