import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { IconSymbol } from "components/ui/icon-symbol";
import { V } from "@/theme/vajra";

export default function PrivacyData() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <IconSymbol name="arrow.left" size={18} color={V.headingDeep} />
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
    backgroundColor: V.pageBg,
    paddingHorizontal: V.appPadH,
    paddingTop: 40,
  },
  content: {
    paddingBottom: 40,
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
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: V.headingDeep,
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
