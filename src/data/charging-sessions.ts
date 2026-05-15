export type ChargingSession = {
  id: string;
  isLive: boolean;
  title: string;
  stationName: string;
  location: string;
  startedAt: string;
  endedAt?: string;
  durationMin: number;
  energyKwh: number;
  cost: number;
  batteryStartPct: number;
  batteryEndPct?: number;
  connectorType: string;
  paymentMethod: string;
};

export const SESSIONS: ChargingSession[] = [
  {
    id: "live-1",
    isLive: true,
    title: "Live charging session",
    stationName: "ChargePoint - Midtown Hub",
    location: "2.4 km away",
    startedAt: "2025-11-27 02:48 PM",
    durationMin: 29,
    energyKwh: 12.6,
    cost: 4.85,
    batteryStartPct: 32,
    batteryEndPct: 58,
    connectorType: "CCS Type 2",
    paymentMethod: "Visa •••• 3812",
  },
  {
    id: "sess-2",
    isLive: false,
    title: "Charging completed",
    stationName: "Electra - Harbor Street",
    location: "Sector 12",
    startedAt: "2025-11-26 06:04 PM",
    endedAt: "2025-11-26 06:58 PM",
    durationMin: 54,
    energyKwh: 21.2,
    cost: 7.45,
    batteryStartPct: 18,
    batteryEndPct: 86,
    connectorType: "Type 2 AC",
    paymentMethod: "UPI - HopesWell",
  },
  {
    id: "sess-3",
    isLive: false,
    title: "Session ended (power cut)",
    stationName: "VoltEdge - Park Avenue",
    location: "Sector 9",
    startedAt: "2025-11-25 09:14 AM",
    endedAt: "2025-11-25 09:39 AM",
    durationMin: 25,
    energyKwh: 8.1,
    cost: 3.05,
    batteryStartPct: 44,
    batteryEndPct: 61,
    connectorType: "CCS Type 2",
    paymentMethod: "Wallet",
  },
];
