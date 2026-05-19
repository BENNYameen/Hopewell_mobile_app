import { StyleSheet, View } from "react-native";

import { ProfileSubScreen } from "components/vajra/ProfileSubScreen";
import { RecentContent } from "../recent";

export default function ChargingHistory() {
  return (
    <ProfileSubScreen
      title="Charging history"
      scroll={false}
      contentContainerStyle={styles.listContainer}
    >
      <View style={styles.listWrap}>
        <RecentContent showHeader={false} withContainer={false} />
      </View>
    </ProfileSubScreen>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    paddingBottom: 8,
  },
  listWrap: {
    flex: 1,
  },
});
