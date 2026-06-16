export type Charger = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  availability: string;
  connectorCount: number;
  status: string;
};

export type LocationPoint = {
  latitude: number;
  longitude: number;
};

export type MapViewType = "default" | "satellite";

export type MapZoomDirection = "in" | "out";

export type MapRoute = {
  coordinates: LocationPoint[];
  distanceMeters: number;
  durationSeconds: number;
  /** True when only a straight-line estimate is shown (no road network). */
  isApproximate?: boolean;
};

export type MapEdgePadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type MapWrapperProps = {
  chargers: Charger[];
  selectedChargerId: string | null;
  currentLocation: LocationPoint | null;
  mapType: MapViewType;
  /** Bumped when the user taps Locate so maps recenter even if coords are unchanged. */
  locationRevision: number;
  /** Bumped after every locate attempt (including failures) to refit the map. */
  recenterSignal?: number;
  /** Increment `id` after each zoom button press. */
  zoomCommand?: { direction: MapZoomDirection; id: number };
  /** In-app driving route polyline (origin → destination). */
  route?: MapRoute | null;
  /** Keeps Google logo, markers, and routes clear of overlays (search bar, sheet, tab bar). */
  mapPadding?: MapEdgePadding;
  isLoading: boolean;
  errorMessage?: string;
  onMarkerPress: (chargerId: string) => void;
};
