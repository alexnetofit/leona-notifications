'use client';

import { useState, useEffect, ReactNode } from 'react';
import Image from 'next/image';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface RequirePWAProps {
  children: ReactNode;
}

export default function RequirePWA({ children }: RequirePWAProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if mobile
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(mobile);

    // Check if standalone (PWA)
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(ios);

    // Listen for install prompt (Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    setIsLoading(false);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    setDeferredPrompt(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cosmic flex items-center justify-center">
        <div className="w-16 h-16 relative animate-pulse">
          <Image
            src="/image/logo_login.png"
            alt="Leona"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    );
  }

  // Desktop or PWA - render normally
  if (!isMobile || isStandalone) {
    return <>{children}</>;
  }

  // Mobile browser (not PWA) - show install screen
  return (
    <div className="min-h-screen bg-cosmic flex flex-col items-center px-6 relative overflow-hidden">
      {/* Glowing orbs */}
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />

      {/* Spacer to push content up */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Logo */}
        <div className="relative mb-6">
          <div className="w-28 h-28 relative animate-float">
            <div className="absolute inset-0 rounded-full bg-accent/30 blur-2xl" />
            <Image
              src="/image/logo_login.png"
              alt="Leona"
              fill
              className="object-contain relative z-10 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]"
              priority
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-dark-50 text-center mb-2">
          Instale o App
        </h1>
        <p className="text-dark-300 text-center mb-6 max-w-xs">
          Para usar o Leona, adicione à sua tela inicial
        </p>

        {/* Instructions */}
        <div className="w-full max-w-sm">
          {isIOS ? (
            // iOS Instructions
            <div className="card text-center">
              <p className="text-dark-100 text-sm mb-3">
                1. Toque no botão{' '}
                <span className="text-accent-light font-medium">Compartilhar</span>
                {' '}abaixo
              </p>
              <p className="text-dark-100 text-sm">
                2. Selecione{' '}
                <span className="text-accent-light font-medium">&quot;Adicionar à Tela de Início&quot;</span>
              </p>
            </div>
          ) : (
            // Android Instructions
            <div className="space-y-4">
              {deferredPrompt ? (
                <button
                  onClick={handleInstall}
                  className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-lg"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Instalar Leona
                </button>
              ) : (
                <div className="card text-center">
                  <p className="text-dark-100 text-sm mb-3">
                    Toque no menu do navegador
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <svg className="w-6 h-6 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </div>
                  <p className="text-dark-300 text-sm">
                    Selecione <span className="text-accent-light">&quot;Instalar app&quot;</span> ou{' '}
                    <span className="text-accent-light">&quot;Adicionar à tela inicial&quot;</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* iOS: Arrow pointing to share button at bottom */}
      {isIOS && (
        <div className="pb-16 flex flex-col items-center">
          <div className="animate-bounce mb-2">
            <svg className="w-8 h-8 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <div className="flex items-center gap-2 text-accent-light">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="text-sm font-medium">Compartilhar</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="absolute bottom-2 text-dark-500 text-xs">
        © {new Date().getFullYear()} Leona Notifications
      </p>
    </div>
  );
}
