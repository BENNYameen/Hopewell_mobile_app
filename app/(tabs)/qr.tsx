import { useFocusEffect } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function QRScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const hasPermission = permission?.granted ?? null;
  const [scanned, setScanned] = useState(false);
  const [manualChargerId, setManualChargerId] = useState("");
  const [manualConnectorId, setManualConnectorId] = useState("");

  /* ---------------- Permissions ---------------- */
  useEffect(() => {
    if (hasPermission === null) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  useFocusEffect(
    useCallback(() => {
      setScanned(false);
    }, []),
  );

  /* ---------------- QR Scan ---------------- */
  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    setScanned(true);
    const payload = data?.trim() ? encodeURIComponent(data.trim()) : "";
    router.replace({
      pathname: "/qr-result",
      params: { payload },
    });
  };

  const handleManualSubmit = () => {
    const chargerId = manualChargerId.trim();
    if (!chargerId) {
      return;
    }
    const connectorId = manualConnectorId.trim();
    const payloadObj = {
      charger_id: chargerId,
      connector_id: connectorId ? Number(connectorId) : undefined,
    };
    const payload = encodeURIComponent(JSON.stringify(payloadObj));
    router.replace({
      pathname: "/qr-result",
      params: { payload },
    });
  };

  /* ---------------- States ---------------- */
  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionBody}>
          We need camera permission to scan charger QR codes.
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera permission denied</Text>
        <Text style={styles.permissionBody}>
          Enable camera access in your device settings to scan QR codes.
        </Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ---------------- Camera Scanner ---------------- */}
      <View style={styles.scanner}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "pdf417"],
          }}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      {/* ---------------- Controls ---------------- */}
      <View style={styles.panel}>
        <Text style={styles.title}>Scan QR to verify charger</Text>
        {scanned ? (
          <Pressable onPress={() => setScanned(false)} style={styles.rescan}>
            <Text style={styles.rescanText}>Scan Again</Text>
          </Pressable>
        ) : null}

        <View style={styles.manualBlock}>
          <Text style={styles.manualTitle}>Enter charger manually</Text>
          <TextInput
            placeholder="Charger ID"
            value={manualChargerId}
            onChangeText={setManualChargerId}
            style={styles.input}
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Connector ID (optional)"
            value={manualConnectorId}
            onChangeText={setManualConnectorId}
            keyboardType="number-pad"
            style={styles.input}
          />
          <Pressable style={styles.primaryBtn} onPress={handleManualSubmit}>
            <Text style={styles.primaryText}>Continue</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F6FB" },

  scanner: {
    flex: 1.1,
  },

  panel: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },

  rescan: {
    marginTop: 12,
    alignItems: "center",
  },

  rescanText: {
    color: "#2563EB",
    fontWeight: "600",
  },
  manualBlock: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
  },
  manualTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(40, 92, 153, 0.2)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#F8FAFF",
  },
  primaryBtn: {
    backgroundColor: "#21B3A7",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "700",
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#F3F6FB",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  permissionBody: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#6C7CA6",
    textAlign: "center",
  },
  permissionButton: {
    marginTop: 16,
    backgroundColor: "#21B3A7",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
