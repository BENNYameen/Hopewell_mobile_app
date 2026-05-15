import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

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
    <View style={styles.container}>
      <Pressable style={styles.backRow} onPress={() => router.back()}>
        <IconSymbol name="arrow.left" size={18} color="#0F172A" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <Text style={styles.title}>Transactions</Text>
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
      <ScrollView contentContainerStyle={styles.list}>
        {isLoading ? (
          <Text style={styles.body}>Loading...</Text>
        ) : data && data.length > 0 ? (
          data.map((item) => (
            <View key={item.id} style={styles.txCard}>
              <View>
                <Text style={styles.txTitle}>{item.description}</Text>
                <Text style={styles.txMeta}>
                  {item.transaction_type} · {formatDateTime(item.created_at)}
                </Text>
              </View>
              <Text style={styles.txAmount}>
                {item.currency} {item.amount}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.body}>No transactions yet.</Text>
        )}
      </ScrollView>
    </View>
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
    marginBottom: 16,
  },
  backText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#1A2850",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    color: "#6C7CA6",
    fontWeight: "600",
  },
  list: {
    paddingTop: 6,
    paddingBottom: 120,
  },
  txCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(40, 92, 153, 0.12)",
  },
  txTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#13233D",
  },
  txMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#6C7CA6",
  },
  txAmount: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "700",
    color: "#0F6A6A",
  },
  errorBox: {
    backgroundColor: "#FFECEE",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F5B6BE",
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#C81D2C",
  },
  retryButton: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#E11D2E",
    borderRadius: 999,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
