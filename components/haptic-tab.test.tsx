import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

describe("HapticTab", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("forwards press-in events", () => {
    const { HapticTab } = require("./haptic-tab");
    const onPressIn = jest.fn();

    render(
      <HapticTab onPressIn={onPressIn}>
        <Text>Tab</Text>
      </HapticTab>
    );

    screen.getByTestId("platform-pressable").props.onPressIn({});

    expect(onPressIn).toHaveBeenCalled();
  });

  it("renders the tab content inside the pressable wrapper", () => {
    const { HapticTab } = require("./haptic-tab");

    render(
      <HapticTab>
        <Text>Tab</Text>
      </HapticTab>
    );

    expect(screen.getByText("Tab")).toBeTruthy();
    expect(screen.getByTestId("platform-pressable")).toBeTruthy();
  });
});
