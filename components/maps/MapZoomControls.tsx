import { Pressable, StyleSheet, Text, View } from "react-native";

type MapZoomControlsProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
};

/** Custom +/- zoom controls (replaces default map zoom UI). */
export function MapZoomControls({ onZoomIn, onZoomOut }: MapZoomControlsProps) {
  return (
    <View style={styles.stack}>
      <Pressable
        style={styles.btn}
        onPress={onZoomIn}
        accessibilityRole="button"
        accessibilityLabel="Zoom in"
      >
        <Text style={styles.symbol}>+</Text>
      </Pressable>
      <View style={styles.divider} />
      <Pressable
        style={styles.btn}
        onPress={onZoomOut}
        accessibilityRole="button"
        accessibilityLabel="Zoom out"
      >
        <Text style={styles.symbol}>−</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(60, 64, 67, 0.18)",
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  btn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  symbol: {
    fontSize: 22,
    fontWeight: "400",
    color: "#3C4043",
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(60, 64, 67, 0.12)",
  },
});
