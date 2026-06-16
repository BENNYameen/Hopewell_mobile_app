import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Platform, useColorScheme as useSystemColorScheme } from "react-native";

import {
  loadAppearancePreference,
  saveAppearancePreference,
  type ThemePreference,
} from "@/theme/appearance-storage";

type AppThemeContextValue = {
  preference: ThemePreference;
  colorScheme: "light" | "dark";
  isReady: boolean;
  setPreference: (preference: ThemePreference) => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadAppearancePreference()
      .then((stored) => {
        if (mounted) setPreferenceState(stored);
      })
      .finally(() => {
        if (mounted) setIsReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const colorScheme: "light" | "dark" =
    preference === "system" ? (systemScheme === "dark" ? "dark" : "light") : preference;

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("dark", colorScheme === "dark");
    root.style.colorScheme = colorScheme;
  }, [colorScheme]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    void saveAppearancePreference(next);
  }, []);

  const value = useMemo(
    () => ({
      preference,
      colorScheme,
      isReady,
      setPreference,
    }),
    [colorScheme, isReady, preference, setPreference],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }
  return context;
}
