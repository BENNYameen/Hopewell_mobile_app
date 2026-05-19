import { useRouter } from "expo-router";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { TabScreen } from "components/vajra/TabScreen";
import { V } from "@/theme/vajra";
import { useGetWalletTransactionsQuery } from "@/wallet/wallet.api";
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
  const router = useRouter();
  const { data, isLoading, isError, refetch } =
    useGetWalletTransactionsQuery(50);

  return (
    <TabScreen
      header={
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <IconSymbol name="arrow.left" size={18} color={V.headingDeep} />
          </Pressable>
          <Text
            style={[
              styles.title,
              Platform.OS === "web" ? styles.titleWeb : null,
            ]}
          >
            Transactions
          </Text>
          <Pressable style={styles.refreshButton} onPress={() => refetch()}>
            <Text style={styles.refreshText}>Refresh</Text>
          </Pressable>
        </View>
      }
    >
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
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    ...Platform.select({
      web: {
        gap: 12,
        justifyContent: "flex-start",
      },
      default: {
        justifyContent: "space-between",
      },
    }),
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: V.headingDeep,
  },
  titleWeb: {
    flex: 1,
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
  body: {
    fontSize: 14,
    color: V.bodySecondary,
    fontWeight: "600",
    textAlign: "center",
    paddingTop: 48,
  },
  list: {
    paddingTop: 6,
  },
  txCard: {
    backgroundColor: V.card,
    borderRadius: V.radiusCard,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: V.borderNavy,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...V.shadowCard,
  },
  txIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: V.tealMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: V.headingMuted,
  },
  txMeta: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "600",
    color: V.bodySecondary,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: "800",
  },
  txCredit: {
    color: V.primary,
  },
  txDebit: {
    color: V.error,
  },
  errorBox: {
    backgroundColor: V.errorSurface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: V.errorBorder,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "600",
    color: V.error,
  },
  retryButton: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: V.error,
    borderRadius: 999,
  },
  retryText: {
    color: V.card,
    fontSize: 12,
    fontWeight: "700",
  },
});
