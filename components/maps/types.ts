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

export type MapWrapperProps = {
  chargers: Charger[];
  selectedChargerId: string | null;
  currentLocation: LocationPoint | null;
  isLoading: boolean;
  errorMessage?: string;
  onMarkerPress: (chargerId: string) => void;
};
