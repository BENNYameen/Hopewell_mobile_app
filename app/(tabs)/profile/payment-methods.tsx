import { StyleSheet, Text } from "react-native";

import { ProfileSubScreen } from "components/vajra/ProfileSubScreen";

export default function PaymentMethods() {
  return (
    <ProfileSubScreen title="Payment methods">
      <Text style={styles.body}>Manage your cards and wallets here.</Text>
    </ProfileSubScreen>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: 14,
    color: "#6C7CA6",
    fontWeight: "600",
  },
});
