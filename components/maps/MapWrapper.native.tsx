import { StyleSheet, Text, View } from "react-native";

import { MobileMap } from "./MobileMap";
import type { MapWrapperProps } from "./types";

export default function MapWrapper(props: MapWrapperProps) {
  // Always render the map so it initialises immediately.
  // Charger data arriving later triggers fitToCoordinates inside MobileMap.
  return (
    <View style={styles.full}>
      <MobileMap {...props} />
      {props.errorMessage ? (
        <View style={[styles.banner, styles.errorBanner]}>
          <Text style={styles.bannerText}>{props.errorMessage}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1, width: "100%", height: "100%" },
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 10,
  },
  errorBanner: { backgroundColor: "rgba(164,46,59,0.9)" },
  bannerText: { color: "#fff", fontSize: 13, fontWeight: "700", textAlign: "center" },
});
