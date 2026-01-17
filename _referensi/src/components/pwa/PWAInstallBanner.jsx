import { Download, Smartphone, X } from "lucide-react";
import { useEffect, useState } from "react";

import { usePWAInstall } from "@/hooks/usePWAInstall";

export default function PWAInstallBanner() {
  const { canInstall, installPWA, isIOS, isAndroid } = usePWAInstall();
  const [showBanner, setShowBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    // Check if banner was previously dismissed
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    const dismissTime = localStorage.getItem('pwa-banner-dismiss-time');

    // Show banner again after 3 days
    const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
    const shouldShow = !dismissed || (dismissTime && parseInt(dismissTime) < threeDaysAgo);

    if (canInstall && shouldShow && !bannerDismissed) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 5000); // Show after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [canInstall, bannerDismissed]);

  const handleInstall = async () => {
    if (isAndroid) {
      const success = await installPWA();
      if (success) {
        setShowBanner(false);
      }
    }
    // For iOS, the InstallPrompt component will show detailed instructions
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setBannerDismissed(true);
    localStorage.setItem('pwa-banner-dismissed', 'true');
    localStorage.setItem('pwa-banner-dismiss-time', Date.now().toString());
  };

  if (!showBanner || !canInstall) {
    return null;
  }

  return (
    <div className="fixed top-16 left-4 right-4 z-40 md:left-auto md:right-4 md:w-80">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-4 animate-slide-down">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">
                Install GMIT JBOB
              </p>
              <p className="text-xs text-blue-100 mt-1">
                {isIOS
                  ? "Tambahkan ke layar utama untuk akses cepat"
                  : "Install aplikasi untuk pengalaman terbaik"}
              </p>
            </div>
          </div>
          <button
            aria-label="Tutup"
            className="text-blue-200 hover:text-white p-1 ml-2 flex-shrink-0"
            onClick={handleDismiss}
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex space-x-2 mt-3">
          <button
            className="bg-white text-blue-600 px-3 py-2 rounded-md text-xs font-medium hover:bg-blue-50 transition-colors flex items-center space-x-1 flex-1"
            onClick={handleInstall}
          >
            <Download size={14} />
            <span>{isIOS ? "Lihat Cara" : "Install"}</span>
          </button>
          <button
            className="bg-blue-500 bg-opacity-50 text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-opacity-70 transition-colors"
            onClick={handleDismiss}
          >
            Nanti
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}