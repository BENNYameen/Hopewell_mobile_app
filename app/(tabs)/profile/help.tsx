import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { IconSymbol } from "components/ui/icon-symbol";
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={18} color="#0F172A" />
        </Pressable>
        <Text style={styles.headerTitle}>Help</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
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
        <Pressable
          style={styles.row}
          onPress={() => dialPhone(franchiseePhone)}
        >
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
        <Pressable
          style={styles.row}
          onPress={() => router.push("/profile/terms")}
        >
          <IconSymbol name="description" size={18} color="#6C7CA6" />
          <Text style={styles.rowText}>Terms and Conditions</Text>
        </Pressable>
        <Pressable
          style={styles.row}
          onPress={() => router.push("/profile/privacy")}
        >
          <IconSymbol name="policy" size={18} color="#6C7CA6" />
          <Text style={styles.rowText}>Privacy Policy</Text>
        </Pressable>
        <Pressable style={styles.row}>
          <IconSymbol name="help" size={18} color="#6C7CA6" />
          <Text style={styles.rowText}>Frequently Asked Questions</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6FB",
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(40, 92, 153, 0.12)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerSpacer: {
    width: 36,
    height: 36,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
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
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#1A2850",
  },
});
