import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  type Region,
} from "react-native-maps";

import type { MapWrapperProps } from "./types";

const DEFAULT_REGION: Region = {
  latitude: 12.9716,
  longitude: 77.5946,
  latitudeDelta: 0.18,
  longitudeDelta: 0.12,
};

const MAX_FIT_DISTANCE_KM = 50;

function toRegion(lat: number, lng: number): Region {
  return {
    latitude: lat,
    longitude: lng,
    latitudeDelta: 0.07,
    longitudeDelta: 0.06,
  };
}

function distanceKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
) {
  const earthRadiusKm = 6371;
  const latDelta = ((to.latitude - from.latitude) * Math.PI) / 180;
  const lngDelta = ((to.longitude - from.longitude) * Math.PI) / 180;
  const fromLat = (from.latitude * Math.PI) / 180;
  const toLat = (to.latitude * Math.PI) / 180;

  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lngDelta / 2) ** 2;

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
  // Guards are SEPARATE so each concern can't block another
  const hasLocationCenteredRef = useRef(false); // fired once: center on user
  const hasFittedRef = useRef(false);           // fired once: fit user + chargers
  const [mapReady, setMapReady] = useState(false);

  const nativeMapType = mapType === "satellite" ? "satellite" : "standard";

  // ── Effect 1 ──────────────────────────────────────────────────────────────
  // Center on user location the first time we have BOTH mapReady AND coords.
  // Bug fix: deps include both mapReady and currentLocation so this re-runs
  // regardless of which one arrives last (fixes Bug 2).
  useEffect(() => {
    if (!mapReady || !currentLocation || hasLocationCenteredRef.current) return;
    hasLocationCenteredRef.current = true;

    console.log(
      `[Map] centering on user location: lat=${currentLocation.latitude.toFixed(5)}, lng=${currentLocation.longitude.toFixed(5)}`,
    );

    const timer = setTimeout(() => {
      if (!mapRef.current) return;
      const region = toRegion(currentLocation.latitude, currentLocation.longitude);
      regionRef.current = region; // keep in sync so zoom buttons work immediately
      mapRef.current.animateToRegion(region, 600);
    }, 300);

    return () => clearTimeout(timer);
  }, [mapReady, currentLocation]);

  // ── Effect 2 ──────────────────────────────────────────────────────────────
  // Fit to show user + nearby chargers once BOTH are available.
  // Uses animateToRegion with a capped delta instead of fitToCoordinates to
  // prevent the map zooming out to continent level when chargers are spread
  // across a large geographic area.
  useEffect(() => {
    if (!mapReady || hasFittedRef.current) return;
    if (!currentLocation || chargers.length === 0) return;

    hasFittedRef.current = true;

    const userLat = currentLocation.latitude;
    const userLng = currentLocation.longitude;

    // Only consider nearby chargers so simulator/default locations cannot
    // combine with real station data and move the camera to a meaningless
    // midpoint over the ocean.
    const nearbyCoords = chargers
      .filter(
        (c) =>
          distanceKm(currentLocation, {
            latitude: c.latitude,
            longitude: c.longitude,
          }) <= MAX_FIT_DISTANCE_KM,
      )
      .slice(0, 5)
      .map((c) => ({ lat: c.latitude, lng: c.longitude }));

    if (nearbyCoords.length === 0) {
      console.log("[Map] no nearby chargers to fit; keeping map centered on user location");
      return;
    }

    const allLats = [userLat, ...nearbyCoords.map((c) => c.lat)];
    const allLngs = [userLng, ...nearbyCoords.map((c) => c.lng)];
    const minLat = Math.min(...allLats);
    const maxLat = Math.max(...allLats);
    const minLng = Math.min(...allLngs);
    const maxLng = Math.max(...allLngs);

    // Cap the zoom-out so we never show more than ~15 km in each direction.
    const MAX_DELTA = 0.15;
    const MIN_DELTA = 0.04;
    const latDelta = Math.min(Math.max((maxLat - minLat) * 1.6, MIN_DELTA), MAX_DELTA);
    const lngDelta = Math.min(Math.max((maxLng - minLng) * 1.6, MIN_DELTA), MAX_DELTA);
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    console.log(
      `[Map] fitting region: center=(${centerLat.toFixed(4)},${centerLng.toFixed(4)}) delta=(${latDelta.toFixed(3)},${lngDelta.toFixed(3)})`,
    );

    const timer = setTimeout(() => {
      if (!mapRef.current) return;
      const region: Region = {
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      };
      regionRef.current = region; // sync before animation so zoom buttons are correct
      mapRef.current.animateToRegion(region, 700);
    }, 800);

    return () => clearTimeout(timer);
  }, [mapReady, currentLocation, chargers]);

  // ── Effect 3 ──────────────────────────────────────────────────────────────
  // "Locate me" button re-centers on user. locationRevision is 0 at mount,
  // becomes 1 on the first automatic location (already handled by Effect 1),
  // and becomes 2+ only when the user explicitly taps the button.
  // Bug fix: mapReady is now in deps so if the button is pressed before the
  // map is ready, we still re-center once the map fires onMapReady.
  useEffect(() => {
    if (locationRevision <= 1 || !mapReady || !currentLocation || !mapRef.current) return;
    mapRef.current.animateToRegion(
      toRegion(currentLocation.latitude, currentLocation.longitude),
      500,
    );
  }, [locationRevision, mapReady, currentLocation]);

  // Pan to selected charger marker
  useEffect(() => {
    if (!mapReady || !selectedChargerId) return;
    const selected = chargers.find((c) => c.id === selectedChargerId);
    if (!selected || !mapRef.current) return;
    mapRef.current.animateToRegion(
      toRegion(selected.latitude, selected.longitude),
      450,
    );
  }, [mapReady, selectedChargerId, chargers]);

  // Zoom in / out buttons
  useEffect(() => {
    if (!zoomCommand || !mapRef.current) return;
    const region = regionRef.current;
    // Use a sharper factor (0.4 / 2.5) so a single press feels responsive
    // even when the map is zoomed out to city level.
    const factor = zoomCommand.direction === "in" ? 0.4 : 2.5;
    const next: Region = {
      latitude: region.latitude,
      longitude: region.longitude,
      latitudeDelta: Math.min(Math.max(region.latitudeDelta * factor, 0.002), 80),
      longitudeDelta: Math.min(Math.max(region.longitudeDelta * factor, 0.002), 80),
    };
    regionRef.current = next; // sync immediately so rapid presses chain correctly
    mapRef.current.animateToRegion(next, 250);
  }, [zoomCommand]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={
          currentLocation
            ? toRegion(currentLocation.latitude, currentLocation.longitude)
            : DEFAULT_REGION
        }
        mapType={nativeMapType}
        // Keep native gestures explicit and consistent across platforms.
        zoomEnabled
        scrollEnabled
        rotateEnabled
        pitchEnabled
        zoomControlEnabled={false}
        // Google Maps requires runtime permission to already be granted before
        // enabling this prop on native platforms.
        showsUserLocation={!!currentLocation}
        followsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        // Prevent the map from auto-panning when a marker is tapped
        moveOnMarkerPress={false}
        onMapReady={() => setMapReady(true)}
        onRegionChangeComplete={(region) => {
          regionRef.current = region;
        }}
      >
        {/*
         * Only render markers after onMapReady fires.
         * tracksViewChanges={false} prevents marker views from re-rendering on
         * every frame after their initial render.
         */}
        {mapReady &&
          chargers.map((charger) => (
            <Marker
              key={charger.id}
              coordinate={{
                latitude: charger.latitude,
                longitude: charger.longitude,
              }}
              title={charger.name}
              description={charger.address}
              pinColor={charger.status === "available" ? "#21B3A7" : "#E0586A"}
              tracksViewChanges={false}
              onPress={() => onMarkerPress(charger.id)}
            />
          ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%", height: "100%" },
});
