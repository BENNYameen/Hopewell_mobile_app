import * as storage from "@/auth/secureStorage";

export type ThemePreference = "light" | "dark" | "system";

const APPEARANCE_KEY = "appearance_preference";

export async function loadAppearancePreference(): Promise<ThemePreference> {
  const stored = await storage.getItemAsync(APPEARANCE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

export async function saveAppearancePreference(preference: ThemePreference): Promise<void> {
  await storage.setItemAsync(APPEARANCE_KEY, preference);
}
