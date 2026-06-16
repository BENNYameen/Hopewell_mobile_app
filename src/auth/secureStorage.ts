/**
 * Token/session persistence: expo-secure-store on native; localStorage on web
 * (SecureStore has no native implementation on web, which breaks setItemAsync).
 */
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const WEB_KEY_PREFIX = "@vajra_secure:";

const isWeb = Platform.OS === "web";

export async function setItemAsync(key: string, value: string): Promise<void> {
  if (isWeb) {
    if (typeof localStorage === "undefined") {
      throw new Error("localStorage is not available on this platform.");
    }
    localStorage.setItem(WEB_KEY_PREFIX + key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function getItemAsync(key: string): Promise<string | null> {
  if (isWeb) {
    if (typeof localStorage === "undefined") {
      return null;
    }
    try {
      return localStorage.getItem(WEB_KEY_PREFIX + key);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

export async function deleteItemAsync(key: string): Promise<void> {
  if (isWeb) {
    if (typeof localStorage === "undefined") {
      return;
    }
    try {
      localStorage.removeItem(WEB_KEY_PREFIX + key);
    } catch {
      /* ignore */
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
