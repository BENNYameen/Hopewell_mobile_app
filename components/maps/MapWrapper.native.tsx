import { StyleSheet, Text, View } from "react-native";

import { MobileMap } from "./MobileMap";
import type { MapWrapperProps } from "./types";

export default function MapWrapper(props: MapWrapperProps) {
  if (props.isLoading) {
    return (
      <View style={[styles.full, styles.center]}>
        <Text style={styles.infoText}>Loading charging stations...</Text>
      </View>
    );
  }

  if (props.errorMessage) {
    return (
      <View style={[styles.full, styles.center]}>
        <Text style={styles.errorTitle}>Map unavailable</Text>
        <Text style={styles.errorBody}>{props.errorMessage}</Text>
      </View>
    );
  }

  if (props.chargers.length === 0) {
    return (
      <View style={[styles.full, styles.center]}>
        <Text style={styles.infoText}>No chargers available for this filter.</Text>
      </View>
    );
  }

  return <MobileMap {...props} />;
}

const styles = StyleSheet.create({
  full: { flex: 1, width: "100%", height: "100%", backgroundColor: "#F3F6FB" },
  center: { alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  infoText: { color: "#1A2850", fontSize: 15, fontWeight: "600", textAlign: "center" },
  errorTitle: { color: "#A42E3B", fontSize: 17, fontWeight: "800", marginBottom: 8 },
  errorBody: { color: "#1A2850", fontSize: 14, textAlign: "center" },
});
