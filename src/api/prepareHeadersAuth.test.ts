jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
}));

import * as SecureStore from "expo-secure-store";

import { prepareHeadersWithAuth } from "./prepareHeadersAuth";

const mockedGetItemAsync = jest.mocked(SecureStore.getItemAsync);

describe("prepareHeadersWithAuth", () => {
  beforeEach(() => {
    mockedGetItemAsync.mockReset();
  });

  it("adds the Authorization header when a token exists", async () => {
    mockedGetItemAsync.mockResolvedValue("token-123");

    const headers = await prepareHeadersWithAuth(new Headers());

    expect(mockedGetItemAsync).toHaveBeenCalledWith("auth_access_token");
    expect(headers.get("Authorization")).toBe("Bearer token-123");
  });

  it("does not add the Authorization header when the token is blank", async () => {
    mockedGetItemAsync.mockResolvedValue("   ");

    const headers = await prepareHeadersWithAuth(new Headers());

    expect(headers.has("Authorization")).toBe(false);
  });

  it("returns headers unchanged when token lookup fails", async () => {
    mockedGetItemAsync.mockRejectedValue(new Error("read failed"));
    const headers = new Headers();
    headers.set("X-Test", "1");

    const result = await prepareHeadersWithAuth(headers);

    expect(result.get("X-Test")).toBe("1");
    expect(result.has("Authorization")).toBe(false);
  });
});
