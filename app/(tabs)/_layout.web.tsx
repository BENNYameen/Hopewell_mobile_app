import { Redirect, Tabs, useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { WebSidebarProvider, useWebSidebar } from "@/context/web-sidebar";
import { useVajraColors } from "@/hooks/use-vajra-colors";
import { useAppSelector } from "@/store/hooks";
import { V } from "@/theme/vajra";

import { HapticTab } from "components/haptic-tab";
import { WebDashboardSidebar } from "components/vajra/WebDashboardSidebar";
import { WebShellTopBar } from "components/vajra/WebShellTopBar";

/**
 * Web: Vite-style dashboard — left sidebar + main area (no bottom tab bar).
 * Native uses default `_layout.tsx` with floating pill tabs.
 */
export default function TabLayoutWeb() {
  const { isAuthenticated, sessionHydrated } = useAppSelector(
    (state) => state.auth,
  );
  const router = useRouter();
  const tabAccent = V.primary;
  const tabInactive = V.label;

  if (!sessionHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <WebSidebarProvider>
      <WebTabShell router={router} tabAccent={tabAccent} tabInactive={tabInactive} />
    </WebSidebarProvider>
  );
}

function WebTabShell({
  router,
  tabAccent,
  tabInactive,
}: {
  router: ReturnType<typeof useRouter>;
  tabAccent: string;
  tabInactive: string;
}) {
  const { open, close } = useWebSidebar();
  const colors = useVajraColors();
  const shellStyles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          position: "relative",
          backgroundColor: colors.pageBg,
          width: "100%",
          minHeight: "100vh",
          height: "100vh",
          overflow: "hidden",
        },
        main: {
          flex: 1,
          width: "100%",
          minWidth: 0,
          minHeight: 0,
          overflow: "hidden",
        },
        backdrop: {
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: "rgba(15, 23, 42, 0.45)",
          zIndex: 40,
        },
        sidebarDrawer: {
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
          shadowColor: colors.shadowNavy,
          shadowOpacity: 0.12,
          shadowRadius: 16,
          shadowOffset: { width: 4, height: 0 },
          elevation: 8,
        },
      }),
    [colors.pageBg, colors.shadowNavy],
  );

  return (
    <View style={shellStyles.root}>
      <View style={shellStyles.main}>
        <WebShellTopBar />
        <Tabs
          initialRouteName="home"
          tabBar={() => null}
          screenOptions={{
            headerShown: false,
            lazy: true,
            freezeOnBlur: true,
            detachInactiveScreens: true,
            tabBarShowLabel: false,
            tabBarButton: HapticTab,
            tabBarActiveTintColor: tabAccent,
            tabBarInactiveTintColor: tabInactive,
          }}
        >
          <Tabs.Screen name="home" />
          <Tabs.Screen name="map" options={{ href: null }} />
          <Tabs.Screen name="recent" />
          <Tabs.Screen name="qr" options={{ unmountOnBlur: true }} />
          <Tabs.Screen name="qr-result" options={{ href: null }} />
          <Tabs.Screen name="offers" options={{ href: null }} />
          <Tabs.Screen
            name="profile"
            listeners={{
              tabPress: () => {
                router.replace("/profile");
              },
            }}
          />
        </Tabs>
      </View>
      {open ? (
        <>
          <Pressable
            style={shellStyles.backdrop}
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel="Close navigation menu"
          />
          <View style={shellStyles.sidebarDrawer}>
            <WebDashboardSidebar />
          </View>
        </>
      ) : null}
    </View>
  );
}

