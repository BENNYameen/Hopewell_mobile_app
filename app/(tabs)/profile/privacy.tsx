import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { IconSymbol } from "components/ui/icon-symbol";

export default function PrivacyData() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Pressable style={styles.backRow} onPress={() => router.back()}>
        <IconSymbol name="arrow.left" size={18} color="#0F172A" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.updated}>Effective date: April 22, 2026</Text>

        <Text style={styles.sectionTitle}>What we collect</Text>
        <Text style={styles.body}>
          We collect account details you provide (name and phone number),
          charging activity, wallet transactions, and device-level diagnostics
          required for app reliability.
        </Text>

        <Text style={styles.sectionTitle}>Location data</Text>
        <Text style={styles.body}>
          Location access is used to show nearby charging stations and provide
          navigation. We do not require background location for core charging
          flows.
        </Text>

        <Text style={styles.sectionTitle}>Payments</Text>
        <Text style={styles.body}>
          Payment processing is handled through Razorpay. We do not store full
          card details in the app.
        </Text>

        <Text style={styles.sectionTitle}>Data security</Text>
        <Text style={styles.body}>
          Authentication tokens are stored in secure device storage. Network
          requests use secure transport for production builds.
        </Text>

        <Text style={styles.sectionTitle}>Contact</Text>
        <Text style={styles.body}>
          For privacy requests or account deletion, contact
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
