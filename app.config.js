require("dotenv").config();
const { expo } = require("./app.json");

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

if (!googleMapsApiKey) {
  throw new Error("Missing GOOGLE MAPS API KEY");
}

module.exports = {
  ...expo,

  plugins: [...(expo.plugins ?? []), "expo-font"],

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
      googleMaps: {
        apiKey: googleMapsApiKey,
      },
    },
  },

  ios: {
    ...expo.ios,
    config: {
      googleMapsApiKey,
    },
  },
};
