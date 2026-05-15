jest.mock("../hooks/use-theme-color", () => ({
  useThemeColor: jest.fn(() => "#f8fafc"),
}));

jest.mock("../hooks/use-color-scheme", () => ({
  useColorScheme: jest.fn(() => "light"),
}));

import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import ParallaxScrollView from "./parallax-scroll-view";

describe("ParallaxScrollView", () => {
  it("renders the header image and content", () => {
    render(
      <ParallaxScrollView
        headerImage={<Text>Header Image</Text>}
        headerBackgroundColor={{ light: "#ffffff", dark: "#000000" }}
      >
        <Text>Body Content</Text>
      </ParallaxScrollView>
    );

    expect(screen.getByText("Header Image")).toBeTruthy();
    expect(screen.getByText("Body Content")).toBeTruthy();
  });
});
