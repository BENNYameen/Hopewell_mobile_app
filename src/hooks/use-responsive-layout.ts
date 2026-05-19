import { Platform, useWindowDimensions } from "react-native";

/** Sidebar width (web shell). */
export const SIDEBAR_WIDTH = 240;

/** Web shell top bar height when sidebar is collapsed. */
export const WEB_SHELL_TOP_BAR_HEIGHT = 57;

/** >= expanded: docked sidebar. < expanded: overlay drawer. */
export const BREAKPOINT_EXPANDED = 1024;

/** >= medium: roomier content padding / two-column web layouts. */
export const BREAKPOINT_MEDIUM = 768;

export type LayoutTier = "compact" | "medium" | "expanded";

export function getLayoutTier(width: number): LayoutTier {
  if (width >= BREAKPOINT_EXPANDED) return "expanded";
  if (width >= BREAKPOINT_MEDIUM) return "medium";
  return "compact";
}

/**
 * Shared breakpoints for web shell + tab screen content.
 * Native apps use compact/medium padding via the same tier when running on tablets.
 */
export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const tier = getLayoutTier(width);
  const isDockedSidebar = tier === "expanded";
  const isOverlaySidebar = !isDockedSidebar;

  /** Match native `V.appPadH` on phone-width web; slightly wider gutters on large web. */
  const contentPaddingH =
    tier === "compact" ? 20 : tier === "medium" ? 24 : 28;

  return {
    tier,
    width,
    height,
    isDockedSidebar,
    isOverlaySidebar,
    contentPaddingH,
    sidebarWidth: SIDEBAR_WIDTH,
  };
}

/**
 * Marketing / auth screens (landing, guide, login) — same tiers as the app shell:
 * compact (<768 phone), medium (768–1023 tablet / small laptop), expanded (≥1024 desktop).
 */
export function useMarketingLayout() {
  const layout = useResponsiveLayout();
  const { tier, width, contentPaddingH } = layout;
  const isCompact = tier === "compact";
  const isMedium = tier === "medium";
  const isExpanded = tier === "expanded";

  const isWeb = Platform.OS === "web";
  const isDesktopWeb = isWeb && !isCompact;

  return {
    ...layout,
    isWeb,
    isDesktopWeb,
    isCompact,
    isMedium,
    isExpanded,
    /** Desktop-style guide tabs & centered hero (tablet landscape+ and laptop). */
    layoutWide: !isCompact,
    /** Phone / narrow web: 2×2 tabs, tighter hero, simplified header. */
    marketingNarrow: isCompact,
    pagePad: contentPaddingH,
    /** Full header links on medium+ viewports. */
    showHeaderNav: !isCompact,
  };
}
