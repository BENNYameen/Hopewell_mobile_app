import Notification from "../../../src/profile/components/notification";
import { ProfileSubScreen } from "components/vajra/ProfileSubScreen";

export default function ProfileNotifications() {
  return (
    <ProfileSubScreen title="Notifications" scroll={false}>
      <Notification embedded />
    </ProfileSubScreen>
  );
}
