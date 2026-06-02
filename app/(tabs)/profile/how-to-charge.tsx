import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { HowToChargeGuideBody } from "components/vajra/HowToChargeGuideBody";
import { ProfileSubScreen } from "components/vajra/ProfileSubScreen";

export default function HowToChargeScreen() {
  const { refreshControl } = usePullToRefresh(async () => {}, false);

  return (
    <ProfileSubScreen title="How to charge" refreshControl={refreshControl}>
      <HowToChargeGuideBody variant="app" />
    </ProfileSubScreen>
  );
}
