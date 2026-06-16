import { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { V } from "@/theme/vajra";
import { usePwaInstall } from "@/web/pwa/usePwaInstall";
import { InstallAppButton } from "./InstallAppButton";
import { IosInstallBanner } from "./IosInstallBanner";

export function PwaInstallEntry() {
  const {
    installed,
    canPromptInstall,
    shouldShowIosInstructions,
    secureContext,
    lastOutcome,
    promptInstall,
  } = usePwaInstall();
  const [pending, setPending] = useState(false);
  const [iosDismissed, setIosDismissed] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const installStatusText = useMemo(() => {
    if (!secureContext) return "Use HTTPS or localhost";
    if (!lastOutcome && !canPromptInstall) return "Use browser menu: Add to Home screen";
    if (!lastOutcome) return undefined;
    if (lastOutcome === "dismissed") return "Install dismissed";
    if (lastOutcome === "unavailable") return "Use browser menu: Add to Home screen";
    if (lastOutcome === "error") return "Install failed";
    return undefined;
  }, [canPromptInstall, lastOutcome, secureContext]);

  const onInstallPress = async () => {
    setPending(true);
    const outcome = await promptInstall();
    setPending(false);
    if (outcome === "unavailable") {
      setShowHelpModal(true);
    }
  };

  if (Platform.OS !== "web" || installed) return null;

  return (
    <View style={styles.wrap}>
      <InstallAppButton
        visible
        pending={pending}
        statusText={installStatusText}
        onPress={onInstallPress}
        compact
      />
      <IosInstallBanner
        visible={shouldShowIosInstructions && !iosDismissed}
        onDismiss={() => setIosDismissed(true)}
      />
      <Modal
        visible={showHelpModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowHelpModal(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => null}>
            <Text style={styles.modalTitle}>Add to Home Screen</Text>
            <Text style={styles.modalBody}>
              Android (Chrome): tap menu (⋮), then Add to Home screen.
            </Text>
            <Text style={styles.modalBody}>
              iPhone (Safari): tap Share, then Add to Home Screen.
            </Text>
            <Pressable
              style={styles.modalBtn}
              onPress={() => setShowHelpModal(false)}
            >
              <Text style={styles.modalBtnText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "flex-end",
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(11, 18, 39, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: V.borderNavy,
    backgroundColor: V.card,
    padding: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: V.headingDeep,
  },
  modalBody: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "500",
    color: V.bodySecondary,
    lineHeight: 20,
  },
  modalBtn: {
    marginTop: 16,
    alignSelf: "flex-end",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: V.primary,
  },
  modalBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: V.card,
  },
});
