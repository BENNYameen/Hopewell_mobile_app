import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { IconSymbol } from "components/ui/icon-symbol";
import { V } from "@/theme/vajra";

export default function PaymentMethods() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <IconSymbol name="arrow.left" size={18} color={V.headingDeep} />
      </Pressable>
      <Text style={styles.title}>Payment methods</Text>
      <Text style={styles.body}>Manage your cards and wallets here.</Text>
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
});
