import { usePathname } from "expo-router";
import { useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useWebSidebar } from "@/context/web-sidebar";

import { useWebShellTopBarMetrics } from "@/hooks/use-responsive-layout";

import { useVajraColors } from "@/hooks/use-vajra-colors";

import { IconSymbol } from "components/ui/icon-symbol";
import { PwaInstallEntry } from "components/pwa/PwaInstallEntry";



/** Shown above tab content on web when the sidebar is collapsed. */

export function WebShellTopBar() {
  const pathname = usePathname();
  const isMapRoute = pathname.replace(/\/$/, "").includes("/map");
  const { open, openSidebar } = useWebSidebar();

  const colors = useVajraColors();

  const { safeTop } = useWebShellTopBarMetrics();

  const styles = useMemo(

    () =>

      StyleSheet.create({

        bar: {

          flexDirection: "row",

          alignItems: "center",

          gap: 8,

          paddingHorizontal: 16,

          paddingBottom: 10,

          borderBottomWidth: 1,

          borderBottomColor: colors.borderHairline,

          backgroundColor: colors.card,

        },

        menuBtn: {

          width: 40,

          height: 40,

          borderRadius: 10,

          alignItems: "center",

          justifyContent: "center",

          backgroundColor: colors.pageBg,

        },

        title: {

          fontSize: 15,

          fontWeight: "700",

          color: colors.headingDeep,

        },

      }),

    [colors],

  );



  if (open || isMapRoute) {
    return null;
  }



  return (

    <View style={[styles.bar, { paddingTop: safeTop + 8 }]}>

      <Pressable

        onPress={openSidebar}

        style={styles.menuBtn}

        accessibilityRole="button"

        accessibilityLabel="Expand sidebar"

      >

        <IconSymbol name="chevron.right" size={22} color={colors.headingDeep} />

      </Pressable>

      <Text style={styles.title}>Vajra Volt</Text>
      <PwaInstallEntry />

    </View>

  );

}

