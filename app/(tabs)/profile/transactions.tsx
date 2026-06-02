import { Pressable, StyleSheet, Text, View } from "react-native";

import { ProfileSubScreen } from "components/vajra/ProfileSubScreen";
import { V } from "@/theme/vajra";
import { useGetWalletTransactionsQuery } from "@/wallet/wallet.api";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { IconSymbol } from "components/ui/icon-symbol";

const formatDateTime = (value: string) => {
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

export default function Transactions() {
  const { data, isLoading, isError, refetch, isFetching } =
    useGetWalletTransactionsQuery(50);
  const { refreshControl } = usePullToRefresh(refetch, isFetching);

  return (
    <ProfileSubScreen title="Transactions" refreshControl={refreshControl}>
      {isError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            Unable to load transactions. Please try again.
          </Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={styles.list}>
        {isLoading ? (
          <Text style={styles.body}>Loading...</Text>
        ) : data && data.length > 0 ? (
          data.map((item) => (
            <View key={item.id} style={styles.txCard}>
              <View style={styles.txIconWrap}>
                <IconSymbol name="creditcard.fill" size={18} color={V.primary} />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txTitle}>{item.description}</Text>
                <Text style={styles.txMeta}>
                  {item.transaction_type} · {formatDateTime(item.created_at)}
                </Text>
              </View>
              <Text
                style={[
                  styles.txAmount,
                  item.transaction_type === "DEBIT"
                    ? styles.txDebit
                    : styles.txCredit,
                ]}
              >
                {item.transaction_type === "DEBIT" ? "−" : "+"}
                ₹{item.amount}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.body}>No transactions yet.</Text>
        )}
      </View>
    </ProfileSubScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  body: {
    fontSize: 14,
    fontWeight: "600",
    color: V.bodySecondary,
  },
  errorBox: {
    backgroundColor: V.errorSurface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: V.errorBorder,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "600",
    color: V.error,
  },
  retryButton: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: V.error,
    borderRadius: V.radiusPill,
  },
  retryText: {
    color: V.card,
    fontSize: 12,
    fontWeight: "700",
  },
  txCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: V.card,
    borderRadius: V.radiusCard,
    borderWidth: 1,
    borderColor: V.borderNavy,
    padding: 14,
    gap: 12,
    ...V.shadowCard,
  },
  txIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: V.tealMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  txInfo: {
    flex: 1,
    gap: 4,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: V.headingDeep,
  },
  txMeta: {
    fontSize: 12,
    fontWeight: "600",
    color: V.label,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: "800",
  },
  txDebit: {
    color: V.error,
  },
  txCredit: {
    color: V.primary,
  },
});
