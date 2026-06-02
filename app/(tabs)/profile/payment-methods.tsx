import { StyleSheet, Text } from "react-native";

import { ProfileSubScreen } from "components/vajra/ProfileSubScreen";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

export default function PaymentMethods() {
  const { refreshControl } = usePullToRefresh(async () => {}, false);

  return (
    <ProfileSubScreen title="Payment methods" refreshControl={refreshControl}>
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
