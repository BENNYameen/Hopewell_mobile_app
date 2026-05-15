import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useStartChargingMutation,
  useVerifyChargerMutation,
} from "@/charging/charging.api";
import { V } from "@/theme/vajra";

type ParsedPayload = {
  charger_id?: string;
  connector_id?: number;
  location?: string;
  power_kw?: number;
  charger_type?: string;
};

export default function QRResultScreen() {
  const router = useRouter();
  const { payload } = useLocalSearchParams<{ payload?: string }>();
  const [payloadError, setPayloadError] = useState("");
  const [verified, setVerified] = useState(false);
  const [startErrorMessage, setStartErrorMessage] = useState("");
  const [showStartError, setShowStartError] = useState(false);
  const [verifyCharger, { data, isLoading, error }] =
    useVerifyChargerMutation();
  const [startCharging, { isLoading: isStarting }] = useStartChargingMutation();

  const canStartCharging = verified && !!data && data.available;

  const decodedPayload = useMemo(() => {
    if (!payload) return "";
    if (typeof payload === "string") {
      try {
        return decodeURIComponent(payload);
      } catch {
        return payload;
      }
    }
    return "";
  }, [payload]);

  const parsed = useMemo<ParsedPayload>(() => {
    if (!decodedPayload) return {};
    try {
      const json = JSON.parse(decodedPayload);
      return {
        charger_id: json?.charger_id ? String(json.charger_id) : undefined,
        connector_id:
          json?.connector_id !== undefined
            ? Number(json.connector_id)
            : undefined,
        location: json?.location ?? undefined,
        power_kw: json?.power_kw ? Number(json.power_kw) : undefined,
        charger_type: json?.charger_type ?? undefined,
      };
    } catch {
      return { charger_id: decodedPayload };
    }
  }, [decodedPayload]);

  useEffect(() => {
    if (!decodedPayload) {
      setPayloadError("Invalid QR payload.");
      return;
    }

    if (!parsed.charger_id) {
      setPayloadError("QR payload missing charger_id.");
      return;
    }

    setPayloadError("");
    setVerified(false);
    verifyCharger({
      charger_id: parsed.charger_id,
      connector_id: parsed.connector_id,
    })
      .unwrap()
      .then(() => setVerified(true))
      .catch(() => setVerified(false));
  }, [decodedPayload, parsed.charger_id, parsed.connector_id, verifyCharger]);

  const handleScanAgain = () => {
    router.replace("/qr");
  };

  const handleStartCharging = async () => {
    const resolvedConnectorId =
      data?.connector?.connector_id ?? parsed.connector_id;
    const resolvedChargerId = data?.charger_id ?? parsed.charger_id;

    if (!resolvedChargerId || !resolvedConnectorId) {
      setPayloadError("Missing charger or connector info.");
      return;
    }

    try {
      const response = await startCharging({
        charger_id: resolvedChargerId,
        connector_id: resolvedConnectorId,
      }).unwrap();
      setVerified(false);
      setPayloadError("");
      router.replace({
        pathname: "/recent/[id]",
        params: { id: response.session_id },
      });
    } catch (err) {
      const fallbackMessage = "Unable to start charging. Please try again.";
      const message =
        typeof err === "object" &&
        err &&
        "data" in err &&
        (err as { data?: { error?: string } }).data?.error
          ? ((err as { data?: { error?: string } }).data?.error ??
            fallbackMessage)
          : fallbackMessage;
      setStartErrorMessage(message);
      setShowStartError(true);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.panel}>
          <Text style={styles.title}>Start charging</Text>
          <Text style={styles.lead}>
            Verify the charger and connector before you plug in and begin a
            session.
          </Text>

          <View style={styles.callout}>
            <Text style={styles.calloutTitle}>Stay with your vehicle</Text>
            <Text style={styles.calloutBody}>
              Keep the cable secured and confirm the connector ID matches what
              you see on the charger display.
            </Text>
          </View>

          <Pressable style={styles.scanAgainButton} onPress={handleScanAgain}>
            <Text style={styles.scanAgainText}>Scan again</Text>
          </Pressable>

          {payloadError ? (
            <Text style={styles.errorText}>{payloadError}</Text>
          ) : null}
          {error ? (
            <Text style={styles.errorText}>
              {"data" in (error as { data?: { error?: string } })
                ? ((error as { data?: { error?: string } }).data?.error ??
                  "Unable to verify charger.")
                : "Unable to verify charger."}
            </Text>
          ) : null}

          {isLoading ? (
            <Text style={styles.statusHint}>Verifying charger…</Text>
          ) : null}

          {verified && data ? (
            <>
              <View style={styles.summary}>
                <Text style={styles.summaryTitle}>Verified details</Text>
                <Text style={styles.summaryLine}>
                  Charger · {data.charger_id}
                </Text>
                <Text style={styles.summaryLine}>
                  Connector · {data.connector?.connector_id ?? "Unknown"}
                </Text>
                {data.location ? (
                  <Text style={styles.summaryLine}>
                    Location · {data.location}
                  </Text>
                ) : null}
                {data.charger_type ? (
                  <Text style={styles.summaryLine}>
                    Type · {data.charger_type}
                  </Text>
                ) : null}
                {data.power_kw ? (
                  <Text style={styles.summaryLine}>
                    Power · {data.power_kw} kW
                  </Text>
                ) : null}
              </View>
              <View
                style={[
                  styles.statusStrip,
                  data.available ? styles.statusAvailable : styles.statusBusy,
                ]}
              >
                <Text
                  style={[
                    styles.statusStripTitle,
                    data.available
                      ? styles.statusStripTitleOk
                      : styles.statusStripTitleBad,
                  ]}
                >
                  {data.available ? "Available" : "Unavailable"}
                </Text>
                <Text
                  style={[
                    styles.statusStripBody,
                    data.available
                      ? styles.statusStripBodyOk
                      : styles.statusStripBodyBad,
                  ]}
                >
                  {canStartCharging
                    ? "Ready to start your session."
                    : data.connector?.status ??
                      "This connector cannot start a session right now."}
                </Text>
              </View>
            </>
          ) : null}

          {canStartCharging ? (
            <Pressable
              style={styles.primaryBtn}
              onPress={handleStartCharging}
              disabled={isStarting}
            >
              <Text style={styles.primaryText}>
                {isStarting ? "Starting…" : "Start charging"}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={showStartError}
        onRequestClose={() => setShowStartError(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Unable to start</Text>
            <Text style={styles.modalBody}>{startErrorMessage}</Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setShowStartError(false)}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: V.pageBg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  panel: {
    flex: 1,
    backgroundColor: V.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    marginTop: 12,
    minHeight: 520,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: V.headingDeep,
    marginBottom: 8,
    paddingTop: 28,
  },
  lead: {
    fontSize: 14,
    fontWeight: "600",
    color: V.bodySecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  callout: {
    backgroundColor: V.panelTint,
    borderRadius: V.radiusPanel,
    padding: 14,
    borderWidth: 1,
    borderColor: V.borderNavy,
    marginBottom: 14,
  },
  calloutTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: V.headingMuted,
    marginBottom: 6,
  },
  calloutBody: {
    fontSize: 13,
    fontWeight: "600",
    color: V.bodySecondary,
    lineHeight: 18,
  },
  scanAgainButton: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: V.radiusPill,
    borderWidth: 1,
    borderColor: V.headingDeep,
    backgroundColor: V.card,
    marginBottom: 14,
  },
  scanAgainText: {
    color: V.headingDeep,
    fontWeight: "700",
    fontSize: 13,
  },
  errorText: {
    fontSize: 12,
    color: V.error,
    fontWeight: "600",
    marginBottom: 8,
  },
  summary: {
    marginTop: 8,
    backgroundColor: V.card,
    borderRadius: V.radiusPanel,
    padding: 16,
    borderWidth: 1,
    borderColor: V.borderNavy,
    ...V.shadowSoft,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: V.label,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  summaryLine: {
    fontSize: 13,
    fontWeight: "600",
    color: V.bodySecondary,
    marginBottom: 6,
  },
  statusStrip: {
    marginTop: 14,
    borderRadius: V.radiusPanel,
    padding: 14,
    borderWidth: 1,
  },
  statusAvailable: {
    backgroundColor: V.successFill,
    borderColor: "rgba(15, 106, 106, 0.35)",
  },
  statusBusy: {
    backgroundColor: V.errorSurface,
    borderColor: V.errorBorder,
  },
  statusStripTitle: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  statusStripTitleOk: {
    color: V.tealBadgeText,
  },
  statusStripTitleBad: {
    color: V.error,
  },
  statusStripBody: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  statusStripBodyOk: {
    color: V.heading,
  },
  statusStripBodyBad: {
    color: V.error,
  },
  statusHint: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: V.tealBadgeText,
  },
  primaryBtn: {
    backgroundColor: V.primary,
    paddingVertical: 14,
    borderRadius: V.radiusPill,
    alignItems: "center",
    marginTop: 18,
  },
  primaryText: {
    color: V.card,
    fontWeight: "800",
    fontSize: 15,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(40, 92, 153, 0.12)",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalBody: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "600",
    color: "#6C7CA6",
  },
  modalButton: {
    marginTop: 16,
    backgroundColor: "#21B3A7",
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
