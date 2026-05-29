import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

export type MapViewType = "default" | "satellite";

type MapTypeToggleProps = {
  value: MapViewType;
  onChange: (value: MapViewType) => void;
  /** `horizontal` — sits above station tabs in the bottom sheet. */
  layout?: "vertical" | "horizontal";
};

/** Miniature map preview — Google Maps layer picker style. */
function MapLayerThumbnail() {
  return (
    <View style={thumbStyles.frame}>
      <View style={thumbStyles.mapLand} />
      <View style={[thumbStyles.mapPark, { top: 5, left: 4, width: 14, height: 11 }]} />
      <View style={[thumbStyles.mapWater, { bottom: 4, right: 3, width: 15, height: 10 }]} />
      {/* Yellow arterial road */}
      <View style={[thumbStyles.mapRoadYellow, { top: 19, left: -6, width: 58, transform: [{ rotate: "-18deg" }] }]} />
      {/* White local roads */}
      <View style={[thumbStyles.mapRoadWhite, { top: 8, left: 14, width: 4, height: 32 }]} />
      <View style={[thumbStyles.mapRoadWhite, { top: 28, left: 2, width: 38, height: 4 }]} />
      <View style={[thumbStyles.mapRoadWhite, { top: 14, left: 30, width: 4, height: 18 }]} />
    </View>
  );
}

/** Miniature satellite imagery preview — Google Maps layer picker style. */
function SatelliteLayerThumbnail() {
  const patches: ViewStyle[] = [
    { backgroundColor: "#5A7D52", top: 0, left: 0, width: 26, height: 22 },
    { backgroundColor: "#8B9E6E", top: 4, left: 20, width: 28, height: 20 },
    { backgroundColor: "#3E5C45", top: 18, left: 2, width: 20, height: 18 },
    { backgroundColor: "#A08968", top: 22, left: 18, width: 24, height: 16 },
    { backgroundColor: "#6D8F5C", top: 30, left: 8, width: 22, height: 14 },
    { backgroundColor: "#4A6740", top: 12, left: 10, width: 14, height: 12 },
  ];

  return (
    <View style={thumbStyles.frame}>
      <View style={thumbStyles.satelliteBase} />
      {patches.map((patch, index) => (
        <View key={index} style={[thumbStyles.satellitePatch, patch]} />
      ))}
    </View>
  );
}

/** Google Maps–style layer picker (Default / Satellite). */
export function MapTypeToggle({ value, onChange, layout = "vertical" }: MapTypeToggleProps) {
  const isHorizontal = layout === "horizontal";

  return (
    <View style={[styles.container, isHorizontal && styles.containerHorizontal]}>
      <Pressable
        style={[styles.option, isHorizontal && styles.optionHorizontal, value === "default" && styles.optionActive]}
        onPress={() => onChange("default")}
        accessibilityRole="button"
        accessibilityState={{ selected: value === "default" }}
        accessibilityLabel="Default map view"
      >
        <MapLayerThumbnail />
        <Text style={[styles.label, value === "default" && styles.labelActive]}>Default</Text>
      </Pressable>

      <View style={isHorizontal ? styles.dividerHorizontal : styles.divider} />

      <Pressable
        style={[
          styles.option,
          isHorizontal && styles.optionHorizontal,
          value === "satellite" && styles.optionActive,
        ]}
        onPress={() => onChange("satellite")}
        accessibilityRole="button"
        accessibilityState={{ selected: value === "satellite" }}
        accessibilityLabel="Satellite map view"
      >
        <SatelliteLayerThumbnail />
        <Text style={[styles.label, value === "satellite" && styles.labelActive]}>Satellite</Text>
      </Pressable>
    </View>
  );
}

const thumbStyles = StyleSheet.create({
  frame: {
    width: 48,
    height: 48,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "rgba(60, 64, 67, 0.2)",
    overflow: "hidden",
    backgroundColor: "#E8E4D9",
  },
  mapLand: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#EDE8D8",
  },
  mapPark: {
    position: "absolute",
    backgroundColor: "#B8D4A8",
    borderRadius: 1,
  },
  mapWater: {
    position: "absolute",
    backgroundColor: "#A8C8E8",
    borderRadius: 2,
  },
  mapRoadYellow: {
    position: "absolute",
    height: 7,
    backgroundColor: "#F9AB00",
    borderRadius: 1,
    borderWidth: 0.5,
    borderColor: "#E69600",
  },
  mapRoadWhite: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
    borderWidth: 0.5,
    borderColor: "#DADCE0",
  },
  satelliteBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#4A5D42",
  },
  satellitePatch: {
    position: "absolute",
    borderRadius: 1,
    opacity: 0.95,
  },
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(60, 64, 67, 0.18)",
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  containerHorizontal: {
    flexDirection: "row",
    alignSelf: "center",
    width: 148,
  },
  option: {
    width: 64,
    paddingVertical: 6,
    paddingHorizontal: 6,
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
  },
  optionHorizontal: {
    width: 72,
  },
  optionActive: {
    backgroundColor: "#E8F0FE",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#3C4043",
  },
  labelActive: {
    color: "#1A73E8",
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(60, 64, 67, 0.12)",
  },
  dividerHorizontal: {
    width: 1,
    backgroundColor: "rgba(60, 64, 67, 0.12)",
  },
});
