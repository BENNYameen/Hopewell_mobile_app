import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { IconSymbol } from "components/ui/icon-symbol";
import { V } from "@/theme/vajra";
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
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <IconSymbol name="arrow.left" size={18} color={V.headingDeep} />
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
    backgroundColor: V.pageBg,
    paddingHorizontal: V.appPadH,
    paddingTop: 40,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: V.borderNavy,
    backgroundColor: V.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: V.headingDeep,
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
