require("dotenv").config();
const { expo } = require("./app.json");

const existingIosGoogleMapsApiKey =
  expo.ios?.config?.googleMapsApiKey ?? "";
const existingAndroidGoogleMapsApiKey =
  expo.android?.config?.googleMaps?.apiKey ?? "";
const googleMapsApiKey =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  existingIosGoogleMapsApiKey ||
  existingAndroidGoogleMapsApiKey ||
  "";

if (
  !googleMapsApiKey &&
  !globalThis.__hopewellGoogleMapsKeyWarned
) {
  globalThis.__hopewellGoogleMapsKeyWarned = true;
  console.warn(
    "[app.config] EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is not set. Add it to .env for maps; the app will still start for local dev."
  );
}

module.exports = {
  ...expo,

  plugins: [
    ...(expo.plugins ?? []),
    "expo-font",
    ["react-native-maps", { googleMapsApiKey }],
  ],

  extra: {
    ...expo.extra,
    googleMapsApiKey,
    eas: {
      projectId: "aa163001-4254-44b9-b18c-557e3e2e8545",
    },
  },

  android: {
    ...expo.android,
    config: {
      ...expo.android?.config,
      googleMaps: {
        ...expo.android?.config?.googleMaps,
        apiKey: googleMapsApiKey,
      },
    },
  },

  ios: {
    ...expo.ios,
    config: {
      ...expo.ios?.config,
      googleMapsApiKey,
    },
  },
};
