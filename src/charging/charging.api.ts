import { api } from "@/api/api";

type VerifyChargerRequest = {
  charger_id: string;
  connector_id?: number;
};

type VerifyChargerConnector = {
  id: string;
  charger_id: string;
  connector_id: number;
  status: string;
  error_code: string;
  last_updated: string;
};

type VerifyChargerResponse = {
  charger_id: string;
  connector: VerifyChargerConnector;
  available: boolean;
  charger_type: string;
  power_kw: number;
  location: string;
};

type ChargerConnector = {
  id: string;
  charger_id: string;
  connector_id: number;
  status: string;
  error_code: string;
  last_updated: string;
};

type ChargerWithConnectorsResponse = {
  id: string;
  status: string;
  last_seen: string;
  model: string;
  vendor: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  connectors: ChargerConnector[];
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
  status: string;
};

type ChargingSession = {
  id: string;
  charger_id: string;
  connector_id: number;
  user_id: string;
  start_time: string;
  end_time: string | null;
  energy_kwh: number;
  cost: number;
  status: string;
  transaction_id: number;
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
    getCharger: builder.query<ChargerWithConnectorsResponse, string>({
      query: (chargerId) => ({
        url: `/chargers/${chargerId}`,
        method: "GET",
      }),
    }),
    startCharging: builder.mutation<
      StartChargingResponse,
      StartChargingRequest
    >({
      query: (body) => ({
        url: "/charging/start",
        method: "POST",
        body,
      }),
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
          return { error: result.error };
        }
        return { data: result.data as ChargingSession };
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useVerifyChargerMutation,
  useGetChargerQuery,
  useStartChargingMutation,
  useStopChargingMutation,
  useGetChargingSessionQuery,
  useGetChargingSessionsQuery,
  useGetActiveChargingSessionQuery,
} = chargingApi;
