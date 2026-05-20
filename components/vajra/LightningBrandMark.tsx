import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

const LOGO = require("../../assets/images/vijra_logo.jpeg");

type LogoImageProps = {
  size: number;
};

/** Circular Vajra Volt brand mark from `assets/images/vijra_logo.jpeg`. */
export function VajraLogoImage({ size }: LogoImageProps) {
  return (
    <Image
      source={LOGO}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      contentFit="contain"
      transition={0}
      accessibilityLabel="Vajra Volt logo"
    />
  );
}

type Props = {
  /** Login welcome: 184×184; marketing hero: 136×136 */
  variant?: "login" | "marketing";
};

/** Marketing hero brand mark */
export function MarketingHeroBolt() {
  return (
    <View style={mhStyles.outer}>
      <VajraLogoImage size={136} />
    </View>
  );
}

const mhStyles = StyleSheet.create({
  outer: {
    width: 136,
    height: 136,
    alignItems: "center",
    justifyContent: "center",
  },
});

/** Brand mark on login screen */
export function LightningBrandMark({ variant = "login" }: Props) {
  if (variant === "marketing") {
    return <MarketingHeroBolt />;
  }
  return <VajraLogoImage size={184} />;
}
