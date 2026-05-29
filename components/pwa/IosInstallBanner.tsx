import { Pressable, StyleSheet, Text, View } from "react-native";

import { V } from "@/theme/vajra";

type IosInstallBannerProps = {
  visible: boolean;
  onDismiss: () => void;
};

export function IosInstallBanner({ visible, onDismiss }: IosInstallBannerProps) {
  if (!visible) return null;

  return (
    <View style={styles.banner}>
      <View style={styles.textWrap}>
        <Text style={styles.title}>Add to Home Screen</Text>
        <Text style={styles.text}>Tap Share, then Add to Home Screen</Text>
      </View>
      <Pressable onPress={onDismiss} style={styles.dismissBtn}>
        <Text style={styles.dismissText}>Dismiss</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: V.borderNavy,
    backgroundColor: V.card,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: "700",
    color: V.headingDeep,
  },
  text: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "600",
    color: V.bodySecondary,
  },
  dismissBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: V.borderNavy,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: V.pageBg,
  },
  dismissText: {
    fontSize: 11,
    fontWeight: "700",
    color: V.heading,
  },
});
