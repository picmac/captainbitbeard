import { useState, useEffect } from 'react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);
  const [justCameOnline, setJustCameOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustCameOnline(true);
      setShowBanner(true);

      // Hide the "back online" message after 5 seconds
      setTimeout(() => {
        setShowBanner(false);
        setJustCameOnline(false);
      }, 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
      setJustCameOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show banner initially if offline
    if (!navigator.onLine) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-slide-down ${
        isOnline ? 'w-auto' : 'max-w-md w-full mx-4'
      }`}
    >
      {isOnline && justCameOnline ? (
        // Back Online Banner
        <div className="bg-treasure-green border-4 border-skull-white shadow-lg px-6 py-3 flex items-center gap-3">
          <span className="text-2xl">⚓</span>
          <div className="text-pixel text-xs text-ocean-dark">
            <div className="font-bold">BACK ONLINE!</div>
            <div className="text-xxs">Ye've returned to the network, matey!</div>
          </div>
        </div>
      ) : (
        // Offline Banner
        <div className="bg-blood-red border-4 border-skull-white shadow-lg p-4">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-3xl">📡</span>
            <div className="flex-1 text-pixel text-xs text-skull-white">
              <div className="font-bold mb-1">OFFLINE MODE</div>
              <div className="text-xxs opacity-90">
                No internet connection detected. Don't worry, ye can still:
              </div>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-skull-white hover:text-pirate-gold text-lg leading-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="bg-night-sky border-2 border-ocean-dark p-2 text-pixel text-xxs text-skull-white space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-treasure-green">✓</span>
              <span>Play cached ROMs offline</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-treasure-green">✓</span>
              <span>View saved game states</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-treasure-green">✓</span>
              <span>Browse your library</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blood-red">✗</span>
              <span>Upload new ROMs (requires connection)</span>
            </div>
          </div>

          <div className="mt-3 text-center text-pixel text-xxs text-sand-beige opacity-75">
            Changes will sync when ye reconnect
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-down {
          from {
            transform: translate(-50%, -120%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }

        .animate-slide-down {
          animation: slide-down 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
