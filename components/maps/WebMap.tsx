import { createElement, useEffect, useMemo, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";

import type { MapViewType, MapWrapperProps } from "./types";

const MAP_MESSAGE_SOURCE = "vajra-volt-map";
const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946];

type MapFramePayload = {
  chargers: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address: string;
    availability: string;
    connectorCount: number;
    status: string;
  }>;
  center: [number, number];
  userLocation: { latitude: number; longitude: number } | null;
  selectedChargerId: string | null;
  mapType: MapViewType;
  route: { coordinates: Array<{ latitude: number; longitude: number }> } | null;
};

function buildLeafletFrameHtml(payload: MapFramePayload): string {
  const config = JSON.stringify(payload).replace(/</g, "\\u003c");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
  <style>
    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
    .leaflet-container { background: #e8eef5; font-family: system-ui, sans-serif; }
    .leaflet-popup-content-wrapper, .leaflet-popup-tip { background: #fff; color: #13233D; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
  <script>
    (function () {
      var config = ${config};
      var chargers = config.chargers || [];
      var center = config.center || [12.9716, 77.5946];
      var userLocation = config.userLocation || null;
      var selectedId = config.selectedChargerId;
      var route = config.route || null;
      var mapType = config.mapType || "default";
      var isSatellite = mapType === "satellite";
      var tileUrl = isSatellite
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      var tileAttribution = isSatellite
        ? "Tiles &copy; Esri"
        : "&copy; OpenStreetMap contributors";

      function post(type, id) {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ source: "${MAP_MESSAGE_SOURCE}", type: type, id: id }, "*");
        }
      }

      function init() {
        if (!window.L) {
          document.body.innerHTML = "<p style='padding:16px;color:#A42E3B;font-family:sans-serif'>Map library failed to load.</p>";
          return;
        }

        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        var map = L.map("map", { zoomControl: false });
        window.__vajraMap = map;

        window.addEventListener("message", function (event) {
          var data = event.data;
          if (!data || data.source !== "${MAP_MESSAGE_SOURCE}") return;
          if (data.type === "zoomIn") map.zoomIn();
          if (data.type === "zoomOut") map.zoomOut();
        });
        L.tileLayer(tileUrl, {
          attribution: tileAttribution,
          maxZoom: isSatellite ? 18 : 19,
        }).addTo(map);

        var bounds = [];
        chargers.forEach(function (charger) {
          var latLng = [charger.latitude, charger.longitude];
          bounds.push(latLng);
          var marker = L.marker(latLng).addTo(map);
          marker.bindPopup(
            "<strong>" + charger.name + "</strong><br/>" +
            "Availability: " + charger.availability + "<br/>" +
            "Address: " + charger.address + "<br/>" +
            "Connectors: " + charger.connectorCount
          );
          marker.on("click", function () {
            post("markerPress", charger.id);
          });
        });

        if (userLocation) {
          var userLatLng = [userLocation.latitude, userLocation.longitude];
          L.circleMarker(userLatLng, {
            radius: 10,
            fillColor: "#2563EB",
            color: "#FFFFFF",
            weight: 3,
            fillOpacity: 0.95,
          }).addTo(map);
        }

        if (route && route.coordinates && route.coordinates.length > 1) {
          var routeLatLngs = route.coordinates.map(function (c) {
            return [c.latitude, c.longitude];
          });
          L.polyline(routeLatLngs, {
            color: "#2563EB",
            weight: 5,
            opacity: 0.88,
            lineJoin: "round",
          }).addTo(map);
          var routeBounds = L.latLngBounds(routeLatLngs);
          if (userLocation) {
            routeBounds.extend([userLocation.latitude, userLocation.longitude]);
          }
          map.fitBounds(routeBounds, { padding: [56, 56], maxZoom: 15 });
        } else if (userLocation) {
          map.setView([userLocation.latitude, userLocation.longitude], 14);
        } else if (selectedId) {
          var selected = chargers.find(function (c) { return c.id === selectedId; });
          if (selected) {
            map.setView([selected.latitude, selected.longitude], 14);
          }
        } else if (bounds.length > 1) {
          map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
        } else if (bounds.length === 1) {
          map.setView(bounds[0], 14);
        } else {
          map.setView(center, 12);
        }

        setTimeout(function () { map.invalidateSize(); }, 50);
        window.addEventListener("resize", function () { map.invalidateSize(); });
      }

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
      } else {
        init();
      }
    })();
  </script>
</body>
</html>`;
}

export function WebMap({
  chargers,
  selectedChargerId,
  currentLocation,
  locationRevision,
  mapType,
  zoomCommand,
  route,
  onMarkerPress,
}: MapWrapperProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const framePayload = useMemo((): MapFramePayload => {
    const center: [number, number] = currentLocation
      ? [currentLocation.latitude, currentLocation.longitude]
      : chargers[0]
        ? [chargers[0].latitude, chargers[0].longitude]
        : DEFAULT_CENTER;

    return {
      chargers,
      center,
      userLocation: currentLocation,
      selectedChargerId,
      mapType,
      route: route ?? null,
    };
  }, [chargers, currentLocation, mapType, route, selectedChargerId]);

  const frameHtml = useMemo(
    () => buildLeafletFrameHtml(framePayload),
    [framePayload],
  );

  const frameKey = useMemo(
    () =>
      [
        chargers.map((c) => c.id).join(","),
        selectedChargerId ?? "",
        currentLocation
          ? `${currentLocation.latitude},${currentLocation.longitude}`
          : "",
        String(locationRevision),
        mapType,
        route
          ? `${route.coordinates.length}:${route.coordinates[0]?.latitude},${route.coordinates[0]?.longitude}`
          : "",
      ].join("|"),
    [chargers, currentLocation, locationRevision, mapType, route, selectedChargerId],
  );

  useEffect(() => {
    if (Platform.OS !== "web" || !zoomCommand) return;
    iframeRef.current?.contentWindow?.postMessage(
      {
        source: MAP_MESSAGE_SOURCE,
        type: zoomCommand.direction === "in" ? "zoomIn" : "zoomOut",
      },
      "*",
    );
  }, [zoomCommand]);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") {
      return;
    }

    function onMessage(event: MessageEvent) {
      const data = event.data as { source?: string; type?: string; id?: string };
      if (data?.source !== MAP_MESSAGE_SOURCE || data.type !== "markerPress" || !data.id) {
        return;
      }
      onMarkerPress(data.id);
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onMarkerPress]);

  return (
    <View style={styles.fill}>
      {createElement("iframe", {
        ref: iframeRef,
        key: frameKey,
        title: "Charging stations map",
        srcDoc: frameHtml,
        style: {
          border: "none",
          width: "100%",
          height: "100%",
          display: "block",
          backgroundColor: "#e8eef5",
        },
        sandbox: "allow-scripts allow-same-origin",
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
    minHeight: 280,
  },
});
