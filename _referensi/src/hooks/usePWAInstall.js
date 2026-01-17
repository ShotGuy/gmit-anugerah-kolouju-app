import { useEffect, useState } from "react";

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iOS = /ipad|iphone|ipod/.test(userAgent) && !window.MSStream;
    const android = /android/.test(userAgent);

    setIsIOS(iOS);
    setIsAndroid(android);

    // Check if already installed
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    setIsInstalled(isStandalone);

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Handle app installed event
    const handleAppInstalled = (e) => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // For iOS, we can show install instructions if not in standalone mode
    if (iOS && !isStandalone) {
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt || !isAndroid) return false;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setIsInstalled(true);
        setDeferredPrompt(null);
        setIsInstallable(false);

        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  const canInstall = isInstallable && !isInstalled && (isAndroid || isIOS);

  return {
    installPWA,
    canInstall,
    isInstalled,
    isInstallable,
    isIOS,
    isAndroid,
    deferredPrompt,
  };
}
