import { Linking, Pressable, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

import { IconSymbol } from "components/ui/icon-symbol";
import { ProfileSubScreen } from "components/vajra/ProfileSubScreen";
import { useGetSupportConfigQuery } from "@/profile/profile.api";

export default function HelpSupport() {
  const router = useRouter();
  const { data: config } = useGetSupportConfigQuery();

  const supportPhone = config?.support.phone ?? "+91 88831 61155";
  const supportEmail = config?.support.email ?? "care@vajarvolt.com";
  const franchiseePhone = config?.franchisee.phone ?? "+91 80154 53161";
  const franchiseeEmail = config?.franchisee.email ?? "franchisee@vajarvolt.com";

  const dialPhone = (raw: string) =>
    Linking.openURL(`tel:${raw.replace(/\s+/g, "")}`);

  return (
    <ProfileSubScreen title="Help">
      <Text style={styles.sectionTitle}>Customer Support</Text>
      <Pressable style={styles.row} onPress={() => dialPhone(supportPhone)}>
        <IconSymbol name="phone" size={18} color="#6C7CA6" />
        <Text style={styles.rowText}>{supportPhone}</Text>
      </Pressable>
      <Pressable
        style={styles.row}
        onPress={() => Linking.openURL(`mailto:${supportEmail}`)}
      >
        <IconSymbol name="email" size={18} color="#6C7CA6" />
        <Text style={styles.rowText}>{supportEmail}</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Become a franchisee</Text>
      <Pressable style={styles.row} onPress={() => dialPhone(franchiseePhone)}>
        <IconSymbol name="phone" size={18} color="#6C7CA6" />
        <Text style={styles.rowText}>{franchiseePhone}</Text>
      </Pressable>
      <Pressable
        style={styles.row}
        onPress={() => Linking.openURL(`mailto:${franchiseeEmail}`)}
      >
        <IconSymbol name="email" size={18} color="#6C7CA6" />
        <Text style={styles.rowText}>{franchiseeEmail}</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Legal & Information</Text>
      <Pressable style={styles.row} onPress={() => router.push("/profile/terms")}>
        <IconSymbol name="description" size={18} color="#6C7CA6" />
        <Text style={styles.rowText}>Terms and Conditions</Text>
      </Pressable>
      <Pressable style={styles.row} onPress={() => router.push("/profile/privacy")}>
        <IconSymbol name="policy" size={18} color="#6C7CA6" />
        <Text style={styles.rowText}>Privacy Policy</Text>
      </Pressable>
      <Pressable style={styles.row}>
        <IconSymbol name="help" size={18} color="#6C7CA6" />
        <Text style={styles.rowText}>Frequently Asked Questions</Text>
      </Pressable>
    </ProfileSubScreen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginTop: 16,
    marginBottom: 10,
    fontSize: 13,
    fontWeight: "700",
    color: "#8B97B2",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  rowText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#1A2850",
  },
});
