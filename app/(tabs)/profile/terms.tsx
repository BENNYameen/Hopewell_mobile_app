import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "components/ui/icon-symbol";

export default function TermsOfService() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Pressable style={styles.backRow} onPress={() => router.back()}>
        <IconSymbol name="arrow.left" size={18} color="#0F172A" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.updated}>Effective date: April 22, 2026</Text>

        <Text style={styles.sectionTitle}>Use of service</Text>
        <Text style={styles.body}>
          You agree to use the app only for lawful charging, payment, and
          account activity and to provide accurate account details.
        </Text>

        <Text style={styles.sectionTitle}>Account responsibility</Text>
        <Text style={styles.body}>
          You are responsible for all actions performed through your account and
          for maintaining the confidentiality of your login credentials.
        </Text>

        <Text style={styles.sectionTitle}>Charging and payments</Text>
        <Text style={styles.body}>
          Charging availability and pricing may vary by station. Wallet top-ups
          and payment settlement are processed by approved payment partners.
        </Text>

        <Text style={styles.sectionTitle}>Service availability</Text>
        <Text style={styles.body}>
          We may update, suspend, or modify features for maintenance, security,
          or regulatory reasons.
        </Text>

        <Text style={styles.sectionTitle}>Contact</Text>
        <Text style={styles.body}>
          For terms-related queries, contact
          {"\n"}care@vajarvolt.com
        </Text>
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
  content: {
    paddingBottom: 40,
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
    marginBottom: 4,
  },
  updated: {
    marginBottom: 12,
    fontSize: 12,
    fontWeight: "600",
    color: "#8B97B2",
  },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#1A2850",
  },
  body: {
    fontSize: 13,
    color: "#6C7CA6",
    fontWeight: "600",
    lineHeight: 20,
  },
});
