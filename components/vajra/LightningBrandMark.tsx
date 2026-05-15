import { StyleSheet, View } from "react-native";

import { V } from "@/theme/vajra";
import { IconSymbol } from "components/ui/icon-symbol";

type Props = {
  /** Login welcome: 144×144, 120 ring, bolt #21B3A7 */
  variant?: "login" | "marketing";
};

/** Marketing hero: 96 outer + 64 inner primary + white bolt */
export function MarketingHeroBolt() {
  return (
    <View style={mhStyles.outer}>
      <View style={mhStyles.inner}>
        <IconSymbol name="bolt.fill" size={30} color={V.card} />
      </View>
    </View>
  );
}

const mhStyles = StyleSheet.create({
  outer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: V.tealMuted,
    borderWidth: 4,
    borderColor: V.tealRing20,
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: V.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});

/** Concentric ring + bolt (login screen). */
export function LightningBrandMark({ variant = "login" }: Props) {
  if (variant === "marketing") {
    return <MarketingHeroBolt />;
  }
  const wrap = 144;
  const ring = 120;
  const ringWidth = 10;
  const dot = 18;
  const bolt = 44;
  return (
    <View style={[styles.wrap, { width: wrap, height: wrap }]}>
      <View
        style={[
          styles.ring,
          {
            width: ring,
            height: ring,
            borderRadius: ring / 2,
            borderWidth: ringWidth,
          },
        ]}
      />
      <View
        style={[
          styles.dot,
          {
            width: dot,
            height: dot,
            borderRadius: dot / 2,
            right: wrap * 0.11,
            top: wrap * 0.26,
          },
        ]}
      />
      <IconSymbol name="bolt.fill" size={bolt} color={V.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    borderColor: "rgba(34, 185, 196, 0.35)",
  },
  dot: {
    position: "absolute",
    backgroundColor: V.accentAlt,
  },
});
