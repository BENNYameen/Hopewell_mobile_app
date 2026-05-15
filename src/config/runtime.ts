const rawApiBaseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "").trim();
const rawWsBaseUrl = (process.env.EXPO_PUBLIC_WS_BASE_URL ?? "").trim();

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

export const API_BASE_URL = validateBaseUrl(
  rawApiBaseUrl,
  allowedApiProtocols,
  "EXPO_PUBLIC_API_BASE_URL",
  isProdLikeBuild,
);

export const WS_BASE_URL = validateBaseUrl(
  rawWsBaseUrl,
  allowedWsProtocols,
  "EXPO_PUBLIC_WS_BASE_URL",
  false,
);
