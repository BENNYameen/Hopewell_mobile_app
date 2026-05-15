import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import { Collapsible } from "./collapsible";

describe("Collapsible", () => {
  it("shows children after toggling open", () => {
    render(
      <Collapsible title="Section">
        <Text>Hidden Content</Text>
      </Collapsible>
    );

    expect(screen.queryByText("Hidden Content")).toBeNull();

    fireEvent.press(screen.getByText("Section"));

    expect(screen.getByText("Hidden Content")).toBeTruthy();
  });
});
