import type { ColorSchemeName } from "react-native";

import { V as lightV } from "@/theme/vajra";

/** Semantic palette — light and dark — used across the app. */
export type VajraColors = typeof lightV & {
  mapSurface: string;
  mapSurfaceMuted: string;
};

const darkOverrides = {
  pageBg: "#0B1220",
  card: "#151E32",
  panelTint: "#1C2844",
  darkBlock: "#060B14",
  headingDeep: "#F8FAFC",
  heading: "#E2E8F0",
  headingMuted: "#CBD5E1",
  bodySecondary: "#B0BDD1",
  label: "#8B97B2",
  labelStrong: "#A3B1C8",
  mapSurface: "#1A2332",
  mapSurfaceMuted: "#232D42",
  borderNavy: "rgba(148, 163, 184, 0.18)",
  borderNavyMedium: "rgba(148, 163, 184, 0.28)",
  borderHairline: "rgba(148, 163, 184, 0.1)",
  borderStepCard: "rgba(148, 163, 184, 0.14)",
  tabBarBorder: "rgba(148, 163, 184, 0.12)",
  shadowNavy: "#000000",
  tealMuted: "rgba(33, 179, 167, 0.2)",
  tealRing20: "rgba(33, 179, 167, 0.35)",
  successFill: "rgba(33, 179, 167, 0.15)",
  sessionDoneBg: "rgba(59, 130, 246, 0.15)",
  errorSurface: "rgba(200, 29, 44, 0.15)",
  errorBorder: "rgba(248, 113, 113, 0.35)",
} as const;

export const vajraLight: VajraColors = {
  ...lightV,
  mapSurface: "#E7EEF8",
  mapSurfaceMuted: "#D8E2F0",
};

export const vajraDark: VajraColors = {
  ...lightV,
  ...darkOverrides,
  shadowCard: {
    shadowColor: "#000000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  shadowCardEmphasis: {
    shadowColor: "#000000",
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  shadowFeature: {
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  shadowTabBar: {
    shadowColor: "#000000",
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  shadowSoft: {
    shadowColor: "#000000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  shadowMedium: {
    shadowColor: "#000000",
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
};

export function getVajraColors(scheme: ColorSchemeName | null | undefined): VajraColors {
  return scheme === "dark" ? vajraDark : vajraLight;
}
