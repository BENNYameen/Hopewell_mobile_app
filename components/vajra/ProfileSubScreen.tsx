import type { ReactElement, ReactNode } from "react";
import type { RefreshControlProps, StyleProp, ViewStyle } from "react-native";

import { ProfileScreenHeader } from "components/vajra/ProfileScreenHeader";
import { TabScreen } from "components/vajra/TabScreen";

type ProfileSubScreenProps = {
  title: string;
  children: ReactNode;
  keyboardAvoiding?: boolean;
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  refreshControl?: ReactElement<RefreshControlProps>;
};

/** Profile stack screens with back navigation and tab-bar-safe scrolling. */
export function ProfileSubScreen({
  title,
  children,
  keyboardAvoiding = false,
  scroll = true,
  contentContainerStyle,
  refreshControl,
}: ProfileSubScreenProps) {
  return (
    <TabScreen
      scroll={scroll}
      keyboardAvoiding={keyboardAvoiding}
      contentContainerStyle={contentContainerStyle}
      refreshControl={refreshControl}
      header={<ProfileScreenHeader title={title} />}
    >
      {children}
    </TabScreen>
  );
}
