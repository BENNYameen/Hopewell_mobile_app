import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  HOW_TO_CHARGE_TABS,
  type GuideTabId,
} from "@/content/howToChargeGuide";
import { useMarketingLayout } from "@/hooks/use-responsive-layout";
import { V } from "@/theme/vajra";
import type { IconName } from "components/ui/icon-names";
import { IconSymbol } from "components/ui/icon-symbol";

const TAB_ICONS: Record<GuideTabId, IconName> = {
  web: "description",
  mobile: "phone",
  qr: "qrcode",
  rfid: "wallet.pass.fill",
};

type Props = {
  variant: "marketing" | "app";
  bottomHint?: string;
};

export function HowToChargeGuideBody({
  variant,
  bottomHint,
}: Props) {
  const {
    isCompact,
    isMedium,
    isExpanded,
    isDesktopWeb,
    layoutWide,
    marketingNarrow,
  } = useMarketingLayout();
  const [activeTab, setActiveTab] = useState<GuideTabId>("web");
  const current = useMemo(
    () => HOW_TO_CHARGE_TABS.find((t) => t.id === activeTab)!,
    [activeTab],
  );

  const wide = layoutWide && variant === "marketing";
  const compact = marketingNarrow && variant === "marketing" && isCompact;
  const titleSize = wide
    ? isExpanded
      ? 34
      : 30
    : compact
      ? 26
      : variant === "marketing"
        ? 28
        : 22;

  return (
    <View
      style={[
        wide && variant === "marketing" && styles.rootWide,
        isDesktopWeb && variant === "marketing" && styles.rootDesktopWeb,
      ]}
    >
      <Text
        style={[
          styles.kicker,
          wide && styles.kickerWide,
          compact && styles.kickerCompact,
          isExpanded && wide && styles.kickerExpanded,
        ]}
      >
        Guide
      </Text>
      <Text
        style={[
          styles.title,
          { fontSize: titleSize },
          wide && styles.titleWide,
          compact && styles.titleCompact,
          isMedium && variant === "marketing" && styles.titleMedium,
        ]}
      >
        How to Charge
      </Text>
      <Text
        style={[
          styles.subtitle,
          wide && styles.subtitleWide,
          compact && styles.subtitleCompact,
          isMedium && variant === "marketing" && !wide && styles.subtitleMedium,
        ]}
      >
        Choose your preferred charging method below and follow the step-by-step
        guide.
      </Text>

      <View
        style={[
          styles.tabBar,
          wide && styles.tabBarWide,
          marketingNarrow && variant === "marketing" && styles.tabBarNarrow,
          compact && styles.tabBarCompact,
        ]}
      >
        {HOW_TO_CHARGE_TABS.map((tab) => {
          const on = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.tab,
                wide
                  ? styles.tabWide
                  : marketingNarrow && variant === "marketing"
                    ? styles.tabGridItem
                    : styles.tabCompact,
                on ? styles.tabActive : wide ? styles.tabInactiveWide : null,
              ]}
            >
              {wide ? (
                <IconSymbol
                  name={TAB_ICONS[tab.id]}
                  size={18}
                  color={on ? V.card : V.primary}
                />
              ) : (
                <Text style={styles.tabEmoji}>{tab.emoji}</Text>
              )}
              <Text
                style={[
                  styles.tabLabel,
                  wide && styles.tabLabelWide,
                  marketingNarrow &&
                    variant === "marketing" &&
                    styles.tabLabelCompact,
                  on ? styles.tabLabelActive : wide ? styles.tabLabelMuted : undefined,
                ]}
                numberOfLines={
                  marketingNarrow && variant === "marketing" ? 2 : 1
                }
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View
        style={[styles.panel, wide && styles.panelWide, compact && styles.panelCompact]}
      >
        <View style={[styles.panelTitleRow, compact && styles.panelTitleRowCompact]}>
          {wide ? (
            <IconSymbol
              name={TAB_ICONS[current.id]}
              size={22}
              color={V.primary}
            />
          ) : (
            <Text style={styles.panelEmoji}>{current.emoji}</Text>
          )}
          <Text style={[styles.panelTitle, wide && styles.panelTitleWide]}>
            Charging via {current.label}
          </Text>
        </View>

        <View style={styles.steps}>
          {current.steps.map((step, i) => (
            <View
              key={`${current.id}-${i}`}
              style={[styles.stepRow, compact && styles.stepRowCompact]}
            >
              <View style={styles.stepRail}>
                <View style={[styles.stepCircle, wide && styles.stepCircleWide]}>
                  <Text style={[styles.stepNum, wide && styles.stepNumWide]}>
                    {i + 1}
                  </Text>
                </View>
                {i < current.steps.length - 1 ? (
                  <View style={[styles.stepDash, wide && styles.stepDashWide]} />
                ) : null}
              </View>
              <View
                style={[
                  styles.stepBody,
                  wide && styles.stepBodyWide,
                  compact && styles.stepBodyCompact,
                ]}
              >
                <Text style={[styles.stepTitle, wide && styles.stepTitleWide]}>
                  {step.title}
                </Text>
                <Text
                  style={[styles.stepDescription, wide && styles.stepDescriptionWide]}
                >
                  {step.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.tipBox, wide && styles.tipBoxWide]}>
          <IconSymbol name="bolt.fill" size={wide ? 18 : 15} color={V.primary} />
          <Text style={[styles.tipText, wide && styles.tipTextWide]}>
            {current.tip}
          </Text>
        </View>
      </View>

      {bottomHint ? (
        <Text style={styles.bottomHint}>{bottomHint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  rootWide: {
    width: "100%",
    alignSelf: "center",
  },
  rootDesktopWeb: {
    width: "100%",
    maxWidth: 960,
  },
  kicker: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    color: V.primary,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  kickerCompact: {
    marginBottom: 10,
  },
  kickerExpanded: {
    marginBottom: 12,
  },
  kickerWide: {
    textAlign: "center",
    fontSize: 12,
    letterSpacing: 3,
    marginBottom: 10,
  },
  title: {
    fontWeight: "800",
    color: V.headingDeep,
    marginBottom: 10,
  },
  titleCompact: {
    marginBottom: 12,
  },
  titleMedium: {
    fontSize: 30,
    marginBottom: 12,
  },
  titleWide: {
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: V.bodySecondary,
    lineHeight: 22,
    marginBottom: 22,
  },
  subtitleCompact: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 24,
  },
  subtitleMedium: {
    marginBottom: 26,
  },
  subtitleWide: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 560,
    alignSelf: "center",
  },
  tabBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 22,
    padding: 8,
    borderRadius: 16,
    backgroundColor: V.card,
    borderWidth: 1,
    borderColor: V.borderHairline,
    ...V.shadowFeature,
  },
  tabBarNarrow: {
    marginBottom: 24,
    padding: 10,
    gap: 10,
  },
  tabBarCompact: {
    marginBottom: 26,
  },
  tabBarWide: {
    flexWrap: "nowrap",
    padding: 8,
    gap: 0,
    marginBottom: 24,
    width: "100%",
    alignSelf: "center",
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  tabCompact: {
    flexGrow: 1,
    flexBasis: "22%",
    minWidth: 72,
  },
  tabGridItem: {
    flexGrow: 0,
    flexBasis: "47%",
    maxWidth: "47%",
    minWidth: 0,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tabWide: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  tabActive: {
    backgroundColor: V.primary,
  },
  tabInactiveWide: {
    backgroundColor: V.pageBg,
    borderColor: V.borderNavyMedium,
  },
  tabEmoji: { fontSize: 16, marginBottom: 2 },
  tabLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: V.bodySecondary,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  tabLabelCompact: {
    fontSize: 11,
    letterSpacing: 0.5,
    lineHeight: 14,
  },
  tabLabelWide: {
    fontSize: 11,
    letterSpacing: 0.8,
    marginTop: 6,
  },
  tabLabelActive: {
    color: V.card,
  },
  tabLabelMuted: {
    color: V.headingMuted,
  },
  panel: {
    borderRadius: V.radiusCard,
    padding: 20,
    backgroundColor: V.card,
    borderWidth: 1,
    borderColor: V.borderStepCard,
    ...V.shadowCard,
    marginBottom: 16,
  },
  panelCompact: {
    padding: 22,
  },
  panelWide: {
    paddingVertical: 28,
    paddingHorizontal: 28,
    width: "100%",
    alignSelf: "center",
  },
  panelTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  panelTitleRowCompact: {
    marginBottom: 22,
  },
  panelEmoji: { fontSize: 18 },
  panelTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "800",
    color: V.headingMuted,
  },
  panelTitleWide: {
    fontSize: 18,
  },
  steps: {},
  stepRow: { flexDirection: "row" },
  stepRowCompact: {
    marginBottom: 2,
  },
  stepRail: { width: 36, alignItems: "center" },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: V.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleWide: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  stepNum: { color: V.card, fontWeight: "800", fontSize: 12 },
  stepNumWide: { fontSize: 13 },
  stepDash: {
    width: 2,
    minHeight: 24,
    marginVertical: 4,
    backgroundColor: "rgba(33, 179, 167, 0.25)",
  },
  stepDashWide: {
    minHeight: 28,
  },
  stepBody: { flex: 1, paddingLeft: 12, paddingBottom: 22 },
  stepBodyCompact: {
    paddingLeft: 14,
    paddingBottom: 24,
  },
  stepBodyWide: {
    paddingLeft: 16,
    paddingBottom: 22,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: V.headingMuted,
    marginBottom: 4,
  },
  stepTitleWide: {
    fontSize: 15,
  },
  stepDescription: {
    fontSize: 13,
    fontWeight: "600",
    color: V.bodySecondary,
    lineHeight: 19,
  },
  stepDescriptionWide: {
    fontSize: 14,
    lineHeight: 22,
  },
  tipBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 4,
    padding: 14,
    borderRadius: 16,
    backgroundColor: V.tealMuted,
  },
  tipBoxWide: {
    padding: 18,
    borderRadius: 18,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: V.tealBadgeText,
    lineHeight: 18,
  },
  tipTextWide: {
    fontSize: 13,
    lineHeight: 20,
  },
  bottomHint: {
    fontSize: 13,
    fontWeight: "600",
    color: V.label,
    textAlign: "center",
  },
});
