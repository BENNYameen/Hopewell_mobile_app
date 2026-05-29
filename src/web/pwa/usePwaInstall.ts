import { useCallback, useEffect, useMemo, useState } from "react";

import {
  isIosSafari,
  isSecureInstallContext,
  isStandaloneDisplayMode,
  isWebPlatform,
} from "./detect";
import type { BeforeInstallPromptEvent } from "./types";

type InstallOutcome = "accepted" | "dismissed" | "unavailable" | "error";

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<InstallOutcome | null>(null);

  useEffect(() => {
    if (!isWebPlatform()) return;

    setInstalled(isStandaloneDisplayMode());

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setLastOutcome("accepted");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const isStandalone = useMemo(() => isStandaloneDisplayMode(), []);
  const onIosSafari = useMemo(() => isIosSafari(), []);
  const secureContext = useMemo(() => isSecureInstallContext(), []);

  const canPromptInstall = Boolean(!installed && deferredPrompt && secureContext);
  const shouldShowIosInstructions = Boolean(!installed && !isStandalone && onIosSafari);

  const promptInstall = useCallback(async () => {
    if (!isWebPlatform()) {
      setLastOutcome("unavailable");
      return "unavailable" as const;
    }

    const browserInstall = (window.navigator as Navigator & { install?: () => Promise<void> }).install;

    if (typeof browserInstall === "function") {
      try {
        await browserInstall();
        setLastOutcome("accepted");
        return "accepted" as const;
      } catch {
        setLastOutcome("dismissed");
        return "dismissed" as const;
      }
    }

    if (!deferredPrompt) {
      setLastOutcome("unavailable");
      return "unavailable" as const;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      const outcome = choice.outcome === "accepted" ? "accepted" : "dismissed";
      setLastOutcome(outcome);
      if (outcome === "accepted") {
        setInstalled(true);
      }
      setDeferredPrompt(null);
      return outcome;
    } catch {
      setLastOutcome("error");
      return "error" as const;
    }
  }, [deferredPrompt]);

  return {
    installed,
    isStandalone,
    canPromptInstall,
    shouldShowIosInstructions,
    secureContext,
    lastOutcome,
    promptInstall,
  };
}
