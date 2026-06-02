import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { QrScannerView } from "components/qr/QrScannerView";
import { useTabScreenInsets } from "@/hooks/use-tab-screen-insets";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useWebContentPadding } from "@/hooks/use-web-content-padding";
import { BREAKPOINT_MEDIUM } from "@/hooks/use-responsive-layout";
import { V } from "@/theme/vajra";
import { IconSymbol } from "components/ui/icon-symbol";

const INFO_COPY = "Scan the QR code on the charger to verify and start charging.";

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

  const handleRefresh = useCallback(async () => {
    setScanned(false);
    await requestPermission();
  }, [requestPermission]);

  const { refreshControl } = usePullToRefresh(handleRefresh, false);

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    setScanned(true);
    const payload = data?.trim() ? encodeURIComponent(data.trim()) : "";
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
            Open this screen to scan a charger QR code.
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
              ? "Enable camera access in your browser (address bar or site settings) to scan the charger QR code."
              : "Enable camera access in your device settings to scan the charger QR code."}
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
          refreshControl={refreshControl}
          contentContainerStyle={{
            paddingTop: webPadding.scrollPaddingTop,
            paddingBottom: webPadding.paddingBottom,
            paddingHorizontal: webPadding.paddingHorizontal,
            width: webPadding.width,
            alignSelf: webPadding.alignSelf,
          }}
        >
          {pageHeader}
          <View style={isWideWeb ? styles.webScannerWide : styles.webStack}>
            {permissionUi}
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
          refreshControl={refreshControl}
        >
          {pageHeader}
          {permissionUi}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.nativeLayout}>
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
            refreshControl={refreshControl}
            contentContainerStyle={[styles.panelScroll, { paddingBottom: bottom }]}
          >
            {pageHeader}
          </ScrollView>
        </View>
      </View>
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
  webScannerWide: {
    maxWidth: 420,
    marginTop: 4,
  },
  webStack: {
    marginTop: 4,
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
