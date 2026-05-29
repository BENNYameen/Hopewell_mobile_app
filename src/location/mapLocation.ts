import * as Location from "expo-location";
import { Platform } from "react-native";

export type MapCoordinates = {
  latitude: number;
  longitude: number;
};

export type MapLocationResult =
  | { ok: true; coords: MapCoordinates }
  | { ok: false; reason: "denied" | "unavailable" };

export function getMapLocationErrorMessage(reason: "denied" | "unavailable"): string {
  if (reason === "denied") {
    return Platform.OS === "web"
      ? "Location permission denied. Allow location access in your browser to center the map."
      : "Location permission denied. Enable it in device settings to center the map.";
  }

  return Platform.OS === "web"
    ? "Unable to read your location. Check that location is enabled for this site."
    : "Unable to read current location right now.";
}

function readWebGeolocation(): Promise<MapCoordinates> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("unsupported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 5000,
      },
    );
  });
}

async function getWebMapLocation(): Promise<MapLocationResult> {
  try {
    const coords = await readWebGeolocation();
    return { ok: true, coords };
  } catch (error) {
    const geoError = error as GeolocationPositionError | undefined;
    if (geoError?.code === 1) {
      return { ok: false, reason: "denied" };
    }
  }

  return getNativeMapLocation();
}

async function getNativeMapLocation(): Promise<MapLocationResult> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== "granted") {
    return { ok: false, reason: "denied" };
  }

  const enabled = await Location.hasServicesEnabledAsync();
  if (!enabled) {
    return { ok: false, reason: "unavailable" };
  }

  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      ok: true,
      coords: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
    };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}

export async function getMapLocation(): Promise<MapLocationResult> {
  if (Platform.OS === "web") {
    return getWebMapLocation();
  }

  return getNativeMapLocation();
}
