import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { clearStoredSession, validateStoredSession } from "@/auth/session";
import { restoreSession } from "@/features/auth/slice";
import { store } from "@/store";
import { useAppDispatch } from "@/store/hooks";
import { Provider } from "react-redux";
import "../global.css";
import { useColorScheme } from "../hooks/use-color-scheme";

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

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Provider store={store}>
        <SessionBootstrap />
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false, title: "Explore" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </Provider>
    </ThemeProvider>
  );
}
