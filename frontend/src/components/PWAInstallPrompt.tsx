import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after 30 seconds (not immediately)
      setTimeout(() => {
        const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-seen');
        const hasDismissed = localStorage.getItem('pwa-install-prompt-dismissed');

        if (!hasSeenPrompt && !hasDismissed) {
          setShowPrompt(true);
          localStorage.setItem('pwa-install-prompt-seen', 'true');
        }
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('PWA installed');
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Install error:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-prompt-dismissed', 'true');
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Clear the dismissed flag so it can show again later
    localStorage.removeItem('pwa-install-prompt-dismissed');
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[100] bg-black/80 animate-fade-in" />

      {/* Prompt Card */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto max-w-md w-full bg-ocean-dark border-4 border-pirate-gold shadow-2xl animate-bounce-in">
          {/* Pirate Flag Header */}
          <div className="bg-pirate-gold p-4 text-center border-b-4 border-wood-brown">
            <div className="text-4xl mb-2 animate-wave">🏴‍☠️</div>
            <h2 className="text-pixel text-lg text-ocean-dark font-bold">
              AHOY, MATEY!
            </h2>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="text-pixel text-sm text-skull-white text-center">
              <p className="mb-3">
                Install Captain Bitbeard on yer device fer the ultimate gaming experience!
              </p>

              <div className="bg-night-sky border-2 border-ocean-blue p-3 mb-4 text-left text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <span>⚓</span>
                  <span>Play offline - no internet required!</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>🎮</span>
                  <span>Faster loading with cached emulator cores</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>📱</span>
                  <span>Add to home screen like a native app</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>💾</span>
                  <span>Your saves sync automatically</span>
                </div>
              </div>

              <p className="text-xs opacity-75 mb-4">
                Install now and set sail fer adventure!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="btn-retro w-full bg-treasure-green hover:bg-treasure-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isInstalling ? '⚓ INSTALLING...' : '⚓ INSTALL APP'}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleRemindLater}
                  className="btn-retro text-xs bg-ocean hover:bg-ocean-blue"
                >
                  REMIND LATER
                </button>
                <button
                  onClick={handleDismiss}
                  className="btn-retro text-xs bg-wood-brown hover:bg-wood-brown/90"
                >
                  NO THANKS
                </button>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-xxs text-sand-beige opacity-50">
              Ye can always install later from yer browser menu
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes wave {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(15deg);
          }
          75% {
            transform: rotate(-15deg);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-wave {
          animation: wave 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
