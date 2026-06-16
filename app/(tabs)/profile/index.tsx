import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useThemedStyles, useVajraColors } from "@/hooks/use-vajra-colors";
import type { VajraColors } from "@/theme/vajra-colors";
import { TabScreen } from "components/vajra/TabScreen";
import { ProfileScreenHeader } from "components/vajra/ProfileScreenHeader";
import { useGetMeQuery } from "@/profile/profile.api";
import { useGetWalletBalanceQuery } from "@/wallet/wallet.api";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { IconSymbol } from "components/ui/icon-symbol";

type RowId =
  | "personal"
  | "appearance"
  | "wallet"
  | "charging-history"
  | "transactions"
  | "logout";

type RowItem = {
  id: RowId;
  label: string;
  value?: string;
  danger?: boolean;
};

const PROFILE_ITEMS: RowItem[] = [
  { id: "personal", label: "Personal info" },
  { id: "appearance", label: "Appearance" },
  { id: "wallet", label: "Wallet" },
  { id: "charging-history", label: "Charging history" },
  { id: "transactions", label: "Transactions" },
  { id: "logout", label: "Log out", danger: true },
];

const ROUTES = {
  personal: "/profile/personal",
  appearance: "/profile/appearance",
  wallet: "/profile/wallet",
  "charging-history": "/profile/charging-history",
  transactions: "/profile/transactions",
  logout: "/profile/logout",
} as const;

export default function Profile() {
  const router = useRouter();
  const colors = useVajraColors();
  const styles = useThemedStyles(createStyles);
  const { data, refetch: refetchMe, isFetching: meFetching } = useGetMeQuery();
  const {
    data: walletData,
    isLoading: walletLoading,
    refetch: refetchWallet,
    isFetching: walletFetching,
  } = useGetWalletBalanceQuery();

  const { refreshControl } = usePullToRefresh(
    [refetchMe, refetchWallet],
    meFetching || walletFetching,
  );

  const walletText = walletLoading
    ? "Loading..."
    : walletData
      ? `${walletData.currency === "INR" ? "₹" : walletData.currency} ${Number(walletData.balance).toFixed(2)}`
      : "--";

  const openScreen = useCallback(
    (id: RowId) => {
      router.push(ROUTES[id]);
    },
    [router],
  );

  return (
    <TabScreen
      refreshControl={refreshControl}
      header={<ProfileScreenHeader title="Account" showBack={false} />}
    >
        <View style={styles.identity}>
          <Text style={styles.name}>{data?.full_name ?? "Your name"}</Text>
          <Text style={styles.email}>
            {data?.email ?? data?.phone_number ?? ""}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.card}>
          {PROFILE_ITEMS.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => openScreen(item.id)}
              style={[
                styles.row,
                index === PROFILE_ITEMS.length - 1 && styles.rowLast,
              ]}
            >
              <Text
                style={[
                  styles.rowLabel,
                  item.danger && styles.rowLabelDanger,
                ]}
              >
                {item.label}
              </Text>
              <View style={styles.rowRight}>
                {item.id === "wallet" ? (
                  <Text style={styles.rowValue}>{walletText}</Text>
                ) : null}
                {!item.danger ? (
                  <IconSymbol name="chevron.right" size={18} color={colors.label} />
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>

        <Text style={styles.footNote}>
          {Platform.OS === "web"
            ? "Vajra Volt Web - same account, all devices"
            : "Vajra Volt Web · same account, all devices"}
        </Text>
    </TabScreen>
  );
}

const createStyles = (V: VajraColors) =>
  StyleSheet.create({
    identity: {
      marginBottom: 20,
    },
    name: {
      fontSize: 20,
      fontWeight: "700",
      color: V.headingDeep,
    },
    email: {
      marginTop: 4,
      fontSize: 14,
      fontWeight: "600",
      color: V.bodySecondary,
    },
    sectionTitle: {
      marginTop: 4,
      marginBottom: 8,
      fontSize: 16,
      fontWeight: "700",
      color: V.headingDeep,
    },
    card: {
      backgroundColor: V.card,
      borderRadius: V.radiusPanel,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: V.borderNavy,
      ...V.shadowCard,
      marginBottom: 18,
    },
    rowLabelDanger: {
      color: V.error,
    },
    footNote: {
      marginTop: 24,
      fontSize: 10,
      fontWeight: "600",
      color: V.label,
      textAlign: "center",
      lineHeight: 14,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderColor: V.borderHairline,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    rowLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: V.headingMuted,
    },
    rowRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    rowValue: {
      fontSize: 13,
      fontWeight: "600",
      color: V.label,
    },
  });
