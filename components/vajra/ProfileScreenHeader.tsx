import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useThemedStyles, useVajraColors } from "@/hooks/use-vajra-colors";
import type { VajraColors } from "@/theme/vajra-colors";
import { IconSymbol } from "components/ui/icon-symbol";

export const PROFILE_HEADER_SIDE = 36;

type ProfileScreenHeaderProps = {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
};

/** Shared Account stack header: back (optional) + centered title. */
export function ProfileScreenHeader({
  title,
  showBack = true,
  onBack,
}: ProfileScreenHeaderProps) {
  const router = useRouter();
  const colors = useVajraColors();
  const styles = useThemedStyles(createStyles);

  const handleBack = onBack ?? (() => router.back());

  return (
    <View style={styles.headerRow}>
      {showBack ? (
        <Pressable
          style={styles.backBtn}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <IconSymbol name="arrow.left" size={18} color={colors.headingDeep} />
        </Pressable>
      ) : (
        <View style={styles.headerSpacer} />
      )}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

const createStyles = (V: VajraColors) =>
  StyleSheet.create({
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    backBtn: {
      width: PROFILE_HEADER_SIDE,
      height: PROFILE_HEADER_SIDE,
      borderRadius: PROFILE_HEADER_SIDE / 2,
      borderWidth: 1,
      borderColor: V.borderNavy,
      backgroundColor: V.card,
      alignItems: "center",
      justifyContent: "center",
    },
    headerSpacer: {
      width: PROFILE_HEADER_SIDE,
      height: PROFILE_HEADER_SIDE,
    },
    title: {
      flex: 1,
      textAlign: "center",
      fontSize: 18,
      fontWeight: "700",
      color: V.headingDeep,
      marginHorizontal: 8,
    },
  });
