import { usePathname } from "expo-router";
import { Platform } from "react-native";

import { useWebShellTopBarMetrics } from "@/hooks/use-responsive-layout";
import { useTabScreenInsets } from "@/hooks/use-tab-screen-insets";

/**
 * Shared map chrome offsets — native app + web (mobile and desktop).
 */
export function useMapScreenLayout(_hasLocationError = false) {
  const pathname = usePathname();
  const isMapRoute = pathname.replace(/\/$/, "").includes("/map");
  const { top, bottom, safeBottom, insets } = useTabScreenInsets();
  const { totalHeight: webShellTopHeight } = useWebShellTopBarMetrics();

  const sheetBottomInset = Platform.OS === "web" ? Math.max(safeBottom, 12) : bottom;
  const overlayTop =
    Platform.OS === "web"
      ? isMapRoute
        ? Math.max(insets.top, 12)
        : webShellTopHeight + 4
      : top;

  return {
    sheetBottomInset,
    overlayTop,
  };
}
