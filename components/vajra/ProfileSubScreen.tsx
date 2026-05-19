import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { useRouter } from "expo-router";

import { TabScreen } from "components/vajra/TabScreen";
import { V } from "@/theme/vajra";
import { IconSymbol } from "components/ui/icon-symbol";

type ProfileSubScreenProps = {
  title: string;
  children: ReactNode;
  keyboardAvoiding?: boolean;
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

/** Profile stack screens with back navigation and tab-bar-safe scrolling. */
export function ProfileSubScreen({
  title,
  children,
  keyboardAvoiding = false,
  scroll = true,
  contentContainerStyle,
}: ProfileSubScreenProps) {
  const router = useRouter();

  return (
    <TabScreen
      scroll={scroll}
      keyboardAvoiding={keyboardAvoiding}
      contentContainerStyle={contentContainerStyle}
      header={
        <View style={styles.headerRow}>
          <Pressable
            style={styles.backBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <IconSymbol name="arrow.left" size={18} color={V.headingDeep} />
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      }
    >
      {children}
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
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
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: V.headingDeep,
    marginHorizontal: 8,
  },
  headerSpacer: {
    width: 36,
    height: 36,
  },
});
