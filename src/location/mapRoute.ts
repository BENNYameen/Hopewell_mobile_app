import Constants from "expo-constants";

import type { LocationPoint, MapRoute } from "@/components/maps/types";

type OsrmRouteResponse = {
  routes?: Array<{
    distance?: number;
    duration?: number;
    geometry?: { coordinates?: [number, number][] };
  }>;
};

type GoogleDirectionsResponse = {
  status?: string;
  routes?: Array<{
    legs?: Array<{ distance?: { value?: number }; duration?: { value?: number } }>;
    overview_polyline?: { points?: string };
  }>;
};

const ROUTE_TIMEOUT_MS = 15000;

function getGoogleMapsApiKey(): string {
  return (
    Constants.expoConfig?.extra?.googleMapsApiKey ??
    Constants.manifest2?.extra?.expoClient?.extra?.googleMapsApiKey ??
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ??
    ""
  );
}

function isValidPoint(point: LocationPoint): boolean {
  return (
    Number.isFinite(point.latitude) &&
    Number.isFinite(point.longitude) &&
    Math.abs(point.latitude) <= 90 &&
    Math.abs(point.longitude) <= 180
  );
}

function haversineMeters(a: LocationPoint, b: LocationPoint): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(h));
}

function decodePolyline(encoded: string): LocationPoint[] {
  const coordinates: LocationPoint[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coordinates.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return coordinates;
}

async function fetchWithTimeout(url: string): Promise<Response | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ROUTE_TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchOsrmRoute(
  origin: LocationPoint,
  destination: LocationPoint,
): Promise<MapRoute | null> {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}` +
    `?overview=full&geometries=geojson`;

  const response = await fetchWithTimeout(url);
  if (!response?.ok) return null;

  const data = (await response.json()) as OsrmRouteResponse;
  const route = data.routes?.[0];
  const raw = route?.geometry?.coordinates;
  if (!route || !raw?.length) return null;

  return {
    coordinates: raw.map(([longitude, latitude]) => ({ latitude, longitude })),
    distanceMeters: route.distance ?? 0,
    durationSeconds: route.duration ?? 0,
  };
}

async function fetchGoogleRoute(
  origin: LocationPoint,
  destination: LocationPoint,
): Promise<MapRoute | null> {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) return null;

  const url =
    `https://maps.googleapis.com/maps/api/directions/json` +
    `?origin=${origin.latitude},${origin.longitude}` +
    `&destination=${destination.latitude},${destination.longitude}` +
    `&mode=driving&key=${encodeURIComponent(apiKey)}`;

  const response = await fetchWithTimeout(url);
  if (!response?.ok) return null;

  const data = (await response.json()) as GoogleDirectionsResponse;
  if (data.status !== "OK") return null;

  const route = data.routes?.[0];
  const encoded = route?.overview_polyline?.points;
  if (!route || !encoded) return null;

  const coordinates = decodePolyline(encoded);
  if (coordinates.length < 2) return null;

  const leg = route.legs?.[0];
  return {
    coordinates,
    distanceMeters: leg?.distance?.value ?? haversineMeters(origin, destination),
    durationSeconds: leg?.duration?.value ?? 0,
  };
}

function buildStraightLineRoute(origin: LocationPoint, destination: LocationPoint): MapRoute {
  const distanceMeters = haversineMeters(origin, destination);
  const durationSeconds = Math.max(60, Math.round((distanceMeters / 1000 / 40) * 3600));

  return {
    coordinates: [origin, destination],
    distanceMeters,
    durationSeconds,
    isApproximate: true,
  };
}

/** Driving route with OSRM → Google Directions → straight-line fallbacks. */
export async function fetchDrivingRoute(
  origin: LocationPoint,
  destination: LocationPoint,
): Promise<MapRoute | null> {
  if (!isValidPoint(origin) || !isValidPoint(destination)) {
    return null;
  }

  const osrmRoute = await fetchOsrmRoute(origin, destination);
  if (osrmRoute) return osrmRoute;

  const googleRoute = await fetchGoogleRoute(origin, destination);
  if (googleRoute) return googleRoute;

  return buildStraightLineRoute(origin, destination);
}

export function formatRouteSummary(route: MapRoute): string {
  const distanceLabel =
    route.distanceMeters < 1000
      ? `${Math.round(route.distanceMeters)} m`
      : `${(route.distanceMeters / 1000).toFixed(1)} km`;
  const minutes = Math.max(1, Math.round(route.durationSeconds / 60));
  const prefix = route.isApproximate ? "Direct line · " : "";
  return `${prefix}${distanceLabel} · ~${minutes} min`;
}
