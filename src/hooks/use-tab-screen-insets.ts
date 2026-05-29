import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { V } from "@/theme/vajra";

/** Floating tab bar height from `app/(tabs)/_layout.tsx`. */
export const TAB_BAR_HEIGHT = 64;

/** Minimum gap between tab bar and screen bottom edge. */
export const TAB_BAR_FLOAT_GAP = 12;

/** Space between scroll content and the top of the floating tab bar. */
export const TAB_BAR_CONTENT_GAP = 16;

/**
 * Consistent safe-area + floating tab bar insets for tab screens (native).
 * On web, tab bar is hidden — only safe area + padding apply.
 */
export function useTabScreenInsets() {
  const insets = useSafeAreaInsets();
  const isNativeTab = Platform.OS !== "web";

  const tabBarBottom = isNativeTab
    ? Math.max(insets.bottom, TAB_BAR_FLOAT_GAP)
    : Math.max(insets.bottom, 16);

  const tabBarClearance = isNativeTab
    ? tabBarBottom + TAB_BAR_HEIGHT + TAB_BAR_CONTENT_GAP
    : Math.max(insets.bottom, 24) + 16;

  const footerBottom = isNativeTab
    ? tabBarBottom + TAB_BAR_HEIGHT + 8
    : Math.max(insets.bottom, 16);

  return {
    top: insets.top + 12,
    bottom: tabBarClearance,
    horizontal: V.appPadH,
    footerBottom,
    safeBottom: insets.bottom,
    tabBarBottom,
    insets,
  };
}
