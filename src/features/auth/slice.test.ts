import reducer, { loginSuccess, logout, restoreSession } from "./slice";

describe("auth slice", () => {
  it("returns the initial state", () => {
    expect(reducer(undefined, { type: "unknown" })).toEqual({
      isAuthenticated: false,
      sessionHydrated: false,
    });
  });

  it("handles loginSuccess", () => {
    expect(
      reducer(
        { isAuthenticated: false, sessionHydrated: false },
        loginSuccess()
      )
    ).toEqual({
      isAuthenticated: true,
      sessionHydrated: true,
    });
  });

  it("handles logout", () => {
    expect(
      reducer({ isAuthenticated: true, sessionHydrated: false }, logout())
    ).toEqual({
      isAuthenticated: false,
      sessionHydrated: true,
    });
  });

  it("handles restoreSession", () => {
    expect(
      reducer(
        { isAuthenticated: false, sessionHydrated: false },
        restoreSession(true)
      )
    ).toEqual({
      isAuthenticated: true,
      sessionHydrated: true,
    });
  });
});
