import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { V } from "@/theme/vajra";
import { IconSymbol } from "components/ui/icon-symbol";
import { RecentContent } from "../recent";

export default function ChargingHistory() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={18} color={V.headingDeep} />
        </Pressable>
        <Text style={styles.title}>Charging history</Text>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.listWrap}>
        <RecentContent showHeader={false} withContainer={false} />
      </View>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
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
  headerSpacer: {
    width: 36,
    height: 36,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: V.headingDeep,
  },
  listWrap: {
    flex: 1,
  },
});
