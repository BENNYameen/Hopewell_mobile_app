/**
 * Marketing landing — parity with Vajra web `src/pages/LandingPage.tsx`
 * (canonical until PNGs exist in design-screenshots).
 */
import { Redirect, useRouter } from "expo-router";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HeaderBrand } from "components/vajra/HeaderBrand";
import { MarketingHeroBolt, VajraLogoImage } from "components/vajra/LightningBrandMark";
import { useMarketingLayout } from "@/hooks/use-responsive-layout";
import { V } from "@/theme/vajra";
import { IconSymbol } from "components/ui/icon-symbol";

function StepCard({
  num,
  title,
  description,
  iconName,
}: {
  num: number;
  title: string;
  description: string;
  iconName: Parameters<typeof IconSymbol>[0]["name"];
}) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.stepCardTop}>
        <View style={styles.stepIconTile}>
          <IconSymbol name={iconName} size={22} color={V.primary} />
        </View>
        <Text style={styles.stepWatermark}>{String(num).padStart(2, "0")}</Text>
      </View>
      <Text style={styles.stepCardTitle}>{title}</Text>
      <Text style={styles.stepCardBody}>{description}</Text>
    </View>
  );
}

function StatItem({
  value,
  label,
  compact,
}: {
  value: string;
  label: string;
  compact?: boolean;
}) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, compact && styles.statValueCompact]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, compact && styles.statLabelCompact]}>
        {label}
      </Text>
    </View>
  );
}

const STATS = [
  { value: "50+", label: "Charge Points" },
  { value: "20+", label: "Locations" },
  { value: "24/7", label: "Availability" },
];

export default function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    width,
    isCompact,
    isMedium,
    isExpanded,
    isDesktopWeb,
    pagePad,
    showHeaderNav,
  } = useMarketingLayout();

  if (Platform.OS !== "web") {
    return <Redirect href="/(auth)/login" />;
  }
  const contentW = Math.min(width, V.marketingMax);

  const HeaderInner = (
    <View
      style={[
        styles.headerInner,
        isCompact && styles.headerInnerCompact,
        isExpanded && styles.headerInnerExpanded,
        { maxWidth: V.marketingMax, paddingHorizontal: pagePad },
      ]}
    >
      <Pressable
        style={[styles.logoPress, isCompact && styles.logoPressCompact]}
        onPress={() => router.replace("/(auth)/landing")}
      >
        <HeaderBrand />
      </Pressable>

      <View style={[styles.headerRight, isCompact && styles.headerRightCompact]}>
        {showHeaderNav ? (
          <>
            <Pressable onPress={() => router.push("/(auth)/charging-guide")}>
              <Text style={styles.navLink}>How to Charge</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.navLink}>Log in</Text>
            </Pressable>
          </>
        ) : null}
        <Pressable
          style={[
            styles.getStartedPill,
            isCompact && styles.getStartedPillCompact,
          ]}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
          <Text style={styles.chev}>›</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <View
        style={[
          styles.stickyHeader,
          isDesktopWeb && styles.stickyHeaderDesktopWeb,
        ]}
      >
        {HeaderInner}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollRoot, { paddingBottom: Math.max(insets.bottom, 40) }]}
      >
        <View
          style={[
            styles.column,
            { width: contentW, maxWidth: V.marketingMax, paddingHorizontal: pagePad },
            isDesktopWeb && styles.columnDesktopWeb,
          ]}
        >
          {/* Hero — web order (no eyebrow above ring) */}
          <View
            style={[
              styles.hero,
              isCompact && styles.heroCompact,
              isExpanded && styles.heroExpanded,
            ]}
          >
            <View
              style={[
                styles.heroMark,
                isCompact && styles.heroMarkCompact,
                isExpanded && styles.heroMarkExpanded,
              ]}
            >
              <MarketingHeroBolt />
            </View>
            <Text
              style={[
                styles.heroH1,
                isCompact && styles.heroH1Compact,
                isMedium && styles.heroH1Medium,
              ]}
            >
              <Text style={styles.heroH1Navy}>
                Smart EV Charging,{"\n"}
              </Text>
              <Text style={styles.heroH1Teal}>Anywhere.</Text>
            </Text>
            <Text
              style={[
                styles.heroLead,
                isCompact && styles.heroLeadCompact,
                isExpanded && styles.heroLeadExpanded,
              ]}
            >
              Find, verify, and start charging your EV in seconds. Vajra Volt
              makes EV charging as easy as scanning a QR code.
            </Text>
            <View
              style={[
                styles.heroCtas,
                isCompact && styles.heroCtasCompact,
                !isCompact && styles.heroCtasCentered,
                isExpanded && styles.heroCtasExpanded,
                isDesktopWeb && styles.heroCtasDesktopWeb,
              ]}
            >
              <Pressable
                style={styles.primaryBtn}
                onPress={() => router.push("/(auth)/login")}
              >
                <Text style={styles.primaryBtnText}>Start Charging</Text>
                <Text style={styles.chevLight}>›</Text>
              </Pressable>
              <Pressable
                style={styles.secondaryHeroBtn}
                onPress={() => router.push("/(auth)/charging-guide")}
              >
                <Text style={styles.secondaryHeroBtnTextHow}>How It Works</Text>
              </Pressable>
            </View>
          </View>

          {/* Stats banner */}
          <View style={[styles.statsBanner, isCompact && styles.statsBannerCompact]}>
            {STATS.map((s, i) => (
              <View
                key={s.label}
                style={[styles.statColumn, i > 0 && styles.statColumnBorder]}
              >
                <StatItem
                  value={s.value}
                  label={s.label}
                  compact={isCompact}
                />
              </View>
            ))}
          </View>

          {/* How it works */}
          <View style={styles.howHeader}>
            <Text style={styles.eyebrowPrimary}>Simple Process</Text>
            <Text style={styles.howTitle}>How It Works</Text>
          </View>

          <StepCard
            num={1}
            title="Find a Charger"
            description="Browse nearby charging stations on the map or scan a QR code at any Vajra charging point."
            iconName="map.fill"
          />
          <StepCard
            num={2}
            title="Verify & Connect"
            description="Enter the charger ID or scan the QR code to authenticate your session securely."
            iconName="qrcode"
          />
          <StepCard
            num={3}
            title="Charge & Go"
            description="Monitor live energy, cost, and duration. Stop anytime from the app or web dashboard."
            iconName="bolt.fill"
          />

          <Pressable
            style={styles.detailLink}
            onPress={() => router.push("/(auth)/charging-guide")}
          >
            <Text style={styles.detailLinkText}>See detailed instructions</Text>
            <Text style={styles.chevPrimary}>›</Text>
          </Pressable>

          {/* Features */}
          <View style={styles.featureGrid}>
            {[
              {
                icon: "bolt.fill" as const,
                title: "Real-Time Updates",
                desc: "Live energy, cost, and power data while charging.",
              },
              {
                icon: "policy" as const,
                title: "Secure Sessions",
                desc: "JWT-authenticated sessions protect your account and wallet.",
              },
              {
                icon: "qrcode" as const,
                title: "Multi-Device Access",
                desc: "Start on mobile, monitor on web — same session, always in sync.",
              },
            ].map((f) => (
              <View key={f.title} style={styles.featureCard}>
                <IconSymbol name={f.icon} size={18} color={V.primary} />
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Dark CTA */}
          <View style={styles.darkCta}>
            <View style={styles.darkCtaIcon}>
              <IconSymbol name="bolt.fill" size={22} color={V.card} />
            </View>
            <Text style={styles.darkCtaH2}>Ready to Charge?</Text>
            <Text style={styles.darkCtaSub}>
              Join hundreds of EV drivers using Vajra Volt every day.
            </Text>
            <Pressable
              style={styles.darkCtaBtn}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.darkCtaBtnText}>Create Account</Text>
              <Text style={styles.chevLight}>›</Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View style={[styles.footer, { marginHorizontal: -pagePad, paddingHorizontal: pagePad }]}>
            <View style={styles.footerRow}>
              <View style={styles.footerBrand}>
                <VajraLogoImage size={40} />
                <Text style={styles.footerBrandText}>Vajra Volt Charging</Text>
              </View>
              <Text style={styles.footerCopy}>
                © {new Date().getFullYear()} Vajra Volt. All rights reserved.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: V.pageBg },
  scrollView: { flex: 1 },
  scrollRoot: {},
  stickyHeader: {
    zIndex: 10,
    elevation: 8,
    backgroundColor: V.card,
    borderBottomWidth: 1,
    borderBottomColor: V.borderNavy,
    overflow: "hidden",
    width: "100%",
    alignSelf: "stretch",
  },
  stickyHeaderDesktopWeb: {
    alignItems: "center",
  },
  columnDesktopWeb: {
    alignSelf: "center",
  },
  headerInner: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 16,
    width: "100%",
    alignSelf: "center",
  },
  headerInnerCompact: {
    flexWrap: "nowrap",
    paddingVertical: 14,
    gap: 8,
  },
  headerInnerExpanded: {
    paddingVertical: 18,
    gap: 16,
  },
  logoPress: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoPressCompact: { flex: 1, minWidth: 0, flexShrink: 1 },
  headerRight: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
  },
  headerRightCompact: {
    flexWrap: "nowrap",
    flexShrink: 0,
  },
  navLink: {
    fontSize: 14,
    fontWeight: "600",
    color: V.bodySecondary,
  },
  getStartedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: V.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: V.radiusPill,
  },
  getStartedPillCompact: {
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  getStartedText: {
    fontSize: 14,
    fontWeight: "700",
    color: V.card,
  },
  chev: { fontSize: 16, fontWeight: "800", color: V.card, marginTop: -2 },
  column: { alignSelf: "center" },
  hero: { paddingTop: 40, paddingBottom: 32, alignItems: "center" },
  heroCompact: { paddingTop: 28, paddingBottom: 28 },
  heroExpanded: { paddingTop: 48, paddingBottom: 40 },
  heroMark: { marginBottom: 28 },
  heroMarkCompact: { marginBottom: 32 },
  heroMarkExpanded: { marginBottom: 36 },
  heroH1: {
    textAlign: "center",
    fontSize: 36,
    lineHeight: 44,
    fontWeight: "800",
  },
  heroH1Compact: {
    fontSize: 28,
    lineHeight: 36,
  },
  heroH1Medium: {
    fontSize: 32,
    lineHeight: 40,
  },
  heroH1Navy: { color: V.headingDeep, fontWeight: "800" },
  heroH1Teal: { color: V.primary, fontWeight: "800" },
  heroLead: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 26,
    fontWeight: "600",
    color: V.bodySecondary,
    maxWidth: 420,
  },
  heroLeadCompact: {
    marginTop: 18,
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 340,
  },
  heroLeadExpanded: {
    marginTop: 24,
    fontSize: 17,
    lineHeight: 28,
    maxWidth: 520,
  },
  heroCtas: {
    marginTop: 28,
    width: "100%",
    maxWidth: 320,
    gap: 14,
    alignItems: "stretch",
  },
  heroCtasCentered: {
    alignSelf: "center",
  },
  heroCtasCompact: {
    marginTop: 24,
    alignSelf: "stretch",
    maxWidth: "100%",
    gap: 12,
  },
  heroCtasExpanded: {
    marginTop: 32,
    maxWidth: 360,
    gap: 16,
  },
  heroCtasDesktopWeb: {
    maxWidth: 400,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: V.primary,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: V.radiusPill,
    ...V.shadowCard,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: V.card,
  },
  chevLight: {
    fontSize: 16,
    fontWeight: "800",
    color: V.card,
    marginTop: -2,
  },
  secondaryHeroBtn: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: V.radiusPill,
    borderWidth: 1,
    borderColor: V.borderNavy,
    backgroundColor: V.card,
  },
  secondaryHeroBtnTextHow: {
    fontSize: 14,
    fontWeight: "700",
    color: V.headingDeep,
  },
  statsBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderRadius: V.radiusStats,
    paddingVertical: 28,
    paddingHorizontal: 8,
    marginBottom: 40,
    backgroundColor: V.primary,
    overflow: "hidden",
  },
  statsBannerCompact: {
    paddingVertical: 22,
    paddingHorizontal: 4,
    marginBottom: 36,
  },
  statColumn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  statColumnBorder: {
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.2)",
  },
  statItem: { alignItems: "center", paddingHorizontal: 8 },
  statValue: {
    fontSize: 30,
    fontWeight: "800",
    color: V.card,
  },
  statValueCompact: {
    fontSize: 24,
  },
  statLabel: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "rgba(255,255,255,0.78)",
    textAlign: "center",
  },
  statLabelCompact: {
    marginTop: 4,
    fontSize: 9,
    letterSpacing: 1,
  },
  howHeader: { alignItems: "center", marginBottom: 28 },
  eyebrowPrimary: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 4,
    color: V.primary,
    marginBottom: 6,
  },
  howTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: V.headingDeep,
  },
  stepCard: {
    marginBottom: 12,
    borderRadius: V.radiusCard,
    backgroundColor: V.card,
    padding: 22,
    borderWidth: 1,
    borderColor: V.borderStepCard,
    ...V.shadowCard,
    overflow: "hidden",
  },
  stepCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
    position: "relative",
  },
  stepIconTile: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: V.tealMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  stepWatermark: {
    fontSize: 40,
    fontWeight: "800",
    color: V.tealMuted,
    lineHeight: 44,
  },
  stepCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: V.headingDeep,
    marginBottom: 6,
  },
  stepCardBody: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "600",
    color: V.bodySecondary,
  },
  detailLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 20,
    marginBottom: 36,
  },
  detailLinkText: {
    fontSize: 14,
    fontWeight: "700",
    color: V.primary,
  },
  chevPrimary: { fontSize: 16, fontWeight: "800", color: V.primary },
  featureGrid: { gap: 14, marginBottom: 36 },
  featureCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: V.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: V.borderHairline,
    ...V.shadowFeature,
  },
  featureText: { flex: 1 },
  featureTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: V.headingDeep,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    color: V.bodySecondary,
  },
  darkCta: {
    alignItems: "center",
    borderRadius: V.radiusStats,
    backgroundColor: V.headingDeep,
    paddingVertical: 44,
    paddingHorizontal: 28,
    marginBottom: 40,
  },
  darkCtaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: V.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  darkCtaH2: {
    fontSize: 24,
    fontWeight: "800",
    color: V.card,
    textAlign: "center",
    marginBottom: 10,
  },
  darkCtaSub: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    maxWidth: 300,
    lineHeight: 20,
  },
  darkCtaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 22,
    backgroundColor: V.primary,
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: V.radiusPill,
    ...V.shadowCardEmphasis,
  },
  darkCtaBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: V.card,
  },
  footer: {
    backgroundColor: V.card,
    borderTopWidth: 1,
    borderTopColor: V.borderNavy,
    paddingVertical: 24,
  },
  footerRow: { gap: 12, marginBottom: 14 },
  footerBrand: { flexDirection: "row", alignItems: "center", gap: 8 },
  footerBrandText: {
    fontSize: 12,
    fontWeight: "700",
    color: V.headingDeep,
  },
  footerCopy: {
    fontSize: 12,
    color: V.label,
    marginTop: 4,
  },
});
