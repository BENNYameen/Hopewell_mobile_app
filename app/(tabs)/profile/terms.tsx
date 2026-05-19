import { StyleSheet, Text } from "react-native";

import { ProfileSubScreen } from "components/vajra/ProfileSubScreen";
import { V } from "@/theme/vajra";

export default function TermsOfService() {
  return (
    <ProfileSubScreen title="Terms of Service">
      <Text style={styles.updated}>Effective date: April 22, 2026</Text>

      <Text style={styles.sectionTitle}>Use of service</Text>
      <Text style={styles.body}>
        You agree to use the app only for lawful charging, payment, and account
        activity and to provide accurate account details.
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
        We may update, suspend, or modify features for maintenance, security, or
        regulatory reasons.
      </Text>

      <Text style={styles.sectionTitle}>Contact</Text>
      <Text style={styles.body}>
        For terms-related queries, contact
        {"\n"}care@vajarvolt.com
      </Text>
    </ProfileSubScreen>
  );
}

const styles = StyleSheet.create({
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
    color: V.heading,
  },
  body: {
    fontSize: 13,
    color: V.bodySecondary,
    fontWeight: "600",
    lineHeight: 20,
  },
});
