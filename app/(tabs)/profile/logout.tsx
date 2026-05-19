import { Pressable, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

import { ProfileSubScreen } from "components/vajra/ProfileSubScreen";
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
    <ProfileSubScreen title="Log out">
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
    </ProfileSubScreen>
  );
}

const styles = StyleSheet.create({
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
