import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { IconSymbol } from "components/ui/icon-symbol";
import { clearStoredSession } from "@/auth/session";
import { useLogoutMutation } from "@/auth/auth.api";
import { logout as logoutAction } from "@/features/auth/slice";
import { useAppDispatch } from "@/store/hooks";

export default function Logout() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logout, { isLoading, isError }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Backend may fail; still clear local session.
    } finally {
      await clearStoredSession();
      dispatch(logoutAction());
      router.replace("/(auth)/login");
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.backRow} onPress={() => router.back()}>
        <IconSymbol name="arrow.left" size={18} color="#0F172A" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <Text style={styles.title}>Log out</Text>
      <Text style={styles.body}>
        Log out confirmation will be handled here.
      </Text>
      {isError ? (
        <Text style={styles.errorText}>
          Logout failed. You have been signed out locally.
        </Text>
      ) : null}
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>
          {isLoading ? "Signing out..." : "Confirm log out"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6FB",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#1A2850",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    color: "#6C7CA6",
    fontWeight: "600",
  },
  logoutButton: {
    marginTop: 24,
    backgroundColor: "#E0586A",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  errorText: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: "600",
    color: "#C81D2C",
  },
});
