import { api } from "@/api/api";

type ChargerConnectorRecord = {
  id: string;
  charger_id: string;
  connector_id: number;
  status: string;
  error_code: string;
  last_updated: string;
};

type ChargerWithConnectorsRecord = {
  id: string;
  status: string;
  last_seen: string;
  model: string;
  vendor: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  connectors: ChargerConnectorRecord[];
};

type ChargersResponse = ChargerWithConnectorsRecord[];

export type ChargingStationMapItem = {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  isOnline: boolean;
  isAvailable: boolean;
  availabilityLabel: string;
  connectorSummary: string;
  connectorCount: number;
  model: string;
  vendor: string;
  updatedAt: string;
};

function buildAddress(address: string | null | undefined) {
  const trimmedAddress = address?.trim();

  if (!trimmedAddress) {
    return "Address unavailable";
  }

  return trimmedAddress;
}

function mapStation(station: ChargerWithConnectorsRecord): ChargingStationMapItem {
  const status = station.status.trim();
  const normalizedStatus = status.toLowerCase();
  const availableConnectors = station.connectors.filter(
    (connector) => connector.status.toLowerCase() === "available",
  ).length;
  const isAvailable = normalizedStatus === "available";
  const isOnline = normalizedStatus !== "offline";
  const connectorSummary =
    station.connectors.length > 0
      ? `${availableConnectors}/${station.connectors.length} available`
      : "No connector data";

  return {
    id: station.id,
    name: station.id,
    address: buildAddress(station.address),
    latitude: station.latitude,
    longitude: station.longitude,
    isOnline,
    isAvailable,
    availabilityLabel: status || "Unknown",
    connectorSummary,
    connectorCount: station.connectors.length,
    model: station.model?.trim().toUpperCase() || "Unknown",
    vendor: station.vendor?.trim() || "Unknown",
    updatedAt: station.last_seen,
  };
}

export const chargingStationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getChargers: builder.query<ChargingStationMapItem[], void>({
      query: () => ({
        url: "/chargers",
        method: "GET",
      }),
      transformResponse: (response: ChargersResponse) =>
        response.map(mapStation),
    }),
  }),
  overrideExisting: false,
});

export const { useGetChargersQuery } = chargingStationsApi;
