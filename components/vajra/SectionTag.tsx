import { StyleSheet, Text, View } from "react-native";

import { V } from "@/theme/vajra";

type Props = {
  children: string;
};

export function SectionTag({ children }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: V.label,
    textTransform: "uppercase",
  },
});
