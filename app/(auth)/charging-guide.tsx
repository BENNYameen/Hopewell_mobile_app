import { useRouter } from "expo-router";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { V } from "@/theme/vajra";
import { HowToChargeGuideBody } from "components/vajra/HowToChargeGuideBody";
import { IconSymbol } from "components/ui/icon-symbol";

export default function ChargingGuidePublic() {
  const router = useRouter();
  const isWeb = Platform.OS === "web";

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {isWeb ? (
        <View style={styles.webHeaderOuter}>
          <View style={styles.webHeaderInner}>
            <Pressable
              style={styles.webBrand}
              onPress={() => router.replace("/(auth)/landing")}
            >
              <View style={styles.logoCircle}>
                <IconSymbol name="bolt.fill" size={15} color={V.card} />
              </View>
              <Text style={styles.wordmark}>Vajra Volt</Text>
            </Pressable>
            <Pressable
              style={styles.getStartedPill}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
              <Text style={styles.chev}>›</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          isWeb && styles.scrollWeb,
        ]}
      >
        {!isWeb ? (
          <Pressable
            style={styles.backBtn}
            onPress={() => router.replace("/(auth)/landing")}
          >
            <IconSymbol name="arrow.left" size={18} color={V.headingDeep} />
          </Pressable>
        ) : null}

        <View style={isWeb ? styles.webContentShell : undefined}>
          <HowToChargeGuideBody variant="marketing" layoutWide={isWeb} />

          <View style={styles.ctaBlock}>
            <Text style={styles.readyText}>Ready to give it a try?</Text>
            <Pressable
              style={styles.cta}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.ctaText}>Start Charging Now</Text>
              <Text style={styles.ctaChev}>›</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: V.pageBg },
  webHeaderOuter: {
    width: "100%",
    backgroundColor: V.card,
    borderBottomWidth: 1,
    borderBottomColor: V.borderHairline,
  },
  webHeaderInner: {
    maxWidth: 1120,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingVertical: 16,
  },
  webBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: V.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: {
    fontSize: 14,
    fontWeight: "800",
    color: V.headingDeep,
  },
  getStartedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: V.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: V.radiusPill,
  },
  getStartedText: {
    fontSize: 13,
    fontWeight: "700",
    color: V.card,
  },
  chev: { fontSize: 16, fontWeight: "800", color: V.card, marginTop: -2 },

  scroll: { paddingHorizontal: 20, paddingBottom: 48 },
  scrollWeb: {
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 64,
  },
  webContentShell: {
    maxWidth: 920,
    width: "100%",
    alignSelf: "center",
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
    marginTop: 4,
  },
  ctaBlock: {
    marginTop: 28,
    alignItems: "center",
    gap: 14,
  },
  readyText: {
    fontSize: 15,
    fontWeight: "600",
    color: V.bodySecondary,
    textAlign: "center",
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    alignSelf: "stretch",
    maxWidth: 400,
    backgroundColor: V.primary,
    borderRadius: V.radiusPill,
    paddingVertical: 15,
    paddingHorizontal: 24,
    ...V.shadowCard,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: "700",
    color: V.card,
  },
  ctaChev: {
    fontSize: 18,
    fontWeight: "800",
    color: V.card,
    marginTop: -2,
  },
});
