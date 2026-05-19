import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

import { api } from "@/api/api";

/** Matches `handlers.ChargerVerifyRequest` / `ChargerStatusResponse` in Vajrabackend. */
export type VerifyChargerRequest = {
  charger_id: string;
  connector_id: number;
};

export type VerifyChargerResponse = {
  charger_id: string;
  connector_id: number;
  status: string;
  available: boolean;
  last_seen: string;
};

export type ChargerStatusResponse = VerifyChargerResponse;

export type ChargingSession = {
  id: string;
  charger_id: string;
  connector_id: number;
  user_id: string;
  start_time: string;
  end_time: string | null;
  energy_kwh: number;
  cost: number;
  status: string;
  legacy_transaction_id?: number;
  transaction_ref?: string;
  /** OCPP transaction id (backend exposes this JSON field as `transaction_id`). */
  transaction_id?: string;
  remote_start_id?: string;
  charging_state?: string;
  is_active?: boolean;
  failure_reason?: string;
  stop_requested_at?: string;
  stop_poll_claimed_at?: string;
  billed_at?: string;
};

type StartChargingRequest = {
  charger_id: string;
  connector_id: number;
};

type StartChargingResponse = {
  session_id: string;
  status: string;
};

type StopChargingRequest = {
  session_id: string;
};

type StopChargingResponse = {
  session_id: string;
  status: string;
  final_energy_kwh?: number;
  final_cost?: number;
  failure_reason?: string;
};

type ChargingSessionsResponse = ChargingSession[];

export const chargingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    verifyCharger: builder.mutation<
      VerifyChargerResponse,
      VerifyChargerRequest
    >({
      query: (body) => ({
        url: "/chargers/verify",
        method: "POST",
        body,
      }),
    }),
    /** GET `/chargers/:id/status` — live connector status from Citrine/Hasura cache. */
    getChargerStatus: builder.query<
      ChargerStatusResponse,
      { chargerId: string; connectorId?: number }
    >({
      query: ({ chargerId, connectorId = 1 }) => ({
        url: `/chargers/${encodeURIComponent(chargerId)}/status`,
        method: "GET",
        params: { connector_id: connectorId },
      }),
    }),
    startCharging: builder.mutation<
      StartChargingResponse,
      StartChargingRequest
    >({
      async queryFn(body, _api, _extraOptions, baseQuery) {
        const result = await baseQuery({
          url: "/charging/start",
          method: "POST",
          body,
        });
        if (result.error) {
          return { error: result.error as FetchBaseQueryError };
        }
        const raw = result.data as Record<string, unknown>;
        const sessionId = raw?.session_id;
        if (typeof sessionId === "string" && sessionId.length > 0) {
          return {
            data: {
              session_id: sessionId,
              status: typeof raw.status === "string" ? raw.status : "",
            },
          };
        }
        const errMsg =
          typeof raw?.error === "string"
            ? raw.error
            : "Unable to start charging.";
        return {
          error: {
            status: 422,
            data: { error: errMsg, code: raw?.code, ...raw },
          } as FetchBaseQueryError,
        };
      },
    }),
    stopCharging: builder.mutation<StopChargingResponse, StopChargingRequest>({
      query: (body) => ({
        url: "/charging/stop",
        method: "POST",
        body,
      }),
    }),
    getChargingSession: builder.query<ChargingSession, string>({
      query: (sessionId) => ({
        url: `/charging/session/${sessionId}`,
        method: "GET",
      }),
    }),
    getChargingSessions: builder.query<
      ChargingSessionsResponse,
      { status?: string } | void
    >({
      query: (params) => {
        const status = params?.status ? `?status=${params.status}` : "";
        return {
          url: `/charging/sessions${status}`,
          method: "GET",
        };
      },
    }),
    getActiveChargingSession: builder.query<ChargingSession | null, void>({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        const result = await baseQuery({
          url: "/charging/active",
          method: "GET",
        });
        if (result.error) {
          if (result.error.status === 404) {
            return { data: null };
          }
          return { error: result.error as FetchBaseQueryError };
        }
        return { data: result.data as ChargingSession };
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useVerifyChargerMutation,
  useGetChargerStatusQuery,
  useLazyGetChargerStatusQuery,
  useStartChargingMutation,
  useStopChargingMutation,
  useGetChargingSessionQuery,
  useGetChargingSessionsQuery,
  useGetActiveChargingSessionQuery,
} = chargingApi;
