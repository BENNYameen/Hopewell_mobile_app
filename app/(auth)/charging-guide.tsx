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

import { useMarketingLayout } from "@/hooks/use-responsive-layout";
import { V } from "@/theme/vajra";
import { HowToChargeGuideBody } from "components/vajra/HowToChargeGuideBody";
import { IconSymbol } from "components/ui/icon-symbol";

export default function ChargingGuidePublic() {
  const router = useRouter();
  const isWeb = Platform.OS === "web";
  const {
    isCompact,
    isMedium,
    isExpanded,
    isDesktopWeb,
    layoutWide,
    pagePad,
  } = useMarketingLayout();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {isWeb ? (
        <View style={styles.webHeaderOuter}>
          <View
            style={[
              styles.webHeaderInner,
              isCompact && styles.webHeaderInnerCompact,
              isExpanded && styles.webHeaderInnerExpanded,
              { paddingHorizontal: pagePad },
            ]}
          >
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
              style={[styles.getStartedPill, isCompact && styles.getStartedPillCompact]}
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
          { paddingHorizontal: pagePad },
          isWeb && isMedium && styles.scrollWebMedium,
          isWeb && isExpanded && styles.scrollWebExpanded,
          isWeb && isCompact && styles.scrollWebCompact,
          isDesktopWeb && styles.scrollDesktopWeb,
        ]}
      >
        <View
          style={[
            layoutWide && styles.webContentShell,
            isExpanded && styles.webContentShellExpanded,
            isDesktopWeb && styles.webContentShellDesktop,
          ]}
        >
          <Pressable
            style={styles.backBtn}
            onPress={() => router.replace("/(auth)/landing")}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <IconSymbol name="arrow.left" size={18} color={V.headingDeep} />
          </Pressable>
          <HowToChargeGuideBody variant="marketing" />

          <View
            style={[
              styles.ctaBlock,
              isDesktopWeb && styles.ctaBlockDesktopWeb,
            ]}
          >
            <Text style={styles.readyText}>Ready to give it a try?</Text>
            <Pressable
              style={[styles.cta, isDesktopWeb && styles.ctaDesktopWeb]}
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
    alignItems: "center",
  },
  webHeaderInner: {
    maxWidth: 1120,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    gap: 12,
  },
  webHeaderInnerCompact: {
    paddingVertical: 14,
  },
  webHeaderInnerExpanded: {
    paddingVertical: 18,
  },
  webBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
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
    flexShrink: 0,
  },
  getStartedPillCompact: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  getStartedText: {
    fontSize: 13,
    fontWeight: "700",
    color: V.card,
  },
  chev: { fontSize: 16, fontWeight: "800", color: V.card, marginTop: -2 },

  scroll: { paddingBottom: 48, paddingTop: 8 },
  scrollWebCompact: {
    paddingTop: 16,
    paddingBottom: 48,
  },
  scrollWebMedium: {
    paddingTop: 24,
    paddingBottom: 56,
  },
  scrollWebExpanded: {
    paddingTop: 32,
    paddingBottom: 72,
  },
  scrollDesktopWeb: {
    alignItems: "center",
    width: "100%",
  },
  webContentShell: {
    maxWidth: 920,
    width: "100%",
    alignSelf: "center",
  },
  webContentShellExpanded: {
    maxWidth: 960,
  },
  webContentShellDesktop: {
    width: "100%",
    maxWidth: 960,
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
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  ctaBlock: {
    marginTop: 32,
    alignItems: "center",
    gap: 16,
    width: "100%",
  },
  ctaBlockDesktopWeb: {
    maxWidth: 400,
    alignSelf: "center",
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
    alignSelf: "center",
    width: "100%",
    maxWidth: 400,
    backgroundColor: V.primary,
    borderRadius: V.radiusPill,
    paddingVertical: 15,
    paddingHorizontal: 24,
    ...V.shadowCard,
  },
  ctaDesktopWeb: {
    alignSelf: "center",
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
