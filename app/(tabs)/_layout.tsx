import { Redirect, Tabs, useRouter } from "expo-router";
import { Platform, View } from "react-native";
import { useAppSelector } from "@/store/hooks";

import { HapticTab } from "components/haptic-tab";
import { IconName } from "components/ui/icon-names";
import { IconSymbol } from "components/ui/icon-symbol";

/* ---------------------------------------------
 * Static tab icon (no animation)
 * ------------------------------------------- */
function TabIcon({
  focused,
  color,
  name,
  size = 24,
}: {
  focused: boolean;
  color: string;
  name: IconName;
  size?: number;
}) {
  return (
    <View
      style={
        focused
          ? {
              width: 42,
              height: 42,
              borderRadius: 21,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: color,
            }
          : undefined
      }
    >
      <IconSymbol name={name} size={size} color={color} />
    </View>
  );
}

/* ---------------------------------------------
 * Floating QR primary action
 * ------------------------------------------- */
function QRFloatingButton({ color }: { color: string }) {
  return (
    <View
      style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: color,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: Platform.OS === "ios" ? 20 : 12,

        shadowColor: "#000",
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: 12,
      }}
    >
      <IconSymbol name="qrcode" size={28} color="#fff" />
    </View>
  );
}

/* ---------------------------------------------
 * Tabs layout (DEFAULT EXPORT)
 * ------------------------------------------- */
export default function TabLayout() {
  const { isAuthenticated, sessionHydrated } = useAppSelector(
    (state) => state.auth,
  );
  const router = useRouter();
  const tabAccent = "#2EC6C9";
  const tabInactive = "#8B97B2";

  if (!sessionHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        lazy: true,
        freezeOnBlur: true,
        tabBarShowLabel: false,
        tabBarButton: HapticTab,

        tabBarActiveTintColor: tabAccent,
        tabBarInactiveTintColor: tabInactive,

        tabBarStyle: {
          position: "absolute",
          bottom: 24,
          left: 20,
          right: 20,
          height: 64,
          borderRadius: 32,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: "rgba(15, 23, 42, 0.08)",

          ...(Platform.OS === "ios"
            ? {
                shadowColor: "#0B2A5E",
                shadowOpacity: 0.12,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 8 },
              }
            : {
                elevation: 6,
              }),
        },

        tabBarItemStyle: {
          marginVertical: 10,
        },
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} name="map.fill" />
          ),
        }}
      />
      <Tabs.Screen
        name="recent"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} name="clock.fill" />
          ),
        }}
      />

      {/* ⭐ Primary QR button */}
      <Tabs.Screen
        name="qr"
        options={{
          tabBarIcon: () => <QRFloatingButton color={tabAccent} />,
        }}
      />
      <Tabs.Screen
        name="qr-result"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="offers"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} name="gift.fill" />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} name="person.fill" />
          ),
        }}
        listeners={{
          tabPress: () => {
            router.replace("/profile");
          },
        }}
      />
    </Tabs>
  );
}
