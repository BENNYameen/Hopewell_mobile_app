import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/context/app-theme";
import type { ThemePreference } from "@/theme/appearance-storage";
import type { VajraColors } from "@/theme/vajra-colors";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useThemedStyles } from "@/hooks/use-vajra-colors";
import { ProfileSubScreen } from "components/vajra/ProfileSubScreen";

const OPTIONS: { value: ThemePreference; label: string; hint: string }[] = [
  { value: "light", label: "Light", hint: "Always use light theme" },
  { value: "dark", label: "Dark", hint: "Always use dark theme" },
  { value: "system", label: "System", hint: "Match your device settings" },
];

export default function AppearanceScreen() {
  const { preference, setPreference } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { refreshControl } = usePullToRefresh(async () => {}, false);

  return (
    <ProfileSubScreen title="Appearance" refreshControl={refreshControl}>
      <Text style={styles.lead}>
        Choose how Vajra Volt looks. Your choice applies across the whole app.
      </Text>
      <View style={styles.card}>
        {OPTIONS.map((option, index) => {
          const selected = preference === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setPreference(option.value)}
              style={[styles.row, index === OPTIONS.length - 1 && styles.rowLast]}
            >
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{option.label}</Text>
                <Text style={styles.rowHint}>{option.hint}</Text>
              </View>
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </ProfileSubScreen>
  );
}

const createStyles = (V: VajraColors) =>
  StyleSheet.create({
    lead: {
      color: V.bodySecondary,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 16,
      fontWeight: "500",
    },
    card: {
      backgroundColor: V.card,
      borderRadius: V.radiusCard,
      borderWidth: 1,
      borderColor: V.borderNavy,
      overflow: "hidden",
      ...V.shadowCard,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: V.borderHairline,
    },
    rowLast: { borderBottomWidth: 0 },
    rowText: { flex: 1, gap: 4 },
    rowLabel: { color: V.headingDeep, fontWeight: "700", fontSize: 15 },
    rowHint: { color: V.label, fontSize: 12, fontWeight: "500" },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: V.borderNavyMedium,
      alignItems: "center",
      justifyContent: "center",
    },
    radioSelected: { borderColor: V.primary },
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: V.primary,
    },
  });
