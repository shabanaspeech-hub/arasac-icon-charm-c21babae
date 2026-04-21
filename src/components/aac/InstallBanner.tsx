import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem('pwa-banner-dismissed');
    if (dismissedAt && Date.now() - Number(dismissedAt) < 86400000) return;

    // Detect iOS
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isiOS);

    if (isiOS) {
      setShowBanner(true);
      return;
    }

    // Android / Desktop
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', String(Date.now()));
  };

  if (!showBanner || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-primary text-primary-foreground shadow-2xl animate-pop-in safe-area-bottom">
      <div className="max-w-xl mx-auto flex items-center gap-3">
        <Download size={24} className="shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">Install Spectra Speech</p>
          {isIOS ? (
            <p className="text-xs opacity-90 flex items-center gap-1">
              Tap <Share size={14} className="inline" /> then "Add to Home Screen"
            </p>
          ) : (
            <p className="text-xs opacity-90">Install for faster access & offline use</p>
          )}
        </div>
        {!isIOS && (
          <button
            onClick={handleInstall}
            className="px-4 py-2 bg-primary-foreground text-primary rounded-lg font-bold text-sm shrink-0"
          >
            Install
          </button>
        )}
        <button onClick={handleDismiss} className="p-1 opacity-70 hover:opacity-100 shrink-0">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
