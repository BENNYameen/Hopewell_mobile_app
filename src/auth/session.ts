import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "@/config/runtime";

export const ACCESS_TOKEN_KEY = "auth_access_token";
export const REFRESH_TOKEN_KEY = "auth_refresh_token";
export const USER_NAME_KEY = "user_name";
export const USER_PHONE_KEY = "user_phone";
export const PENDING_NAME_KEY = "pending_name";

export async function getStoredAuthTokens() {
  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  ]);

  return {
    accessToken: accessToken?.trim() ?? "",
    refreshToken: refreshToken?.trim() ?? "",
  };
}

export async function clearStoredSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_NAME_KEY),
    SecureStore.deleteItemAsync(USER_PHONE_KEY),
    SecureStore.deleteItemAsync(PENDING_NAME_KEY),
  ]);
}

export async function validateStoredSession() {
  const { accessToken, refreshToken } = await getStoredAuthTokens();

  if (!accessToken || !refreshToken || !API_BASE_URL) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}
