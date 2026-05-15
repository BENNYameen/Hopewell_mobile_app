import { useFocusEffect } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { V } from "@/theme/vajra";
import { IconSymbol } from "components/ui/icon-symbol";

const INFO_COPY_WEB =
  "On mobile, scan the QR code on the charger. On web, enter the charger ID printed on the station.";
const INFO_COPY_NATIVE =
  "On mobile, scan the QR code on the charger — or enter the charger ID below.";

export default function QRScreen() {
  const router = useRouter();
  const isWeb = Platform.OS === "web";
  const [permission, requestPermission] = useCameraPermissions();
  const hasPermission = permission?.granted ?? null;
  const [scanned, setScanned] = useState(false);
  const [manualChargerId, setManualChargerId] = useState("");
  const [manualConnectorId, setManualConnectorId] = useState(
    isWeb ? "1" : "",
  );

  useEffect(() => {
    if (isWeb) return;
    if (hasPermission === null) {
      requestPermission();
    }
  }, [isWeb, hasPermission, requestPermission]);

  useFocusEffect(
    useCallback(() => {
      setScanned(false);
    }, []),
  );

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

  if (isWeb) {
    return (
      <View style={styles.webRoot}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.webScroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.pageTitle}>Charger verification</Text>

          <View style={styles.infoBannerWeb}>
            <IconSymbol name="info.circle.fill" size={18} color={V.primary} />
            <Text style={styles.infoTextWeb}>{INFO_COPY_WEB}</Text>
          </View>

          <View style={styles.formCardWeb}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Charger ID</Text>
              <TextInput
                placeholder="e.g. CP-001"
                value={manualChargerId}
                onChangeText={setManualChargerId}
                style={styles.inputWeb}
                autoCapitalize="none"
                placeholderTextColor={V.label}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Connector ID</Text>
              <TextInput
                placeholder="1"
                value={manualConnectorId}
                onChangeText={setManualConnectorId}
                keyboardType="number-pad"
                style={styles.inputWeb}
                placeholderTextColor={V.label}
              />
            </View>
            <Pressable style={styles.primaryBtn} onPress={handleManualSubmit}>
              <Text style={styles.primaryText}>Verify Charger</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

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
      <View style={styles.scanner}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "pdf417"],
          }}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      <View style={styles.panel}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.panelScroll}
        >
          <Text style={styles.pageTitle}>Charger verification</Text>

          <View style={styles.infoBanner}>
            <IconSymbol name="info.circle.fill" size={18} color={V.primary} />
            <Text style={styles.infoText}>{INFO_COPY_NATIVE}</Text>
          </View>

          {scanned ? (
            <Pressable onPress={() => setScanned(false)} style={styles.rescan}>
              <Text style={styles.rescanText}>Tap to scan again</Text>
            </Pressable>
          ) : null}

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Charger ID</Text>
              <TextInput
                placeholder="e.g. CP-001"
                value={manualChargerId}
                onChangeText={setManualChargerId}
                style={styles.input}
                autoCapitalize="none"
                placeholderTextColor={V.label}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Connector ID</Text>
              <TextInput
                placeholder="1"
                value={manualConnectorId}
                onChangeText={setManualConnectorId}
                keyboardType="number-pad"
                style={styles.input}
                placeholderTextColor={V.label}
              />
            </View>
            <Pressable style={styles.primaryBtn} onPress={handleManualSubmit}>
              <Text style={styles.primaryText}>Verify Charger</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webRoot: {
    flex: 1,
    backgroundColor: V.card,
  },
  webScroll: {
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 40,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
  },
  infoBannerWeb: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: V.successFill,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(33, 179, 167, 0.22)",
    padding: 14,
    marginBottom: 20,
  },
  infoTextWeb: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: V.tealBadgeText,
    lineHeight: 18,
  },
  formCardWeb: {
    backgroundColor: V.card,
    borderRadius: V.radiusCard,
    borderWidth: 1,
    borderColor: V.borderNavy,
    padding: 24,
    ...V.shadowCard,
  },
  inputWeb: {
    borderWidth: 1,
    borderColor: V.borderNavyMedium,
    borderRadius: V.radiusInput,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    fontWeight: "600",
    color: V.headingDeep,
    backgroundColor: "#F3F6FB",
  },

  container: { flex: 1, backgroundColor: V.pageBg },

  scanner: {
    flex: 1.1,
  },

  panel: {
    flex: 1,
    backgroundColor: V.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  panelScroll: {
    padding: 20,
    paddingBottom: 32,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: V.headingDeep,
    marginBottom: 14,
  },

  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: V.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: V.borderNavy,
    padding: 14,
    marginBottom: 16,
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: V.bodySecondary,
    lineHeight: 18,
  },

  rescan: {
    marginBottom: 12,
    alignItems: "center",
  },

  rescanText: {
    color: V.primary,
    fontWeight: "700",
    fontSize: 14,
  },

  formCard: {
    backgroundColor: V.card,
    borderRadius: V.radiusCard,
    borderWidth: 1,
    borderColor: V.borderNavy,
    padding: 20,
    ...V.shadowCard,
  },

  inputGroup: {
    marginBottom: 14,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: V.heading,
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: V.borderNavyMedium,
    borderRadius: V.radiusInput,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    fontWeight: "600",
    color: V.headingDeep,
    backgroundColor: V.pageBg,
  },

  primaryBtn: {
    backgroundColor: V.primary,
    paddingVertical: 14,
    borderRadius: V.radiusInput,
    alignItems: "center",
    marginTop: 4,
  },

  primaryText: {
    color: V.card,
    fontWeight: "700",
    fontSize: 14,
  },

  permissionContainer: {
    flex: 1,
    backgroundColor: V.pageBg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  permissionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: V.headingDeep,
    textAlign: "center",
  },

  permissionBody: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: V.bodySecondary,
    textAlign: "center",
    lineHeight: 20,
  },

  permissionButton: {
    marginTop: 16,
    backgroundColor: V.primary,
    borderRadius: V.radiusPill,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },

  permissionButtonText: {
    color: V.card,
    fontSize: 12,
    fontWeight: "700",
  },
});
