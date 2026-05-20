import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { TabScreen } from "components/vajra/TabScreen";

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

const VERIFY_TIMEOUT_MS = 20_000;

function verifyErrorMessage(err: unknown): string {
  if (
    typeof err === "object" &&
    err &&
    "data" in err &&
    (err as { data?: { error?: string } }).data?.error
  ) {
    return (
      (err as { data?: { error?: string } }).data?.error ??
      "Unable to verify charger."
    );
  }
  if (err instanceof Error && err.message === "VERIFY_TIMEOUT") {
    return "Verification timed out. Check your connection and try again.";
  }
  return "Unable to verify charger.";
}

export default function QRResultScreen() {
  const router = useRouter();
  const { payload } = useLocalSearchParams<{ payload?: string | string[] }>();
  const [payloadError, setPayloadError] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verified, setVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [startErrorMessage, setStartErrorMessage] = useState("");
  const [showStartError, setShowStartError] = useState(false);
  const verifySeqRef = useRef(0);
  const skipFocusVerifyRef = useRef(true);
  const [verifyCharger, { data, reset: resetVerify }] =
    useVerifyChargerMutation();
  const [startCharging, { isLoading: isStarting }] = useStartChargingMutation();

  const payloadRaw = Array.isArray(payload) ? payload[0] : payload;

  const decodedPayload = useMemo(() => {
    if (!payloadRaw) return "";
    try {
      return decodeURIComponent(payloadRaw);
    } catch {
      return payloadRaw;
    }
  }, [payloadRaw]);

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

  const resolvedConnectorFromQr = useMemo(() => {
    if (
      parsed.connector_id != null &&
      Number.isFinite(parsed.connector_id) &&
      parsed.connector_id >= 1
    ) {
      return parsed.connector_id;
    }
    return 1;
  }, [parsed.connector_id]);

  const verifiedDetails = useMemo(() => {
    if (!data) return null;
    const connectorId = data.connector_id ?? resolvedConnectorFromQr;
    const stationStatus =
      data.status?.trim() ||
      (data.available ? "Available" : "Unavailable");
    return {
      chargerId: data.charger_id || parsed.charger_id || "",
      connectorId,
      stationStatus,
    };
  }, [data, parsed.charger_id, resolvedConnectorFromQr]);

  const verifyKey = `${parsed.charger_id ?? ""}:${resolvedConnectorFromQr}:${decodedPayload}`;
  const showVerifying = isVerifying;
  const canStartCharging =
    verified && !!data && data.available && !showVerifying;

  const runVerification = useCallback(async () => {
    const seq = ++verifySeqRef.current;

    if (!decodedPayload) {
      setPayloadError("Invalid QR payload.");
      setVerifyError("");
      setVerified(false);
      setIsVerifying(false);
      return;
    }

    if (!parsed.charger_id) {
      setPayloadError("QR payload missing charger_id.");
      setVerifyError("");
      setVerified(false);
      setIsVerifying(false);
      return;
    }

    setPayloadError("");
    setVerifyError("");
    setVerified(false);
    setIsVerifying(true);

    const body = {
      charger_id: parsed.charger_id,
      connector_id: resolvedConnectorFromQr,
    };

    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("VERIFY_TIMEOUT")), VERIFY_TIMEOUT_MS);
    });

    try {
      await Promise.race([verifyCharger(body).unwrap(), timeout]);
      if (seq !== verifySeqRef.current) return;
      setVerified(true);
    } catch (err) {
      if (seq !== verifySeqRef.current) return;
      setVerified(false);
      setVerifyError(verifyErrorMessage(err));
    } finally {
      if (seq === verifySeqRef.current) {
        setIsVerifying(false);
      }
    }
  }, [
    decodedPayload,
    parsed.charger_id,
    resolvedConnectorFromQr,
    verifyCharger,
  ]);

  useEffect(() => {
    void runVerification();
  }, [verifyKey, runVerification]);

  useFocusEffect(
    useCallback(() => {
      if (skipFocusVerifyRef.current) {
        skipFocusVerifyRef.current = false;
        return;
      }

      void runVerification();

      return () => {
        verifySeqRef.current += 1;
        setIsVerifying(false);
      };
    }, [runVerification]),
  );

  const handleScanAgain = () => {
    router.replace("/qr");
  };

  const handleStartCharging = async () => {
    const resolvedConnectorId = data?.connector_id ?? resolvedConnectorFromQr;
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
      resetVerify();
      setVerified(false);
      setIsVerifying(false);
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
    <TabScreen contentContainerStyle={styles.scrollContent}>
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
          {verifyError ? (
            <Text style={styles.errorText}>{verifyError}</Text>
          ) : null}

          {showVerifying ? (
            <View style={styles.verifyingRow}>
              <ActivityIndicator size="small" color={V.primary} />
              <Text style={styles.statusHint}>Verifying charger…</Text>
            </View>
          ) : null}

          {verified && data && verifiedDetails && !showVerifying ? (
            <>
              <View style={styles.summary}>
                <Text style={styles.summaryTitle}>Verified details</Text>
                <Text style={styles.summaryLine}>
                  Charger · {verifiedDetails.chargerId}
                </Text>
                <Text style={styles.summaryLine}>
                  Connector · {verifiedDetails.connectorId}
                </Text>
                <Text style={styles.summaryLine}>
                  Station status · {verifiedDetails.stationStatus}
                </Text>
                {data.last_seen ? (
                  <Text style={styles.summaryLine}>
                    Last seen · {data.last_seen}
                  </Text>
                ) : null}
                {parsed.location ? (
                  <Text style={styles.summaryLine}>
                    Location · {parsed.location}
                  </Text>
                ) : null}
                {parsed.charger_type ? (
                  <Text style={styles.summaryLine}>
                    Type · {parsed.charger_type}
                  </Text>
                ) : null}
                {parsed.power_kw ? (
                  <Text style={styles.summaryLine}>
                    Power · {parsed.power_kw} kW
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
                    : data.status ||
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
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  panel: {
    flexGrow: 1,
    backgroundColor: V.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    marginTop: 4,
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
  verifyingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  statusHint: {
    fontSize: 13,
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
