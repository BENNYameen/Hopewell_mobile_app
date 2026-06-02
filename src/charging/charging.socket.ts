import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { ACCESS_TOKEN_KEY } from "@/auth/session";
import { getItemAsync } from "@/auth/secureStorage";
import { syncChargingSessionCaches } from "@/charging/chargingCacheSync";
import { WS_BASE_URL } from "@/config/runtime";

/** Payload from Vajrabackend `sessionUpdatePayload` over `/ws/charging/:session_id`. */
export type ChargingUpdate = {
  session_id?: string;
  status?: string;
  energy_kwh?: number;
  cost?: number;
  transaction_ref?: string;
  transaction_id?: string;
  charging_state?: string;
  is_active?: boolean;
  failure_reason?: string;
  stop_requested?: boolean;
  billed_at?: string;
  charger_id?: string;
  connector_id?: number;
  /** Legacy / optional fields */
  charger_name?: string;
  duration_sec?: number;
  power_kw?: number;
};

type ChargingSocketState = {
  data: ChargingUpdate | null;
  connected: boolean;
  error: string | null;
};

export function useChargingSocket(
  sessionId: string | null,
  enabled = true,
) {
  const dispatch = useDispatch();
  const [state, setState] = useState<ChargingSocketState>({
    data: null,
    connected: false,
    error: null,
  });
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!sessionId || !WS_BASE_URL || !enabled) {
      return;
    }

    let isActive = true;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectAttempts = 0;

    const scheduleReconnect = () => {
      if (!isActive) return;
      const delay = Math.min(10000, 1000 * 2 ** reconnectAttempts);
      reconnectAttempts += 1;
      reconnectTimer = setTimeout(() => {
        connect();
      }, delay);
    };

    const connect = async () => {
      const token = await getItemAsync(ACCESS_TOKEN_KEY);
      if (!isActive) return;

      if (!token) {
        setState((prev) => ({
          ...prev,
          connected: false,
          error: "Missing auth token.",
        }));
        return;
      }

      const encodedToken = encodeURIComponent(token);
      socket = new WebSocket(
        `${WS_BASE_URL}/ws/charging/${sessionId}?token=${encodedToken}`,
      );
      socketRef.current = socket;

      socket.onopen = () => {
        if (!isActive) return;
        reconnectAttempts = 0;
        setState((prev) => ({ ...prev, connected: true, error: null }));
      };

      socket.onmessage = (event) => {
        if (!isActive) return;
        try {
          const parsed = JSON.parse(event.data) as ChargingUpdate;
          setState((prev) => ({ ...prev, data: parsed }));
          if (sessionId) {
            syncChargingSessionCaches(dispatch, sessionId, parsed);
          }
        } catch {
          setState((prev) => ({
            ...prev,
            error: "Invalid charging update payload.",
          }));
        }
      };

      socket.onerror = () => {
        if (!isActive) return;
        setState((prev) => ({ ...prev, error: "WebSocket error." }));
      };

      socket.onclose = () => {
        if (!isActive) return;
        setState((prev) => ({ ...prev, connected: false }));
        scheduleReconnect();
      };
    };

    connect();

    return () => {
      isActive = false;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      socket?.close();
      socketRef.current = null;
    };
  }, [dispatch, sessionId, enabled]);

  return state;
}
