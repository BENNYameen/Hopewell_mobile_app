import { Redirect, Stack } from "expo-router";
import { useAppSelector } from "@/store/hooks";
import { ActivityIndicator, View } from "react-native";

export default function AuthLayout() {
  const { isAuthenticated, sessionHydrated } = useAppSelector(
    (state) => state.auth,
  );

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
    return <Redirect href="/(tabs)/map" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
