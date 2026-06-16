import type { ChargingSession } from "@/charging/charging.api";
import type { ChargingUpdate } from "@/charging/charging.socket";
import { isSessionLive } from "@/charging/sessionStatus";

export function sessionDurationMinutes(
  startTime: string,
  endTime: string | null | undefined,
  liveDurationSec?: number | null,
  nowMs: number = Date.now(),
): number {
  if (liveDurationSec != null && liveDurationSec >= 0) {
    return Math.max(0, Math.round(liveDurationSec / 60));
  }

  const startMs = new Date(startTime).getTime();
  const endMs = endTime ? new Date(endTime).getTime() : nowMs;
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    return 0;
  }

  return Math.max(0, Math.round((endMs - startMs) / 60_000));
}

export type MergedLiveSession = {
  session: ChargingSession;
  status: string;
  energyKwh: number;
  cost: number;
  durationMin: number;
  chargerLabel: string;
  wsConnected: boolean;
};

export function mergeLiveSessionMetrics(
  session: ChargingSession,
  wsData: ChargingUpdate | null | undefined,
  wsConnected: boolean,
  nowMs: number = Date.now(),
): MergedLiveSession {
  const status = wsData?.status ?? session.status;
  const energyKwh = wsData?.energy_kwh ?? session.energy_kwh ?? 0;
  const cost = wsData?.cost ?? session.cost ?? 0;
  const durationMin = sessionDurationMinutes(
    session.start_time,
    session.end_time,
    wsData?.duration_sec,
    nowMs,
  );

  return {
    session,
    status,
    energyKwh,
    cost,
    durationMin,
    chargerLabel: wsData?.charger_name ?? session.charger_id,
    wsConnected,
  };
}

export function mergeSessionDetailMetrics(
  session: ChargingSession,
  wsData: ChargingUpdate | null | undefined,
  activeLive: MergedLiveSession | null | undefined,
  nowMs: number = Date.now(),
): MergedLiveSession {
  if (activeLive?.session.id === session.id) {
    return activeLive;
  }

  return mergeLiveSessionMetrics(session, wsData, !!wsData, nowMs);
}

export function isChargingSessionLive(status: string): boolean {
  return isSessionLive(status);
}
