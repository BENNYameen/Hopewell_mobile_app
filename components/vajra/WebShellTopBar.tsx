import { Pressable, StyleSheet, Text, View } from "react-native";

import { useWebSidebar } from "@/context/web-sidebar";
import { V } from "@/theme/vajra";
import { PwaInstallEntry } from "components/pwa/PwaInstallEntry";
import { IconSymbol } from "components/ui/icon-symbol";

/** Shown above tab content on web when the sidebar is collapsed. */
export function WebShellTopBar() {
  const { open, openSidebar } = useWebSidebar();

  if (open) {
    return null;
  }

  return (
    <View style={styles.bar}>
      <Pressable
        onPress={openSidebar}
        style={styles.menuBtn}
        accessibilityRole="button"
        accessibilityLabel="Expand sidebar"
      >
        <IconSymbol name="chevron.right" size={22} color={V.headingDeep} />
      </Pressable>
      <Text style={styles.title}>Vajra Volt</Text>
      <PwaInstallEntry />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: V.borderHairline,
    backgroundColor: V.card,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: V.pageBg,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: V.headingDeep,
    marginRight: 12,
  },
});
