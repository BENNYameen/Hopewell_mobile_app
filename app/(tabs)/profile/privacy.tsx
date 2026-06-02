import { StyleSheet, Text } from "react-native";

import { ProfileSubScreen } from "components/vajra/ProfileSubScreen";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { V } from "@/theme/vajra";

export default function PrivacyData() {
  const { refreshControl } = usePullToRefresh(async () => {}, false);

  return (
    <ProfileSubScreen title="Privacy Policy" refreshControl={refreshControl}>
      <Text style={styles.updated}>Effective date: April 22, 2026</Text>

      <Text style={styles.sectionTitle}>What we collect</Text>
      <Text style={styles.body}>
        We collect account details you provide (name and phone number), charging
        activity, wallet transactions, and device-level diagnostics required for
        app reliability.
      </Text>

      <Text style={styles.sectionTitle}>Location data</Text>
      <Text style={styles.body}>
        Location access is used to show nearby charging stations and provide
        navigation. We do not require background location for core charging
        flows.
      </Text>

      <Text style={styles.sectionTitle}>Payments</Text>
      <Text style={styles.body}>
        Payment processing is handled through Razorpay. We do not store full card
        details in the app.
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
