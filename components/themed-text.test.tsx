jest.mock("../hooks/use-theme-color", () => ({
  useThemeColor: jest.fn(() => "#123456"),
}));

import { render, screen } from "@testing-library/react-native";

import { ThemedText } from "./themed-text";

describe("ThemedText", () => {
  it("renders text with the resolved color and title styles", () => {
    render(<ThemedText type="title">Heading</ThemedText>);

    expect(screen.getByText("Heading").props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: "#123456" }),
        expect.objectContaining({ fontSize: 32, fontWeight: "bold" }),
      ])
    );
  });
});
