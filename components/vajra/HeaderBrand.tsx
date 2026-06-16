import { StyleSheet, Text, View } from "react-native";

import { useThemedStyles } from "@/hooks/use-vajra-colors";
import type { VajraColors } from "@/theme/vajra-colors";
import { VajraLogoImage } from "components/vajra/LightningBrandMark";

type HeaderBrandProps = {
  /** `sidebar` — larger lockup for the web dashboard drawer */
  variant?: "default" | "sidebar";
  logoSize?: number;
};

const PRESETS = {
  default: { logo: 58, wordmark: 15, charging: 9, gap: 12 },
  sidebar: { logo: 68, wordmark: 17, charging: 10, gap: 14 },
} as const;

/** Header / sidebar lockup: logo + Vajra Volt + CHARGING */
export function HeaderBrand({
  variant = "default",
  logoSize,
}: HeaderBrandProps) {
  const preset = PRESETS[variant];
  const size = logoSize ?? preset.logo;
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.row, { gap: preset.gap }]}>
      <VajraLogoImage size={size} />
      <View style={styles.textCol}>
        <Text style={[styles.wordmark, { fontSize: preset.wordmark }]}>
          Vajra Volt
        </Text>
        <Text
          style={[
            styles.chargingMicro,
            { fontSize: preset.charging, letterSpacing: variant === "sidebar" ? 3.5 : 3 },
          ]}
        >
          CHARGING
        </Text>
      </View>
    </View>
  );
}

const createStyles = (V: VajraColors) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
    },
    textCol: {
      justifyContent: "center",
      flexShrink: 1,
    },
    wordmark: {
      fontWeight: "800",
      color: V.headingDeep,
    },
    chargingMicro: {
      marginTop: 2,
      fontWeight: "700",
      color: V.label,
    },
  });
