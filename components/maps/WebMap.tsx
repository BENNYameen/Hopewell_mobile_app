import "leaflet/dist/leaflet.css";

import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { MapWrapperProps } from "./types";

type LeafletModules = {
  L: typeof import("leaflet");
  MapContainer: typeof import("react-leaflet").MapContainer;
  Marker: typeof import("react-leaflet").Marker;
  Popup: typeof import("react-leaflet").Popup;
  TileLayer: typeof import("react-leaflet").TileLayer;
  useMap: typeof import("react-leaflet").useMap;
};

const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946];

function FlyToSelection({
  selectedChargerId,
  chargers,
  currentLocation,
  useMap,
}: Pick<MapWrapperProps, "selectedChargerId" | "chargers" | "currentLocation"> & {
  useMap: LeafletModules["useMap"];
}) {
  const map = useMap();

  const target = useMemo(() => {
    if (selectedChargerId) {
      const selected = chargers.find((c) => c.id === selectedChargerId);
      if (selected) return [selected.latitude, selected.longitude] as [number, number];
    }

    if (currentLocation) {
      return [currentLocation.latitude, currentLocation.longitude] as [number, number];
    }

    return null;
  }, [chargers, currentLocation, selectedChargerId]);

  useEffect(() => {
    if (!target) return;
    map.flyTo(target, 14, { duration: 0.5 });
  }, [map, target]);

  return null;
}

export function WebMap({
  chargers,
  selectedChargerId,
  currentLocation,
  onMarkerPress,
}: MapWrapperProps) {
  const [mods, setMods] = useState<LeafletModules | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadLeaflet() {
      if (typeof window === "undefined") return;

      try {
        const leaflet = await import("leaflet");
        const rl = await import("react-leaflet");

        delete (leaflet.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        if (!cancelled) {
          setMods({
            L: leaflet,
            MapContainer: rl.MapContainer,
            Marker: rl.Marker,
            Popup: rl.Popup,
            TileLayer: rl.TileLayer,
            useMap: rl.useMap,
          });
        }
      } catch {
        if (!cancelled) setLoadError(true);
      }
    }

    loadLeaflet();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorTitle}>Unable to render web map.</Text>
        <Text style={styles.errorBody}>Please refresh the page and try again.</Text>
      </View>
    );
  }

  if (!mods) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Loading web map...</Text>
      </View>
    );
  }

  const { MapContainer, Marker, Popup, TileLayer, useMap } = mods;
  const center = currentLocation
    ? ([currentLocation.latitude, currentLocation.longitude] as [number, number])
    : chargers[0]
      ? ([chargers[0].latitude, chargers[0].longitude] as [number, number])
      : DEFAULT_CENTER;

  return (
    <View style={styles.container}>
      <MapContainer center={center} zoom={12} style={styles.map}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToSelection
          selectedChargerId={selectedChargerId}
          chargers={chargers}
          currentLocation={currentLocation}
          useMap={useMap}
        />
        {chargers.map((charger) => (
          <Marker
            key={charger.id}
            position={[charger.latitude, charger.longitude]}
            eventHandlers={{ click: () => onMarkerPress(charger.id) }}
          >
            <Popup>
              <strong>{charger.name}</strong>
              <br />
              Availability: {charger.availability}
              <br />
              Address: {charger.address}
              <br />
              Connectors: {charger.connectorCount}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%", height: "100%" },
  map: { width: "100%", height: "100%" },
  center: { alignItems: "center", justifyContent: "center", backgroundColor: "#F3F6FB" },
  loadingText: { color: "#1A2850", fontSize: 15, fontWeight: "600" },
  errorTitle: { color: "#A42E3B", fontSize: 17, fontWeight: "700", marginBottom: 8 },
  errorBody: { color: "#1A2850", fontSize: 14 },
});
