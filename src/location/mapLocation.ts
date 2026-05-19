import * as Location from "expo-location";

export type MapCoordinates = {
  latitude: number;
  longitude: number;
};

export type MapLocationResult =
  | { ok: true; coords: MapCoordinates }
  | { ok: false; reason: "denied" | "unavailable" };

export async function getMapLocation(): Promise<MapLocationResult> {
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
