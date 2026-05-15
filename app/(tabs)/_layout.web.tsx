import { Redirect, Tabs, useRouter } from "expo-router";
import { View } from "react-native";

import { useAppSelector } from "@/store/hooks";
import { V } from "@/theme/vajra";

import { HapticTab } from "components/haptic-tab";
import { WebDashboardSidebar } from "components/vajra/WebDashboardSidebar";

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
    <View style={{ flex: 1, flexDirection: "row", backgroundColor: V.pageBg }}>
      <WebDashboardSidebar />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Tabs
          initialRouteName="home"
          tabBar={() => null}
          screenOptions={{
            headerShown: false,
            lazy: true,
            freezeOnBlur: true,
            tabBarShowLabel: false,
            tabBarButton: HapticTab,
            tabBarActiveTintColor: tabAccent,
            tabBarInactiveTintColor: tabInactive,
          }}
        >
          <Tabs.Screen name="home" />
          <Tabs.Screen name="map" options={{ href: null }} />
          <Tabs.Screen name="recent" />
          <Tabs.Screen name="qr" />
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
    </View>
  );
}
