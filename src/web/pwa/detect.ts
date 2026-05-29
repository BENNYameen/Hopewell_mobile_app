export function isWebPlatform() {
  return typeof window !== "undefined";
}

export function isStandaloneDisplayMode() {
  if (!isWebPlatform()) return false;
  const mediaStandalone = window.matchMedia?.("(display-mode: standalone)")?.matches;
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean })
    .standalone;
  return Boolean(mediaStandalone || iosStandalone);
}

export function isIosDevice() {
  if (!isWebPlatform()) return false;
  const ua = window.navigator.userAgent || "";
  return /iPhone|iPad|iPod/i.test(ua);
}

export function isSafariBrowser() {
  if (!isWebPlatform()) return false;
  const ua = window.navigator.userAgent || "";
  const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|SamsungBrowser/i.test(ua);
  return isSafari;
}

export function isIosSafari() {
  return isIosDevice() && isSafariBrowser();
}

export function isSecureInstallContext() {
  if (!isWebPlatform()) return false;
  if (window.location.protocol === "https:") return true;
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
}
