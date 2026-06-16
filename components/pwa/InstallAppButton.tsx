import { Pressable, StyleSheet, Text, View } from "react-native";

import { V } from "@/theme/vajra";
import { IconSymbol } from "components/ui/icon-symbol";

type InstallAppButtonProps = {
  visible: boolean;
  pending: boolean;
  statusText?: string;
  onPress: () => void;
  compact?: boolean;
};

export function InstallAppButton({
  visible,
  pending,
  statusText,
  onPress,
  compact = false,
}: InstallAppButtonProps) {
  if (!visible) return null;

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Install app"
        onPress={onPress}
        disabled={pending}
        style={[styles.btn, compact && styles.compactBtn, pending && styles.disabled]}
      >
        <IconSymbol name="download" size={16} color={V.card} />
        <Text style={styles.label}>{pending ? "Installing..." : "Install App"}</Text>
      </Pressable>
      {statusText ? <Text style={styles.meta}>{statusText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "flex-end",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: V.primary,
    borderRadius: V.radiusPill,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  compactBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  disabled: {
    opacity: 0.7,
  },
  label: {
    color: V.card,
    fontSize: 12,
    fontWeight: "700",
  },
  meta: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "600",
    color: V.label,
  },
});
