import { useAppTheme } from "@/context/app-theme";

export function useColorScheme() {
  const { colorScheme, isReady } = useAppTheme();
  if (!isReady) {
    return "light" as const;
  }
  return colorScheme;
}
