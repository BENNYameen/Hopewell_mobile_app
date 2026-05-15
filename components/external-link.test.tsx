import { render, screen } from "@testing-library/react-native";
import { openBrowserAsync, WebBrowserPresentationStyle } from "expo-web-browser";

import { ExternalLink } from "./external-link";

describe("ExternalLink", () => {
  const originalExpoOs = process.env.EXPO_OS;

  afterEach(() => {
    process.env.EXPO_OS = originalExpoOs;
    jest.clearAllMocks();
  });

  it("opens the in-app browser on native", async () => {
    process.env.EXPO_OS = "ios";
    render(<ExternalLink href="https://example.com">Docs</ExternalLink>);

    const preventDefault = jest.fn();
    await screen.getByText("Docs").props.onPress({ preventDefault });

    expect(preventDefault).toHaveBeenCalled();
    expect(openBrowserAsync).toHaveBeenCalledWith("https://example.com", {
      presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
    });
  });
});
