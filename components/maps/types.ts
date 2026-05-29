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

export type MapWrapperProps = {
  chargers: Charger[];
  selectedChargerId: string | null;
  currentLocation: LocationPoint | null;
  mapType: MapViewType;
  /** Bumped when the user taps Locate so maps recenter even if coords are unchanged. */
  locationRevision: number;
  /** Increment `id` after each zoom button press. */
  zoomCommand?: { direction: MapZoomDirection; id: number };
  isLoading: boolean;
  errorMessage?: string;
  onMarkerPress: (chargerId: string) => void;
};
