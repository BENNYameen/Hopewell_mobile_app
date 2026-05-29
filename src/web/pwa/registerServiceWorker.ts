import { isSecureInstallContext, isWebPlatform } from "./detect";

const SW_URL = "/sw.js";

export function registerPwaServiceWorker() {
  if (!isWebPlatform()) return;
  if (typeof __DEV__ !== "undefined" && __DEV__) return;
  if (!("serviceWorker" in navigator)) return;
  if (!isSecureInstallContext()) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(SW_URL)
      .then((registration) => {
        registration.update().catch(() => undefined);
      })
      .catch(() => undefined);
  });
}
