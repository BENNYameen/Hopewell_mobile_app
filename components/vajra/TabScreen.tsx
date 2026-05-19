import type { ReactElement, ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import type { RefreshControlProps } from "react-native";
import {
  SafeAreaView,
  type Edge,
} from "react-native-safe-area-context";

import { useTabScreenInsets } from "@/hooks/use-tab-screen-insets";
import { useWebContentPadding } from "@/hooks/use-web-content-padding";
import { V } from "@/theme/vajra";

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
  const { top, bottom, horizontal } = useTabScreenInsets();
  const webContentPadding = useWebContentPadding({ hasHeader: !!header });

  const contentPadding: ViewStyle = isWeb
    ? {
        paddingTop: webContentPadding.scrollPaddingTop,
        paddingBottom: webContentPadding.paddingBottom,
        paddingHorizontal: webContentPadding.paddingHorizontal,
        width: webContentPadding.width,
        alignSelf: webContentPadding.alignSelf,
      }
    : {
        paddingTop: header ? 12 : top,
        paddingBottom: bottom,
        paddingHorizontal: horizontal,
      };

  const body = scroll ? (
    <ScrollView
      style={isWeb ? styles.webScroll : styles.fill}
      showsVerticalScrollIndicator={isWeb}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      contentContainerStyle={[contentPadding, contentContainerStyle]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.fill, contentPadding, contentContainerStyle]}>
      {children}
    </View>
  );

  if (isWeb) {
    return (
      <View style={[styles.webPage, style]}>
        {header ? (
          <View
            style={[
              styles.webHeader,
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
    <SafeAreaView style={[styles.safe, style]} edges={edges}>
      {header ? (
        <View style={[styles.header, { paddingTop: top, paddingHorizontal: horizontal }]}>
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
      style={styles.fill}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {shell}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  webPage: {
    flex: 1,
    backgroundColor: V.pageBg,
    minHeight: 0,
  },
  webScroll: {
    flex: 1,
  },
  webHeader: {
    paddingBottom: 4,
  },
  safe: {
    flex: 1,
    backgroundColor: V.pageBg,
  },
  fill: {
    flex: 1,
  },
  header: {
    paddingBottom: 4,
  },
});
