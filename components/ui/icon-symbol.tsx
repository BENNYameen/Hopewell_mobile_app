import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ComponentProps } from "react";
import { OpaqueColorValue, StyleProp, TextStyle } from "react-native";

import { IconName } from "./icon-names";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

const MAPPING: Partial<Record<IconName, MaterialIconName>> = {
  "person.fill": "person",
  "bell.fill": "notifications",
  "qrcode": "qr-code",
  "clock.fill": "access-time",
  "bag.fill": "shopping-bag",
  "filter.fill": "filter-alt",
  "charger.fill": "ev-station",
  "map.fill": "map",
  "location.fill": "place",
  "chart.bar.fill": "bar-chart",
  "xmark": "close",
  "search": "search",
  "directions": "directions",
  "heart.fill": "favorite",
  "heart": "favorite-border",
  "arrow.left": "arrow-back",
  "arrow.right": "arrow-forward",
  menu: "menu",
  "plus": "add",
  "phone": "phone",
  "email": "email",
  "description": "description",
  "policy": "policy",
  "help": "help-outline",
  "info.circle.fill": "info",
  "gift.fill": "card-giftcard",
  "bolt.fill": "bolt",
  "wallet.pass.fill": "account-balance-wallet",

  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
};

const FALLBACK_ICON: MaterialIconName = "help-outline";

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}) {
  const iconName = MAPPING[name] ?? FALLBACK_ICON;

  return (
    <MaterialIcons
      name={iconName}
      size={size}
      color={color}
      style={style}
    />
  );
}
