import { fireEvent, render, screen } from "@testing-library/react-native";

import Notification from "./notification";

describe("Notification", () => {
  it("renders notifications and clears them all", () => {
    render(<Notification />);

    expect(
      screen.getByText(
        "Your charging session has ended due to power fluctuation or current cut"
      )
    ).toBeTruthy();

    fireEvent.press(screen.getByText("Clear all"));

    expect(
      screen.queryByText(
        "Your charging session has ended due to power fluctuation or current cut"
      )
    ).toBeNull();
  });
});
