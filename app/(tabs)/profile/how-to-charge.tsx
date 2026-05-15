import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { V } from "@/theme/vajra";
import { HowToChargeGuideBody } from "components/vajra/HowToChargeGuideBody";
import { IconSymbol } from "components/ui/icon-symbol";

export default function HowToChargeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable style={styles.backRow} onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={18} color={V.headingDeep} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <HowToChargeGuideBody variant="app" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: V.pageBg,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 4,
  },
  backText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: V.heading,
  },
});
