import { render, screen } from "@testing-library/react-native";

import { HelloWave } from "./hello-wave";

describe("HelloWave", () => {
  it("renders the waving hand", () => {
    render(<HelloWave />);

    expect(screen.getByText("👋")).toBeTruthy();
  });
});
