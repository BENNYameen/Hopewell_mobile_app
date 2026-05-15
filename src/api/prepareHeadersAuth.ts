import { ACCESS_TOKEN_KEY } from "@/auth/session";
import { getItemAsync } from "@/auth/secureStorage";

export async function prepareHeadersWithAuth(headers: Headers) {
  try {
    const accessToken = await getItemAsync(ACCESS_TOKEN_KEY);

    if (accessToken && accessToken.trim().length > 0) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  } catch {
    // Ignore token read failures and continue without auth header.
  }

  return headers;
}
