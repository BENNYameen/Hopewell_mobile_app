import {
  BREAKPOINT_EXPANDED,
  SIDEBAR_WIDTH,
  useResponsiveLayout,
} from "@/hooks/use-responsive-layout";

/** @deprecated Use `useResponsiveLayout` — kept for existing imports. */
export const WEB_SIDEBAR_WIDTH = SIDEBAR_WIDTH;
export const WEB_SIDEBAR_DESKTOP_MIN = BREAKPOINT_EXPANDED;

/** Narrow viewports: drawer overlay. Wide: docked sidebar beside content. */
export function useWebSidebarLayout() {
  const layout = useResponsiveLayout();
  return {
    isOverlay: layout.isOverlaySidebar,
    sidebarWidth: layout.sidebarWidth,
    viewportWidth: layout.width,
    tier: layout.tier,
    isDockedSidebar: layout.isDockedSidebar,
  };
}
