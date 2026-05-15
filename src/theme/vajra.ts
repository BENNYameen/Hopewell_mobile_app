/**
 * Vajra design tokens — build-accurate (mobile parity with web spec).
 */

/** rgba(11, 42, 94 · #0B2A5E) */
export const V = {
  primary: "#21B3A7",
  primaryHover: "#1E9FA3",
  primaryLight: "#2EC6C9",
  accentAlt: "#22B9C4",

  headingDeep: "#0F172A",
  heading: "#1A2850",
  headingMuted: "#13233D",

  bodySecondary: "#6C7CA6",
  label: "#8B97B2",
  labelStrong: "#7B8AB0",

  pageBg: "#F3F6FB",
  card: "#FFFFFF",
  panelTint: "#F7FAFF",
  darkBlock: "#0F172A",

  tealMuted: "rgba(33, 179, 167, 0.12)",
  tealRing20: "rgba(33, 179, 167, 0.2)",
  tealBadgeText: "#0F6A6A",
  successFill: "#E7FBF9",

  sessionDoneBg: "#EFF6FF",
  sessionDoneLabel: "#1E40AF",

  error: "#C81D2C",
  errorSurface: "#FEF2F2",
  errorBorder: "#FECACA",

  unavailable: "#E0586A",

  /** Card / rules — canonical */
  borderNavy: "rgba(40, 92, 153, 0.12)",
  borderNavyMedium: "rgba(40, 92, 153, 0.2)",
  borderHairline: "rgba(40, 92, 153, 0.08)",
  borderStepCard: "rgba(40, 92, 153, 0.1)",

  tabBarBorder: "rgba(15, 23, 42, 0.08)",

  shadowNavy: "#0B2A5E",
  /** 0 8px 12px rgba(11, 42, 94, 0.06) */
  shadowCard: {
    shadowColor: "#0B2A5E",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2 as const,
  },
  /** 0 10px 14px rgba(11, 42, 94, 0.08) */
  shadowCardEmphasis: {
    shadowColor: "#0B2A5E",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4 as const,
  },
  /** Feature row landing: 0 4px 8px rgba(11, 42, 94, 0.04) */
  shadowFeature: {
    shadowColor: "#0B2A5E",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1 as const,
  },
  /** Tab bar: 0 8px 18px rgba(11, 42, 94, 0.12) */
  shadowTabBar: {
    shadowColor: "#0B2A5E",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8 as const,
  },

  /** @deprecated use shadowCard */
  shadowSoft: {
    shadowColor: "#0B2A5E",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2 as const,
  },
  /** @deprecated use shadowCardEmphasis */
  shadowMedium: {
    shadowColor: "#0B2A5E",
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

  focusRing: "rgba(33, 179, 167, 0.4)",

  loginColumnMax: 384,
  marketingMax: 1024,
  appPadH: 16,
} as const;
