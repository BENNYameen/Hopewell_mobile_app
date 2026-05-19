import { useWindowDimensions } from "react-native";

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
