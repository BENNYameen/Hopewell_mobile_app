/**
 * Desktop web shell — matches Vite `Layout.tsx` sidebar: brand, 5 nav items, log out.
 */
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { V } from "@/theme/vajra";
import { IconSymbol } from "components/ui/icon-symbol";
import type { IconName } from "components/ui/icon-names";

type NavKey = "home" | "sessions" | "charge" | "wallet" | "profile";

const NAV: { key: NavKey; href: string; label: string; icon: IconName }[] = [
  { key: "home", href: "/(tabs)/home", label: "Home", icon: "bolt.fill" },
  {
    key: "sessions",
    href: "/(tabs)/recent",
    label: "Sessions",
    icon: "clock.fill",
  },
  { key: "charge", href: "/(tabs)/qr", label: "Charge", icon: "qrcode" },
  {
    key: "wallet",
    href: "/(tabs)/profile/wallet",
    label: "Wallet",
    icon: "wallet.pass.fill",
  },
  {
    key: "profile",
    href: "/(tabs)/profile",
    label: "Profile",
    icon: "person.fill",
  },
];

function activeNavKey(pathname: string): NavKey {
  const p = pathname.replace(/\/$/, "");
  if (
    p.includes("/profile/wallet") ||
    p.includes("/profile/transactions") ||
    p.includes("/profile/add-money")
  )
    return "wallet";
  if (
    p.includes("/profile/personal") ||
    p.includes("/profile/charging-history") ||
    p.includes("/profile/transactions") ||
    p.includes("/profile/how-to-charge") ||
    p.includes("/profile/logout") ||
    (p.includes("/profile") && !p.includes("/wallet"))
  ) {
    return "profile";
  }
  if (p.includes("/recent")) return "sessions";
  if (p.includes("/qr")) return "charge";
  if (p.includes("/home")) return "home";
  return "home";
}

export function WebDashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const current = activeNavKey(pathname);

  return (
    <View style={styles.aside}>
      <View style={styles.brandRow}>
        <View style={styles.brandIcon}>
          <IconSymbol name="bolt.fill" size={17} color="#FFFFFF" />
        </View>
        <View>
          <Text style={styles.brandTitle}>Vajra Volt</Text>
          <Text style={styles.brandTag}>CHARGING</Text>
        </View>
      </View>

      <View style={styles.nav}>
        {NAV.map((item) => {
          const on = item.key === current;
          return (
            <Pressable
              key={item.key}
              onPress={() => router.replace(item.href as Parameters<typeof router.replace>[0])}
              style={[styles.navItem, on && styles.navItemActive]}
            >
              <IconSymbol
                name={item.icon}
                size={20}
                color={on ? V.primary : V.bodySecondary}
              />
              <Text style={[styles.navLabel, on && styles.navLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={styles.logoutBtn}
          onPress={() => router.push("/profile/logout")}
        >
          <IconSymbol name="arrow.right" size={18} color={V.bodySecondary} />
          <Text style={styles.logoutLabel}>Log out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  aside: {
    width: 240,
    flexShrink: 0,
    backgroundColor: V.card,
    borderRightWidth: 1,
    borderRightColor: V.borderHairline,
    paddingBottom: 16,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: V.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: V.headingDeep,
  },
  brandTag: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 3,
    color: V.label,
  },
  nav: {
    flex: 1,
    paddingHorizontal: 12,
    gap: 4,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: V.tealMuted,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: V.bodySecondary,
  },
  navLabelActive: {
    color: V.primary,
    fontWeight: "700",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: V.borderHairline,
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  logoutLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: V.bodySecondary,
  },
});
