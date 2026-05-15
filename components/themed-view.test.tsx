jest.mock("../hooks/use-theme-color", () => ({
  useThemeColor: jest.fn(() => "#abcdef"),
}));

import { render, screen } from "@testing-library/react-native";

import { ThemedView } from "./themed-view";

describe("ThemedView", () => {
  it("renders children with the resolved background color", () => {
    render(<ThemedView testID="themed-view" />);

    expect(screen.getByTestId("themed-view").props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: "#abcdef" })])
    );
  });
});
