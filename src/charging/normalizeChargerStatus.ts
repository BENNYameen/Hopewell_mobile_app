import type { VerifyChargerResponse } from "@/charging/charging.api";

type StatusRequest = {
  charger_id?: string;
  connector_id?: number;
};

function readString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function readConnectorId(
  raw: Record<string, unknown>,
  request?: StatusRequest,
): number {
  const nested =
    raw.connector && typeof raw.connector === "object"
      ? (raw.connector as Record<string, unknown>)
      : null;

  const candidates = [
    raw.connector_id,
    raw.connectorId,
    nested?.connector_id,
    nested?.connectorId,
    nested?.id,
    request?.connector_id,
  ];

  for (const value of candidates) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 1) {
      return Math.trunc(parsed);
    }
  }

  return 1;
}

function readStatus(raw: Record<string, unknown>, available: boolean): string {
  const nested =
    raw.connector && typeof raw.connector === "object"
      ? (raw.connector as Record<string, unknown>)
      : null;

  const status = readString(
    raw.status,
    raw.connector_status,
    raw.connectorStatus,
    raw.station_status,
    raw.stationStatus,
    nested?.status,
    nested?.connector_status,
    nested?.connectorStatus,
  );

  if (status) {
    return status;
  }

  return available ? "Available" : "Unavailable";
}

/** Normalize verify/status payloads from API (handles legacy or partial shapes). */
export function normalizeChargerStatusResponse(
  raw: unknown,
  request?: StatusRequest,
): VerifyChargerResponse {
  const record =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const chargerId = readString(
    record.charger_id,
    record.chargerId,
    request?.charger_id,
  );

  const connectorId = readConnectorId(record, request);

  const available =
    typeof record.available === "boolean"
      ? record.available
      : typeof record.is_available === "boolean"
        ? record.is_available
        : false;

  const status = readStatus(record, available);

  const resolvedAvailable =
    available ||
    status.toLowerCase() === "available" ||
    status.toLowerCase() === "preparing";

  const lastSeen = readString(record.last_seen, record.lastSeen);

  return {
    charger_id: chargerId,
    connector_id: connectorId,
    status,
    available: resolvedAvailable,
    last_seen: lastSeen,
  };
}
