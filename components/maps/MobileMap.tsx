import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from "react-native-maps";

import type { MapWrapperProps } from "./types";

const DEFAULT_REGION: Region = {
  latitude: 12.9716,
  longitude: 77.5946,
  latitudeDelta: 0.18,
  longitudeDelta: 0.12,
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
  onMarkerPress,
}: MapWrapperProps) {
  const mapRef = useRef<MapView | null>(null);

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
  }, [currentLocation]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        showsCompass
        showsMyLocationButton
        showsUserLocation={!!currentLocation}
      >
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
