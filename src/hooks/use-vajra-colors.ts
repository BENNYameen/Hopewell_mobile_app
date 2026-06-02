import { useMemo } from "react";
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from "react-native";

import { useAppTheme } from "@/context/app-theme";
import { getVajraColors, type VajraColors } from "@/theme/vajra-colors";

export function useVajraColors(): VajraColors {
  const { colorScheme } = useAppTheme();
  return useMemo(() => getVajraColors(colorScheme), [colorScheme]);
}

type NamedStyles<T> = {
  [P in keyof T]: ViewStyle | TextStyle | ImageStyle;
};

/** Build StyleSheet from the active theme (recomputes when theme changes). */
export function useThemedStyles<T extends NamedStyles<T>>(factory: (colors: VajraColors) => T): T {
  const colors = useVajraColors();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- factory is a stable module-level callback
  return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
}
