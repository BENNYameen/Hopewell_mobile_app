import type { ReactElement, ReactNode } from "react";
import { useMemo } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type RefreshControlProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  SafeAreaView,
  type Edge,
} from "react-native-safe-area-context";

import { useTabScreenInsets } from "@/hooks/use-tab-screen-insets";
import { useVajraColors } from "@/hooks/use-vajra-colors";
import { useWebContentPadding } from "@/hooks/use-web-content-padding";

type TabScreenProps = {
  children: ReactNode;
  /** Wrap body in ScrollView with tab-bar-aware padding. */
  scroll?: boolean;
  /** Renders above the scroll area (back button + title rows). */
  header?: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
  keyboardAvoiding?: boolean;
  refreshControl?: ReactElement<RefreshControlProps>;
};

export function TabScreen({
  children,
  scroll = true,
  header,
  style,
  contentContainerStyle,
  edges = ["top", "left", "right"],
  keyboardAvoiding = false,
  refreshControl,
}: TabScreenProps) {
  const isWeb = Platform.OS === "web";
  const colors = useVajraColors();
  const { bottom, horizontal } = useTabScreenInsets();
  const webContentPadding = useWebContentPadding({ hasHeader: !!header });
  const shellStyles = useMemo(
    () =>
      StyleSheet.create({
        webPage: {
          flex: 1,
          backgroundColor: colors.pageBg,
          minHeight: 0,
        },
        webScroll: { flex: 1 },
        webHeader: { paddingBottom: 4 },
        safe: { flex: 1, backgroundColor: colors.pageBg },
        fill: { flex: 1 },
        header: { paddingBottom: 4 },
      }),
    [colors.pageBg],
  );

  const nativeContentTop = 12;

  const contentPadding: ViewStyle = isWeb
    ? {
        paddingTop: webContentPadding.scrollPaddingTop,
        paddingBottom: webContentPadding.paddingBottom,
        paddingHorizontal: webContentPadding.paddingHorizontal,
        width: webContentPadding.width,
        alignSelf: webContentPadding.alignSelf,
      }
    : {
        paddingTop: nativeContentTop,
        paddingBottom: bottom,
        paddingHorizontal: horizontal,
      };

  const body = scroll ? (
    <ScrollView
      style={isWeb ? shellStyles.webScroll : shellStyles.fill}
      showsVerticalScrollIndicator={isWeb}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      contentContainerStyle={[contentPadding, contentContainerStyle]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[shellStyles.fill, contentPadding, contentContainerStyle]}>
      {children}
    </View>
  );

  if (isWeb) {
    return (
      <View style={[shellStyles.webPage, style]}>
        {header ? (
          <View
            style={[
              shellStyles.webHeader,
              {
                paddingTop: webContentPadding.headerPaddingTop,
                paddingHorizontal: webContentPadding.paddingHorizontal,
                width: webContentPadding.width,
                alignSelf: webContentPadding.alignSelf,
              },
            ]}
          >
            {header}
          </View>
        ) : null}
        {body}
      </View>
    );
  }

  const shell = (
    <SafeAreaView style={[shellStyles.safe, style]} edges={edges}>
      {header ? (
        <View
          style={[
            shellStyles.header,
            { paddingTop: nativeContentTop, paddingHorizontal: horizontal },
          ]}
        >
          {header}
        </View>
      ) : null}
      {body}
    </SafeAreaView>
  );

  if (!keyboardAvoiding) {
    return shell;
  }

  return (
    <KeyboardAvoidingView
      style={shellStyles.fill}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {shell}
    </KeyboardAvoidingView>
  );
}

