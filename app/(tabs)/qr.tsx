import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { QrScannerView } from "components/qr/QrScannerView";
import { useTabScreenInsets } from "@/hooks/use-tab-screen-insets";
import { useWebContentPadding } from "@/hooks/use-web-content-padding";
import { BREAKPOINT_MEDIUM } from "@/hooks/use-responsive-layout";
import { V } from "@/theme/vajra";
import { IconSymbol } from "components/ui/icon-symbol";

const INFO_COPY =
  "Scan the QR code on the charger, or enter the charger ID and connector below.";

export default function QRScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const isWeb = Platform.OS === "web";
  const { height, width } = useWindowDimensions();
  const { bottom } = useTabScreenInsets();
  const webPadding = useWebContentPadding();
  const isWideWeb = isWeb && width >= BREAKPOINT_MEDIUM;
  const scannerHeight = Math.min(Math.max(height * 0.38, 200), 340);

  const [permission, requestPermission] = useCameraPermissions();
  const hasPermission = permission?.granted ?? null;
  const [scanned, setScanned] = useState(false);
  const [manualChargerId, setManualChargerId] = useState("");
  const [manualConnectorId, setManualConnectorId] = useState("1");

  useEffect(() => {
    if (!isFocused) return;
    if (hasPermission === null) {
      requestPermission();
    }
  }, [isFocused, hasPermission, requestPermission]);

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

  const permissionUi = (() => {
    if (!isFocused) {
      return (
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>QR scanner</Text>
          <Text style={styles.permissionBody}>
            Open this screen to scan a charger QR code. You can still enter
            the charger ID manually below.
          </Text>
        </View>
      );
    }
    if (hasPermission === null) {
      return (
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>Camera access needed</Text>
          <Text style={styles.permissionBody}>
            Allow camera access to scan the QR code on the charger.
          </Text>
        </View>
      );
    }
    if (hasPermission === false) {
      return (
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>Camera permission denied</Text>
          <Text style={styles.permissionBody}>
            {isWeb
              ? "Enable camera access in your browser (address bar or site settings), or enter the charger ID manually below."
              : "Enable camera access in your device settings, or enter the charger ID manually below."}
          </Text>
          <Pressable style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Allow camera</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <QrScannerView
        active={isFocused}
        scanned={scanned}
        onBarcodeScanned={handleBarCodeScanned}
        onRescan={() => setScanned(false)}
        {...(isWeb
          ? { aspectRatio: 16 / 10, maxHeight: 260 }
          : { height: scannerHeight })}
        style={isWeb ? styles.webScanner : styles.scannerSpacing}
      />
    );
  })();

  const manualForm = (
    <View style={isWeb ? styles.formCardWeb : styles.formCard}>
      <Text style={styles.manualHeading}>Or enter manually</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Charger ID</Text>
        <TextInput
          placeholder="e.g. CP-001"
          value={manualChargerId}
          onChangeText={setManualChargerId}
          style={isWeb ? styles.inputWeb : styles.input}
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
          style={isWeb ? styles.inputWeb : styles.input}
          placeholderTextColor={V.label}
        />
      </View>
      <Pressable style={styles.primaryBtn} onPress={handleManualSubmit}>
        <Text style={styles.primaryText}>Verify Charger</Text>
      </Pressable>
    </View>
  );

  const pageHeader = (
    <>
      <Text style={[styles.pageTitle, isWeb && styles.pageTitleWeb]}>
        Charger verification
      </Text>
      <View style={isWeb ? styles.infoBannerWeb : styles.infoBanner}>
        <IconSymbol name="info.circle.fill" size={18} color={V.primary} />
        <Text style={isWeb ? styles.infoTextWeb : styles.infoText}>{INFO_COPY}</Text>
      </View>
    </>
  );

  if (isWeb) {
    return (
      <View style={styles.webRoot}>
        <ScrollView
          style={styles.webScrollView}
          showsVerticalScrollIndicator
          contentContainerStyle={{
            paddingTop: webPadding.scrollPaddingTop,
            paddingBottom: webPadding.paddingBottom,
            paddingHorizontal: webPadding.paddingHorizontal,
            width: webPadding.width,
            alignSelf: webPadding.alignSelf,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {pageHeader}
          <View style={isWideWeb ? styles.webSplit : styles.webStack}>
            <View style={isWideWeb ? styles.webScannerCol : undefined}>
              {permissionUi}
            </View>
            <View style={isWideWeb ? styles.webFormCol : undefined}>
              {manualForm}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (hasPermission === null || hasPermission === false) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <ScrollView
          contentContainerStyle={[styles.nativeFallbackScroll, { paddingBottom: bottom }]}
          keyboardShouldPersistTaps="handled"
        >
          {pageHeader}
          {permissionUi}
          {manualForm}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.nativeLayout}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.scannerSlot, { height: scannerHeight }]}>
          <QrScannerView
            scanned={scanned}
            onBarcodeScanned={handleBarCodeScanned}
            onRescan={() => setScanned(false)}
            height={scannerHeight}
            style={styles.scannerFill}
          />
        </View>

        <View style={styles.panel}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.panelScroll, { paddingBottom: bottom }]}
          >
            {pageHeader}
            {manualForm}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  webRoot: {
    flex: 1,
    minHeight: 0,
    backgroundColor: V.pageBg,
  },
  webScrollView: {
    flex: 1,
  },
  webSplit: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 24,
    marginTop: 4,
  },
  webStack: {
    marginTop: 4,
  },
  webScannerCol: {
    flex: 1,
    minWidth: 280,
    maxWidth: 420,
  },
  webFormCol: {
    flex: 1,
    minWidth: 280,
  },
  webScanner: {
    width: "100%",
  },
  scannerSpacing: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: V.headingDeep,
    marginBottom: 14,
  },
  pageTitleWeb: {
    fontSize: 26,
    width: "100%",
    flexShrink: 0,
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
    marginTop: 0,
    width: "100%",
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
  nativeLayout: { flex: 1 },
  nativeFallbackScroll: {
    padding: 20,
    flexGrow: 1,
  },
  scannerSlot: {
    width: "100%",
  },
  scannerFill: {
    flex: 1,
    borderRadius: 0,
    borderWidth: 0,
  },
  panel: {
    flex: 1,
    backgroundColor: V.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  panelScroll: {
    padding: 20,
    flexGrow: 1,
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
  manualHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: V.heading,
    marginBottom: 14,
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
  permissionCard: {
    backgroundColor: V.panelTint,
    borderRadius: V.radiusCard,
    borderWidth: 1,
    borderColor: V.borderNavy,
    padding: 20,
    marginBottom: 4,
    alignItems: "center",
  },
  permissionTitle: {
    fontSize: 16,
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
    marginTop: 14,
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
