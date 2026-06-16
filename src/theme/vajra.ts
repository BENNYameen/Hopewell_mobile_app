/**
 * Vajra design tokens — build-accurate (mobile parity with web spec).
 */

/** rgba(11, 42, 94 · #0B2A5E) */
export const V = {
  primary: "#1428A0",
  primaryHover: "#0F1F80",
  primaryLight: "#2F45C2",
  accentAlt: "#59E3CF",

  headingDeep: "#011A75",
  heading: "#0A2C9B",
  headingMuted: "#123DAF",

  bodySecondary: "#4A5E9C",
  label: "#6C7AB0",
  labelStrong: "#566AA3",

  pageBg: "#EEF4FF",
  card: "#FFFFFF",
  panelTint: "#F4F9FF",
  darkBlock: "#011A75",

  tealMuted: "rgba(23, 184, 255, 0.12)",
  tealRing20: "rgba(23, 184, 255, 0.2)",
  tealBadgeText: "#0A4FA8",
  successFill: "#ECFAFF",

  sessionDoneBg: "#EEF5FF",
  sessionDoneLabel: "#123DAF",

  error: "#C81D2C",
  errorSurface: "#FEF2F2",
  errorBorder: "#FECACA",

  unavailable: "#E0586A",

  /** Card / rules — canonical */
  borderNavy: "rgba(1, 26, 117, 0.12)",
  borderNavyMedium: "rgba(1, 26, 117, 0.2)",
  borderHairline: "rgba(1, 26, 117, 0.08)",
  borderStepCard: "rgba(1, 26, 117, 0.1)",

  tabBarBorder: "rgba(1, 26, 117, 0.1)",

  shadowNavy: "#011A75",
  /** 0 8px 12px rgba(11, 42, 94, 0.06) */
  shadowCard: {
    shadowColor: "#011A75",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2 as const,
  },
  /** 0 10px 14px rgba(11, 42, 94, 0.08) */
  shadowCardEmphasis: {
    shadowColor: "#011A75",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4 as const,
  },
  /** Feature row landing: 0 4px 8px rgba(11, 42, 94, 0.04) */
  shadowFeature: {
    shadowColor: "#011A75",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1 as const,
  },
  /** Tab bar: 0 8px 18px rgba(11, 42, 94, 0.12) */
  shadowTabBar: {
    shadowColor: "#011A75",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8 as const,
  },

  /** @deprecated use shadowCard */
  shadowSoft: {
    shadowColor: "#011A75",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2 as const,
  },
  /** @deprecated use shadowCardEmphasis */
  shadowMedium: {
    shadowColor: "#011A75",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4 as const,
  },

  radiusCard: 20,
  radiusPanel: 18,
  radiusWallet: 22,
  radiusStats: 24,
  radiusInput: 14,
  radiusPill: 999,

  focusRing: "rgba(20, 40, 160, 0.4)",

  loginColumnMax: 384,
  marketingMax: 1024,
  appPadH: 16,
} as const;
