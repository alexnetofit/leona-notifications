'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Check if mobile
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(mobile);

    // Check for iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isIOSDevice);

    // If mobile and not standalone, always show banner
    if (mobile && !standalone) {
      setShowBanner(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (mobile) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed
    const handleAppInstalled = () => {
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
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

  // Don't show if already installed, not mobile, or banner hidden
  if (isStandalone || !showBanner || !isMobile) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 p-4">
      <div className="max-w-lg mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-dark-800/95 to-dark-900/95 backdrop-blur-xl border border-accent/30 shadow-glow-lg">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-accent-bright/5 to-accent/10 pointer-events-none" />
          
          <div className="relative p-4">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-bright flex items-center justify-center shadow-glow">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-dark-50 mb-0.5">
                  Instalar Leona
                </h3>
                {isIOS ? (
                  <p className="text-xs text-dark-300">
                    Toque em{' '}
                    <span className="inline-flex items-center gap-1 text-accent-light">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Compartilhar
                    </span>{' '}
                    e depois em <span className="text-accent-light">&quot;Adicionar à Tela de Início&quot;</span>
                  </p>
                ) : (
                  <p className="text-xs text-dark-300">
                    Adicione à tela inicial para notificações
                  </p>
                )}
              </div>

              {/* Install button (not shown for iOS) */}
              {!isIOS && deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="flex-shrink-0 btn-primary py-2 px-4 text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Instalar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
