import { Redirect, Stack, usePathname, useSegments } from "expo-router";
import { useAppSelector } from "@/store/hooks";
import { ActivityIndicator, Platform, View } from "react-native";

/**
 * Web: logged-in users can open marketing, guide, **and login** (session may be
 * stale; native still redirects authed users away from `(auth)`).
 */
const AUTH_PUBLIC_SCREENS_WEB = new Set(["landing", "charging-guide", "login"]);

function routeLeaf(segments: string[]) {
  const nonGroups = segments.filter((s) => !s.startsWith("("));
  return nonGroups[nonGroups.length - 1];
}

/** Web pathnames vary (`/login`, `/(auth)/login`). */
function pathnameLooksPublicAuthWeb(pathname: string) {
  const p = pathname.replace(/\/$/, "").toLowerCase();
  return (
    p.endsWith("/login") ||
    p.includes("/login?") ||
    p.includes("charging-guide") ||
    p.includes("landing")
  );
}

export default function AuthLayout() {
  const { isAuthenticated, sessionHydrated } = useAppSelector(
    (state) => state.auth,
  );
  const segments = useSegments();
  const pathname = usePathname() ?? "";
  const leaf = routeLeaf(segments as string[]);

  if (!sessionHydrated) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  if (isAuthenticated) {
    if (
      Platform.OS === "web" &&
      ((leaf && AUTH_PUBLIC_SCREENS_WEB.has(leaf)) ||
        pathnameLooksPublicAuthWeb(pathname))
    ) {
      return <Stack screenOptions={{ headerShown: false }} />;
    }
    return <Redirect href="/(tabs)/qr" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
