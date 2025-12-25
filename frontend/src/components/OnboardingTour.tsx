import { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

interface OnboardingTourProps {
  run?: boolean;
  onComplete?: () => void;
}

export function OnboardingTour({ run = false, onComplete }: OnboardingTourProps) {
  const [runTour, setRunTour] = useState(run);

  useEffect(() => {
    setRunTour(run);
  }, [run]);

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="text-pixel">
          <h2 className="text-lg text-pirate-gold mb-3">🏴‍☠️ Welcome to Captain Bitbeard!</h2>
          <p className="text-sm text-ocean-dark mb-2">
            Ahoy, matey! Let me show ye around your retro gaming treasure trove.
          </p>
          <p className="text-xs text-wood-brown">
            This quick tour will help you navigate the seven seas of classic gaming.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="search-bar"]',
      content: (
        <div className="text-pixel">
          <h3 className="text-sm text-pirate-gold mb-2">🔍 Search Your Library</h3>
          <p className="text-xs text-ocean-dark mb-2">
            Find games quickly by typing their name. Press <kbd className="bg-pirate-gold px-1 text-[10px]">/</kbd> anytime to focus the search.
          </p>
          <p className="text-[10px] text-wood-brown">
            Pro tip: Use Advanced Search for more filters!
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="game-grid"]',
      content: (
        <div className="text-pixel">
          <h3 className="text-sm text-pirate-gold mb-2">🎮 Your Game Library</h3>
          <p className="text-xs text-ocean-dark mb-2">
            All your retro games in one place. Click a game to see details, or click PLAY to start immediately.
          </p>
          <p className="text-[10px] text-wood-brown">
            Use arrow keys to navigate and Enter to open games!
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '[data-tour="collections-link"]',
      content: (
        <div className="text-pixel">
          <h3 className="text-sm text-pirate-gold mb-2">📚 Collections</h3>
          <p className="text-xs text-ocean-dark mb-2">
            Organize games into custom collections like "Favorites" or "Childhood Classics".
          </p>
          <p className="text-[10px] text-wood-brown">
            Keyboard shortcut: <kbd className="bg-pirate-gold px-1">Shift+C</kbd>
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '[data-tour="save-states-link"]',
      content: (
        <div className="text-pixel">
          <h3 className="text-sm text-pirate-gold mb-2">💾 Save States</h3>
          <p className="text-xs text-ocean-dark mb-2">
            Save your game progress at any moment. Create up to 10 save slots per game!
          </p>
          <p className="text-[10px] text-wood-brown">
            In-game: Press <kbd className="bg-pirate-gold px-1 text-[10px]">Ctrl+S</kbd> to save
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: 'body',
      content: (
        <div className="text-pixel">
          <h2 className="text-lg text-pirate-gold mb-3">⌨️ Keyboard Shortcuts</h2>
          <div className="text-xs text-ocean-dark space-y-1 mb-3">
            <div><kbd className="bg-pirate-gold px-1">Shift+G</kbd> → Library</div>
            <div><kbd className="bg-pirate-gold px-1">Shift+C</kbd> → Collections</div>
            <div><kbd className="bg-pirate-gold px-1">Shift+S</kbd> → Save States</div>
            <div><kbd className="bg-pirate-gold px-1">Shift+P</kbd> → Profile</div>
            <div><kbd className="bg-pirate-gold px-1">/</kbd> → Focus Search</div>
            <div><kbd className="bg-pirate-gold px-1">Shift+?</kbd> → Show all shortcuts</div>
          </div>
          <p className="text-[10px] text-wood-brown">
            Hover over buttons to see their shortcuts!
          </p>
        </div>
      ),
      placement: 'center',
    },
    {
      target: 'body',
      content: (
        <div className="text-pixel">
          <h2 className="text-lg text-treasure-green mb-3">⚓ You're Ready to Sail!</h2>
          <p className="text-sm text-ocean-dark mb-2">
            You now know the basics of Captain Bitbeard. Happy gaming, matey!
          </p>
          <p className="text-xs text-wood-brown">
            Press <kbd className="bg-pirate-gold px-1">Shift+?</kbd> anytime to see all keyboard shortcuts.
          </p>
        </div>
      ),
      placement: 'center',
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
      onComplete?.();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#ffd700', // pirate-gold
          textColor: '#1a2332', // ocean-dark
          backgroundColor: '#f5e6d3', // sand-beige
          arrowColor: '#f5e6d3',
          overlayColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 0,
          border: '4px solid #8b4513', // wood-brown
          fontFamily: '"Press Start 2P", cursive',
          fontSize: 12,
          padding: 20,
        },
        buttonNext: {
          backgroundColor: '#50c878', // treasure-green
          border: '2px solid #1a2332',
          borderRadius: 0,
          color: '#1a2332',
          fontFamily: '"Press Start 2P", cursive',
          fontSize: 10,
          padding: '8px 16px',
        },
        buttonBack: {
          backgroundColor: '#8b4513', // wood-brown
          border: '2px solid #1a2332',
          borderRadius: 0,
          color: '#f5e6d3',
          fontFamily: '"Press Start 2P", cursive',
          fontSize: 10,
          marginRight: 10,
        },
        buttonSkip: {
          backgroundColor: '#dc143c', // blood-red
          border: '2px solid #1a2332',
          borderRadius: 0,
          color: '#f5e6d3',
          fontFamily: '"Press Start 2P", cursive',
          fontSize: 10,
        },
        buttonClose: {
          display: 'none', // Hide close button, use Skip instead
        },
      }}
      locale={{
        back: 'BACK',
        close: 'CLOSE',
        last: 'FINISH',
        next: 'NEXT',
        skip: 'SKIP TOUR',
      }}
    />
  );
}

/**
 * Hook to manage onboarding tour state
 */
export function useOnboarding() {
  const [hasSeenTour, setHasSeenTour] = useState(() => {
    return localStorage.getItem('captain-bitbeard-tour-completed') === 'true';
  });

  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Show tour automatically for first-time users after a short delay
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1000); // 1 second delay to let page load

      return () => clearTimeout(timer);
    }
  }, [hasSeenTour]);

  const completeTour = () => {
    localStorage.setItem('captain-bitbeard-tour-completed', 'true');
    setHasSeenTour(true);
    setShowTour(false);
  };

  const resetTour = () => {
    localStorage.removeItem('captain-bitbeard-tour-completed');
    setHasSeenTour(false);
    setShowTour(true);
  };

  return {
    hasSeenTour,
    showTour,
    setShowTour,
    completeTour,
    resetTour,
  };
}
