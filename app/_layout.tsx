import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { clearStoredSession, validateStoredSession } from "@/auth/session";
import { AppThemeProvider } from "@/context/app-theme";
import { restoreSession } from "@/features/auth/slice";
import { store } from "@/store";
import { useAppDispatch } from "@/store/hooks";
import { registerPwaServiceWorker } from "@/web/pwa/registerServiceWorker";
import { Provider } from "react-redux";
import "../global.css";
import { useColorScheme } from "../hooks/use-color-scheme";
import { getVajraColors } from "@/theme/vajra-colors";

function SessionBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      const isValid = await validateStoredSession();

      if (!isValid) {
        await clearStoredSession();
      }

      if (!isMounted) return;
      dispatch(restoreSession(isValid));
    };

    bootstrapSession().catch(() => {
      clearStoredSession().catch(() => undefined);
      if (!isMounted) return;
      dispatch(restoreSession(false));
    });

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return null;
}

function RootNavigation() {
  const colorScheme = useColorScheme();
  const palette = getVajraColors(colorScheme);
  const navigationTheme =
    colorScheme === "dark"
      ? {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            primary: palette.primary,
            background: palette.pageBg,
            card: palette.card,
            text: palette.headingDeep,
            border: palette.borderNavy,
          },
        }
      : {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            primary: palette.primary,
            background: palette.pageBg,
            card: palette.card,
            text: palette.headingDeep,
            border: palette.borderNavy,
          },
        };

  useEffect(() => {
    registerPwaServiceWorker();
  }, []);

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "Explore" }} />
      </Stack>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <Provider store={store}>
          <SessionBootstrap />
          <RootNavigation />
        </Provider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}
