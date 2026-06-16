import { Platform } from "react-native";

const rawApiBaseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "").trim();
const rawWsBaseUrl = (process.env.EXPO_PUBLIC_WS_BASE_URL ?? "").trim();

/** Same path as `metro.config.js` — browser calls same-origin; Metro forwards to the real API (avoids CORS in dev). */
export const DEV_WEB_API_PROXY_PREFIX = "/__vajra_api";

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

function validateBaseUrl(
  value: string,
  expectedProtocols: string[],
  variableName: string,
  required: boolean,
) {
  if (!value) {
    if (required) {
      throw new Error(`Missing required env var: ${variableName}`);
    }
    return "";
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(
      `${variableName} must be a valid URL (received: "${value}").`,
    );
  }

  if (!expectedProtocols.includes(parsed.protocol)) {
    throw new Error(
      `${variableName} must use one of: ${expectedProtocols.join(", ")}.`,
    );
  }

  return normalizeBaseUrl(value);
}

const isTestEnv = process.env.NODE_ENV === "test";
const isProdLikeBuild = !__DEV__ && !isTestEnv;
const allowedApiProtocols = isProdLikeBuild
  ? ["https:"]
  : ["https:", "http:"];
const allowedWsProtocols = isProdLikeBuild ? ["wss:"] : ["wss:", "ws:"];

const envBackedApi = validateBaseUrl(
  rawApiBaseUrl,
  allowedApiProtocols,
  "EXPO_PUBLIC_API_BASE_URL",
  isProdLikeBuild,
);

const useDevWebApiProxy =
  typeof __DEV__ !== "undefined" &&
  __DEV__ &&
  !isTestEnv &&
  Platform.OS === "web" &&
  process.env.EXPO_PUBLIC_USE_METRO_API_PROXY === "true" &&
  Boolean(envBackedApi);

function resolveApiBaseUrl(): string {
  if (!useDevWebApiProxy) {
    return envBackedApi;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${DEV_WEB_API_PROXY_PREFIX}`;
  }
  return envBackedApi;
}

export const API_BASE_URL = resolveApiBaseUrl();

export const WS_BASE_URL = validateBaseUrl(
  rawWsBaseUrl,
  allowedWsProtocols,
  "EXPO_PUBLIC_WS_BASE_URL",
  false,
);
