import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import {
  useStartChargingMutation,
  useVerifyChargerMutation,
} from "@/charging/charging.api";

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
      <View style={styles.panel}>
        <Text style={styles.title}>Charger verification</Text>
        <Pressable style={styles.scanAgainButton} onPress={handleScanAgain}>
          <Text style={styles.scanAgainText}>Scan Again</Text>
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
          <Text style={styles.statusHint}>Verifying charger...</Text>
        ) : null}

        {verified && data ? (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Charger info</Text>
              <Text style={styles.cardText}>Charger: {data.charger_id}</Text>
              <Text style={styles.cardText}>
                Connector: {data.connector?.connector_id ?? "Unknown"}
              </Text>
              {data.location ? (
                <Text style={styles.cardText}>Location: {data.location}</Text>
              ) : null}
              {data.charger_type ? (
                <Text style={styles.cardText}>Type: {data.charger_type}</Text>
              ) : null}
              {data.power_kw ? (
                <Text style={styles.cardText}>Power: {data.power_kw} kW</Text>
              ) : null}
            </View>
            <View style={styles.statusCard}>
              <Text style={styles.statusTitle}>Status</Text>
              <Text style={styles.statusText}>
                {data.available
                  ? "Available"
                  : data.connector?.status ?? "Unavailable"}
              </Text>
              <Text style={styles.statusHint}>
                {canStartCharging ? "Available to start." : "Not available."}
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
              {isStarting ? "Starting..." : "Start Charging"}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6FB",
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
    paddingTop: 24,
  },
  scanAgainButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.4)",
    marginBottom: 14,
  },
  scanAgainText: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 12,
  },
  errorText: {
    fontSize: 12,
    color: "#C81D2C",
    fontWeight: "600",
    marginBottom: 8,
  },
  card: {
    marginTop: 12,
    backgroundColor: "#F7FAFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(40, 92, 153, 0.12)",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A2850",
    marginBottom: 6,
  },
  cardText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6C7CA6",
    marginBottom: 4,
  },
  statusCard: {
    marginTop: 14,
    backgroundColor: "#E7FBF9",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(33, 179, 167, 0.4)",
  },
  statusTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F6A6A",
  },
  statusText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  statusHint: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#0F6A6A",
  },
  primaryBtn: {
    backgroundColor: "#21B3A7",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "700",
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
