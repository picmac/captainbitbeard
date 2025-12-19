import { useState, useEffect } from 'react';

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    keys: string;
    description: string;
  }>;
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: '🧭 NAVIGATION',
    shortcuts: [
      { keys: 'Shift + G', description: 'Go to Library' },
      { keys: 'Shift + C', description: 'Go to Collections' },
      { keys: 'Shift + S', description: 'Go to Save States' },
      { keys: 'Shift + P', description: 'Go to Profile' },
      { keys: 'Shift + A', description: 'Go to Admin Panel' },
    ],
  },
  {
    title: '⚡ QUICK ACTIONS',
    shortcuts: [
      { keys: '/', description: 'Focus Search Bar' },
      { keys: 'Escape', description: 'Close Modal / Unfocus' },
      { keys: 'Shift + ?', description: 'Show Keyboard Shortcuts' },
    ],
  },
  {
    title: '🎮 GAME LIBRARY',
    shortcuts: [
      { keys: 'Arrow Keys', description: 'Navigate Games (when enabled)' },
      { keys: 'Enter', description: 'Open Selected Game' },
      { keys: 'Space', description: 'Play Selected Game' },
    ],
  },
];

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 btn-retro text-xs px-3 py-2 bg-wood-brown hover:bg-pirate-gold z-50"
        title="Keyboard Shortcuts (Shift+?)"
      >
        ⌨️
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ocean-dark/80 z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="border-8 border-wood-brown bg-sand-beige max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-wood-brown p-4 flex justify-between items-center sticky top-0 z-10">
            <h2 className="text-pixel text-lg text-skull-white">
              ⌨️ KEYBOARD SHORTCUTS
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="btn-retro text-xs px-3 py-1 bg-blood-red"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {shortcutGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h3 className="text-pixel text-sm text-ocean-dark mb-3 font-bold">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, shortcutIndex) => (
                    <div
                      key={shortcutIndex}
                      className="flex items-center justify-between border-2 border-wood-brown bg-skull-white/50 p-2"
                    >
                      <span className="text-pixel text-xs text-ocean-dark">
                        {shortcut.description}
                      </span>
                      <kbd className="text-pixel text-xs px-2 py-1 bg-wood-brown text-skull-white border-2 border-ocean-dark">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Tip */}
            <div className="border-4 border-treasure-green bg-treasure-green/20 p-4 mt-6">
              <p className="text-pixel text-xs text-ocean-dark">
                💡 <strong>Tip:</strong> Press <kbd className="px-1 bg-wood-brown text-skull-white">Shift + ?</kbd> anytime to toggle this help menu!
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
