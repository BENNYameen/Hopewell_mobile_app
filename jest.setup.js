global.__DEV__ = false;

jest.mock("expo-web-browser", () => ({
  openBrowserAsync: jest.fn(),
  WebBrowserPresentationStyle: {
    AUTOMATIC: "AUTOMATIC",
  },
}));

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: "Light",
  },
}));

jest.mock("expo-router", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return {
    Link: ({ children, ...props }) => React.createElement(Text, props, children),
  };
});

jest.mock("@react-navigation/elements", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    PlatformPressable: ({ children, ...props }) =>
      React.createElement(View, { testID: "platform-pressable", ...props }, children),
  };
});

jest.mock("@expo/vector-icons/MaterialIcons", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return ({ name, ...props }) =>
    React.createElement(Text, { testID: "material-icon", ...props }, name);
});

jest.mock("expo-symbols", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    SymbolView: (props) => React.createElement(View, { testID: "symbol-view", ...props }),
  };
});

jest.mock("react-native-reanimated", () => {
  const React = require("react");
  const { ScrollView, Text, View } = require("react-native");

  return {
    __esModule: true,
    default: {
      ScrollView,
      Text,
      View,
    },
    interpolate: (_value, _input, output) => output[1] ?? output[0],
    useAnimatedRef: () => null,
    useAnimatedStyle: (callback) => callback(),
    useScrollViewOffset: () => ({ value: 0 }),
  };
});
