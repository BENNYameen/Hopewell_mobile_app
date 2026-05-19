import { CameraView } from "expo-camera";
import { Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

import { V } from "@/theme/vajra";
import { IconSymbol } from "components/ui/icon-symbol";

type BarcodeScanResult = { type: string; data: string };

type QrScannerViewProps = {
  /** When false, camera hardware is not mounted (e.g. tab not focused). */
  active?: boolean;
  scanned: boolean;
  onBarcodeScanned: (result: BarcodeScanResult) => void;
  onRescan: () => void;
  /** Fixed height (mobile / fallback). */
  height?: number;
  /** Prefer aspect-ratio sizing on web (width-driven). */
  aspectRatio?: number;
  maxHeight?: number;
  style?: ViewStyle;
};

export function QrScannerView({
  active = true,
  scanned,
  onBarcodeScanned,
  onRescan,
  height,
  aspectRatio,
  maxHeight,
  style,
}: QrScannerViewProps) {
  const useAspectRatio = aspectRatio != null && Platform.OS === "web";
  const fixedHeight = height ?? 280;

  return (
    <View
      style={[
        styles.wrap,
        useAspectRatio
          ? { aspectRatio, maxHeight, minHeight: 200 }
          : { height: fixedHeight },
        style,
      ]}
    >
      {active ? (
        <CameraView
          onBarcodeScanned={scanned ? undefined : onBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "pdf417"],
          }}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, styles.cameraOff]} />
      )}

      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.frame} />
      </View>

      <View style={styles.labelRow} pointerEvents="none">
        <IconSymbol name="qrcode" size={16} color={V.card} />
        <Text style={styles.labelText} numberOfLines={2}>
          {scanned ? "Code captured" : "Align the charger QR inside the frame"}
        </Text>
      </View>

      {scanned ? (
        <Pressable style={styles.rescanBtn} onPress={onRescan}>
          <Text style={styles.rescanText}>Scan again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cameraOff: {
    backgroundColor: V.headingDeep,
  },
  wrap: {
    width: "100%",
    borderRadius: V.radiusCard,
    overflow: "hidden",
    backgroundColor: V.headingDeep,
    borderWidth: 1,
    borderColor: V.borderNavy,
    ...V.shadowCard,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    width: "56%",
    maxWidth: 200,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.9)",
    backgroundColor: "transparent",
  },
  labelRow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
  },
  labelText: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "700",
    color: V.card,
    textAlign: "center",
  },
  rescanBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: V.card,
    borderRadius: V.radiusPill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  rescanText: {
    fontSize: 12,
    fontWeight: "700",
    color: V.primary,
  },
});
