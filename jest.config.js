module.exports = {
  preset: "react-native",
  testEnvironment: "node",
  moduleDirectories: ["node_modules", "<rootDir>"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testPathIgnorePatterns: ["/node_modules/"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.+|@expo/.+|expo-router|@expo/vector-icons|react-native-reanimated|@react-navigation/.+))",
  ],
};
