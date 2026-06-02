import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  type Region,
} from "react-native-maps";

import type { MapEdgePadding, MapWrapperProps } from "./types";

const DEFAULT_REGION: Region = {
  latitude: 11.0168,
  longitude: 76.9558,
  latitudeDelta: 0.22,
  longitudeDelta: 0.22,
};

const DEFAULT_MAP_PADDING: MapEdgePadding = {
  top: 96,
  right: 16,
  bottom: 200,
  left: 16,
};

function toRegion(latitude: number, longitude: number): Region {
  return {
    latitude,
    longitude,
    latitudeDelta: 0.07,
    longitudeDelta: 0.06,
  };
}

export function MobileMap({
  chargers,
  selectedChargerId,
  currentLocation,
  locationRevision,
  mapType,
  zoomCommand,
  route,
  mapPadding = DEFAULT_MAP_PADDING,
  onMarkerPress,
  recenterSignal,
}: MapWrapperProps) {
  const nativeMapType = mapType === "satellite" ? "satellite" : "standard";
  const mapRef = useRef<MapView | null>(null);
  const regionRef = useRef<Region>(DEFAULT_REGION);
  const mapPaddingRef = useRef<MapEdgePadding>(mapPadding);
  const [mapReady, setMapReady] = useState(false);

  mapPaddingRef.current = mapPadding;

  const fitVisibleContent = useCallback(() => {
    if (!mapRef.current) return;

    const padding = mapPaddingRef.current;

    if (route?.coordinates.length) {
      mapRef.current.fitToCoordinates(route.coordinates, {
        edgePadding: padding,
        animated: true,
      });
      return;
    }

    if (currentLocation) {
      mapRef.current.animateToRegion(
        toRegion(currentLocation.latitude, currentLocation.longitude),
        450,
      );
      return;
    }

    if (chargers.length === 0) return;

    mapRef.current.fitToCoordinates(
      chargers.map((charger) => ({
        latitude: charger.latitude,
        longitude: charger.longitude,
      })),
      {
        edgePadding: padding,
        animated: true,
      },
    );
  }, [chargers, currentLocation, route]);

  const initialRegion = useMemo(() => {
    if (currentLocation) {
      return toRegion(currentLocation.latitude, currentLocation.longitude);
    }

    const first = chargers[0];
    if (first) {
      return toRegion(first.latitude, first.longitude);
    }

    return DEFAULT_REGION;
  }, [chargers, currentLocation]);

  useEffect(() => {
    const selected = chargers.find((charger) => charger.id === selectedChargerId);
    if (!selected || !mapRef.current) return;

    mapRef.current.animateToRegion(toRegion(selected.latitude, selected.longitude), 450);
  }, [chargers, selectedChargerId]);

  useEffect(() => {
    if (!currentLocation || !mapRef.current) return;

    mapRef.current.animateToRegion(
      toRegion(currentLocation.latitude, currentLocation.longitude),
      500,
    );
  }, [currentLocation, locationRevision]);

  useEffect(() => {
    if (!zoomCommand || !mapRef.current) return;
    const region = regionRef.current;
    const factor = zoomCommand.direction === "in" ? 0.5 : 2;
    const next = {
      ...region,
      latitudeDelta: Math.min(Math.max(region.latitudeDelta * factor, 0.002), 80),
      longitudeDelta: Math.min(Math.max(region.longitudeDelta * factor, 0.002), 80),
    };
    regionRef.current = next;
    mapRef.current.animateToRegion(next, 200);
  }, [zoomCommand]);

  useEffect(() => {
    if (!mapReady) return;
    fitVisibleContent();
  }, [
    chargers.length,
    currentLocation,
    fitVisibleContent,
    locationRevision,
    mapReady,
    recenterSignal,
    route,
  ]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        mapType={nativeMapType}
        mapPadding={mapPadding}
        onMapReady={() => setMapReady(true)}
        showsCompass={false}
        showsMyLocationButton={false}
        showsUserLocation={!!currentLocation}
        zoomControlEnabled={false}
        onRegionChangeComplete={(region) => {
          regionRef.current = region;
        }}
      >
        {route && route.coordinates.length >= 2 ? (
          <Polyline
            coordinates={route.coordinates}
            strokeColor="#2563EB"
            strokeWidth={4}
            lineJoin="round"
            lineCap="round"
          />
        ) : null}
        {chargers.map((charger) => (
          <Marker
            key={charger.id}
            coordinate={{ latitude: charger.latitude, longitude: charger.longitude }}
            title={charger.name}
            description={charger.address}
            pinColor={charger.status === "available" ? "#21B3A7" : "#E0586A"}
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
