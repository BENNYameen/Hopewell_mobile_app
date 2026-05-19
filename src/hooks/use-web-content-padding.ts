import { Platform } from "react-native";

import { useWebSidebarState } from "@/context/web-sidebar";
import {
  useResponsiveLayout,
  WEB_SHELL_TOP_BAR_HEIGHT,
} from "@/hooks/use-responsive-layout";
import { V } from "@/theme/vajra";

/**
 * Web tab content padding — matches native mobile spacing (full width of main pane).
 */
export function useWebContentPadding(options?: { hasHeader?: boolean }) {
  const { contentPaddingH } = useResponsiveLayout();
  const sidebar = useWebSidebarState();
  const hasHeader = options?.hasHeader ?? false;

  const topBarInset =
    sidebar && !sidebar.open ? WEB_SHELL_TOP_BAR_HEIGHT : 0;

  const paddingHorizontal =
    contentPaddingH ?? V.appPadH;

  return {
    topBarInset,
    paddingHorizontal,
    width: "100%" as const,
    alignSelf: "stretch" as const,
    scrollPaddingTop: (hasHeader ? 8 : 20) + topBarInset,
    headerPaddingTop: 12 + topBarInset,
    paddingBottom: 40,
  };
}

export function isWebPlatform() {
  return Platform.OS === "web";
}
