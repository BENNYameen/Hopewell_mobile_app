import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
  type Region,
} from "react-native-maps";

import type { MapWrapperProps } from "./types";

// iOS: Apple Maps (no API key needed, always renders)
// Android: Google Maps (API key via app.json android.config.googleMaps.apiKey)
const MAP_PROVIDER = Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT;

const DEFAULT_REGION: Region = {
  latitude: 11.0168,
  longitude: 76.9558,
  latitudeDelta: 0.07,
  longitudeDelta: 0.06,
};

const MAX_FIT_DISTANCE_KM = 50;

function toRegion(lat: number, lng: number): Region {
  return {
    latitude: lat,
    longitude: lng,
    latitudeDelta: 0.05,
    longitudeDelta: 0.04,
  };
}

function distanceKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
) {
  const R = 6371;
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLng = ((to.longitude - from.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.latitude * Math.PI) / 180) *
      Math.cos((to.latitude * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function ChargerMarker({ available }: { available: boolean }) {
  return (
    <View style={[styles.markerOuter, available ? styles.markerAvail : styles.markerUnavail]}>
      <Text style={styles.markerIcon}>⚡</Text>
    </View>
  );
}

export function MobileMap({
  chargers,
  selectedChargerId,
  currentLocation,
  locationRevision,
  mapType,
  zoomCommand,
  onMarkerPress,
}: MapWrapperProps) {
  const mapRef = useRef<MapView | null>(null);
  const regionRef = useRef<Region>(DEFAULT_REGION);
  const hasNativeCenteredRef = useRef(false); // fired once via onUserLocationChange
  const hasFittedRef = useRef(false);         // fired once: fit user + nearby chargers
  const [mapReady, setMapReady] = useState(false);

  const nativeMapType = mapType === "satellite" ? "satellite" : "standard";

  // ── Native location callback ───────────────────────────────────────────────
  // Fires as soon as Apple Maps / Google Maps resolves the device position —
  // faster and more reliable than waiting for expo-location on iOS.
  const onUserLocationChange = useCallback(
    (event: { nativeEvent?: { coordinate?: { latitude: number; longitude: number } } }) => {
      const coord = event.nativeEvent?.coordinate;
      if (!coord || hasNativeCenteredRef.current || !mapRef.current || !mapReady) return;
      hasNativeCenteredRef.current = true;

      const region = toRegion(coord.latitude, coord.longitude);
      regionRef.current = region;
      mapRef.current.animateToRegion(region, 700);
    },
    [mapReady],
  );

  // ── Effect: fit user + nearby chargers once both are ready ─────────────────
  useEffect(() => {
    if (!mapReady || hasFittedRef.current) return;
    if (!currentLocation || chargers.length === 0) return;

    hasFittedRef.current = true;

    const { latitude: userLat, longitude: userLng } = currentLocation;

    const nearbyCoords = chargers
      .filter((c) => distanceKm(currentLocation, c) <= MAX_FIT_DISTANCE_KM)
      .slice(0, 5)
      .map((c) => ({ lat: c.latitude, lng: c.longitude }));

    if (nearbyCoords.length === 0) return;

    const allLats = [userLat, ...nearbyCoords.map((c) => c.lat)];
    const allLngs = [userLng, ...nearbyCoords.map((c) => c.lng)];
    const latDelta = Math.min(Math.max((Math.max(...allLats) - Math.min(...allLats)) * 1.6, 0.04), 0.15);
    const lngDelta = Math.min(Math.max((Math.max(...allLngs) - Math.min(...allLngs)) * 1.6, 0.04), 0.15);
    const centerLat = (Math.min(...allLats) + Math.max(...allLats)) / 2;
    const centerLng = (Math.min(...allLngs) + Math.max(...allLngs)) / 2;

    const timer = setTimeout(() => {
      if (!mapRef.current) return;
      const region: Region = { latitude: centerLat, longitude: centerLng, latitudeDelta: latDelta, longitudeDelta: lngDelta };
      regionRef.current = region;
      mapRef.current.animateToRegion(region, 700);
    }, 900);

    return () => clearTimeout(timer);
  }, [mapReady, currentLocation, chargers]);

  // ── Effect: "Locate me" button re-centers (locationRevision > 1) ───────────
  useEffect(() => {
    if (locationRevision <= 1 || !mapReady || !currentLocation || !mapRef.current) return;
    mapRef.current.animateToRegion(toRegion(currentLocation.latitude, currentLocation.longitude), 500);
  }, [locationRevision, mapReady, currentLocation]);

  // ── Effect: pan to selected marker ────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !selectedChargerId) return;
    const selected = chargers.find((c) => c.id === selectedChargerId);
    if (!selected || !mapRef.current) return;
    mapRef.current.animateToRegion(toRegion(selected.latitude, selected.longitude), 450);
  }, [mapReady, selectedChargerId, chargers]);

  // ── Effect: zoom buttons ───────────────────────────────────────────────────
  useEffect(() => {
    if (!zoomCommand || !mapRef.current) return;
    const factor = zoomCommand.direction === "in" ? 0.4 : 2.5;
    const next: Region = {
      latitude: regionRef.current.latitude,
      longitude: regionRef.current.longitude,
      latitudeDelta: Math.min(Math.max(regionRef.current.latitudeDelta * factor, 0.002), 80),
      longitudeDelta: Math.min(Math.max(regionRef.current.longitudeDelta * factor, 0.002), 80),
    };
    regionRef.current = next;
    mapRef.current.animateToRegion(next, 250);
  }, [zoomCommand]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={MAP_PROVIDER}
        style={StyleSheet.absoluteFillObject}
        initialRegion={DEFAULT_REGION}
        mapType={nativeMapType}
        zoomEnabled
        scrollEnabled
        rotateEnabled
        pitchEnabled
        zoomControlEnabled={false}
        showsUserLocation
        followsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        moveOnMarkerPress={false}
        onMapReady={() => setMapReady(true)}
        onUserLocationChange={onUserLocationChange}
        onRegionChangeComplete={(region) => { regionRef.current = region; }}
      >
        {mapReady &&
          chargers.map((charger) => (
            <Marker
              key={charger.id}
              coordinate={{ latitude: charger.latitude, longitude: charger.longitude }}
              title={charger.name}
              description={charger.availability}
              tracksViewChanges={false}
              onPress={() => onMarkerPress(charger.id)}
            >
              <ChargerMarker available={charger.status === "available"} />
            </Marker>
          ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%", height: "100%" },
  markerOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  markerAvail: { backgroundColor: "#21B3A7" },
  markerUnavail: { backgroundColor: "#E0586A" },
  markerIcon: { fontSize: 16 },
});
