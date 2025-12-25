import { useState } from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type HelpSection =
  | 'getting-started'
  | 'playing-games'
  | 'collections'
  | 'save-states'
  | 'shortcuts'
  | 'admin'
  | 'troubleshooting';

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [activeSection, setActiveSection] = useState<HelpSection>('getting-started');

  if (!isOpen) return null;

  const sections = [
    { id: 'getting-started', label: '🎯 Getting Started', icon: '🎯' },
    { id: 'playing-games', label: '🎮 Playing Games', icon: '🎮' },
    { id: 'collections', label: '📚 Collections', icon: '📚' },
    { id: 'save-states', label: '💾 Save States', icon: '💾' },
    { id: 'shortcuts', label: '⌨️ Keyboard Shortcuts', icon: '⌨️' },
    { id: 'admin', label: '⚙️ Admin Features', icon: '⚙️' },
    { id: 'troubleshooting', label: '🔧 Troubleshooting', icon: '🔧' },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="border-4 border-wood-brown bg-sand-beige w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b-4 border-wood-brown bg-pirate-gold p-4 flex items-center justify-between">
          <h2 className="text-pixel text-lg text-ocean-dark">📖 HELP & DOCUMENTATION</h2>
          <button
            onClick={onClose}
            className="btn-retro bg-blood-red text-xs px-3 py-2"
            aria-label="Close help"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r-4 border-wood-brown bg-ocean-dark/10 p-4 overflow-y-auto">
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as HelpSection)}
                  className={`
                    w-full text-left text-pixel text-xs p-3 border-2 transition-colors
                    ${activeSection === section.id
                      ? 'border-pirate-gold bg-pirate-gold text-ocean-dark'
                      : 'border-wood-brown bg-white text-wood-brown hover:bg-pirate-gold/20'
                    }
                  `}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            <HelpContent section={activeSection} />
          </div>
        </div>
      </div>
    </div>
  );
}

function HelpContent({ section }: { section: HelpSection }) {
  const content = {
    'getting-started': (
      <div className="space-y-6">
        <h3 className="text-pixel text-xl text-pirate-gold mb-4">🎯 Getting Started</h3>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">Welcome to Captain Bitbeard!</h4>
          <p className="text-pixel text-xs text-wood-brown leading-relaxed mb-3">
            Captain Bitbeard is your personal retro gaming platform. Play classic games from Nintendo, Sega,
            PlayStation, and more - all in your browser!
          </p>
        </section>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">Your First Steps</h4>
          <ol className="text-pixel text-xs text-wood-brown space-y-2 list-decimal list-inside">
            <li>Browse your game library on the main page</li>
            <li>Click any game to see details and screenshots</li>
            <li>Click the PLAY button to start gaming</li>
            <li>Use collections to organize your games</li>
            <li>Save your progress with save states</li>
          </ol>
        </section>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">Quick Tips</h4>
          <ul className="text-pixel text-xs text-wood-brown space-y-2">
            <li>🔍 Press <kbd className="bg-pirate-gold px-1">/</kbd> to quickly search</li>
            <li>⌨️ Press <kbd className="bg-pirate-gold px-1">Shift+?</kbd> to see all keyboard shortcuts</li>
            <li>💡 Hover over buttons to see tooltips</li>
            <li>🎓 Restart the tour anytime from your profile</li>
          </ul>
        </section>
      </div>
    ),

    'playing-games': (
      <div className="space-y-6">
        <h3 className="text-pixel text-xl text-pirate-gold mb-4">🎮 Playing Games</h3>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">Starting a Game</h4>
          <ol className="text-pixel text-xs text-wood-brown space-y-2 list-decimal list-inside">
            <li>Click on any game card in your library</li>
            <li>Review the game details and screenshots</li>
            <li>Click the <strong>PLAY</strong> button</li>
            <li>Wait for the emulator to load (usually 5-15 seconds)</li>
            <li>Use your keyboard to control the game</li>
          </ol>
        </section>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">In-Game Controls</h4>
          <div className="border-2 border-wood-brown bg-white p-3 space-y-2 text-pixel text-xs text-wood-brown">
            <div><kbd className="bg-pirate-gold px-1">Arrow Keys</kbd> - D-Pad (directional movement)</div>
            <div><kbd className="bg-pirate-gold px-1">Z / X / A / S</kbd> - Action buttons</div>
            <div><kbd className="bg-pirate-gold px-1">Enter</kbd> - Start</div>
            <div><kbd className="bg-pirate-gold px-1">Shift</kbd> - Select</div>
            <div><kbd className="bg-pirate-gold px-1">Ctrl+S</kbd> - Quick Save</div>
            <div><kbd className="bg-pirate-gold px-1">Ctrl+L</kbd> - Quick Load</div>
            <div><kbd className="bg-pirate-gold px-1">Ctrl+F</kbd> - Fullscreen</div>
            <div><kbd className="bg-pirate-gold px-1">Ctrl+P</kbd> - Screenshot</div>
          </div>
        </section>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">Performance Tips</h4>
          <ul className="text-pixel text-xs text-wood-brown space-y-1">
            <li>• Close other browser tabs for better performance</li>
            <li>• Use fullscreen mode for the best experience</li>
            <li>• Some games require BIOS files (admins can upload these)</li>
          </ul>
        </section>
      </div>
    ),

    'collections': (
      <div className="space-y-6">
        <h3 className="text-pixel text-xl text-pirate-gold mb-4">📚 Collections</h3>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">What are Collections?</h4>
          <p className="text-pixel text-xs text-wood-brown leading-relaxed mb-3">
            Collections are custom groups of games you create. Think of them as playlists for your games!
            Organize by genre, console, mood, or any way you like.
          </p>
        </section>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">Creating a Collection</h4>
          <ol className="text-pixel text-xs text-wood-brown space-y-2 list-decimal list-inside">
            <li>Navigate to Collections (press <kbd className="bg-pirate-gold px-1">Shift+C</kbd>)</li>
            <li>Click "CREATE NEW COLLECTION"</li>
            <li>Enter a name and optional description</li>
            <li>Click "CREATE"</li>
          </ol>
        </section>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">Adding Games to Collections</h4>
          <ul className="text-pixel text-xs text-wood-brown space-y-2">
            <li>• From game details page: Click "ADD TO COLLECTION"</li>
            <li>• Select the collection from the list</li>
            <li>• Games can be in multiple collections</li>
          </ul>
        </section>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">Collection Ideas</h4>
          <ul className="text-pixel text-xs text-wood-brown space-y-1">
            <li>💖 Favorites - Your all-time best games</li>
            <li>🎯 To Play - Games you want to try</li>
            <li>👶 Childhood Classics - Nostalgic favorites</li>
            <li>🏆 Completed - Games you've finished</li>
            <li>👥 Multiplayer - Games to play with friends</li>
          </ul>
        </section>
      </div>
    ),

    'save-states': (
      <div className="space-y-6">
        <h3 className="text-pixel text-xl text-pirate-gold mb-4">💾 Save States</h3>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">What are Save States?</h4>
          <p className="text-pixel text-xs text-wood-brown leading-relaxed mb-3">
            Save states are snapshots of your game at any moment. Unlike traditional game saves,
            you can save anywhere, anytime - even in games that don't have save features!
          </p>
        </section>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">Creating a Save State</h4>
          <ol className="text-pixel text-xs text-wood-brown space-y-2 list-decimal list-inside">
            <li>While playing a game, press <kbd className="bg-pirate-gold px-1">Ctrl+S</kbd></li>
            <li>Or click the 💾 SAVE button in the overlay menu</li>
            <li>Select a slot (1-10)</li>
            <li>Add an optional description</li>
            <li>Click "SAVE"</li>
          </ol>
        </section>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">Loading a Save State</h4>
          <ol className="text-pixel text-xs text-wood-brown space-y-2 list-decimal list-inside">
            <li>Press <kbd className="bg-pirate-gold px-1">Ctrl+L</kbd> while playing</li>
            <li>Or click 📂 LOAD in the overlay menu</li>
            <li>Select the save state to load</li>
            <li>Your game will instantly return to that moment</li>
          </ol>
        </section>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">Tips</h4>
          <ul className="text-pixel text-xs text-wood-brown space-y-1">
            <li>• Save states include screenshots so you can see what's in each slot</li>
            <li>• You get 10 slots per game - use them wisely!</li>
            <li>• Name your saves to remember important moments</li>
            <li>• View all saves from Save States page (<kbd className="bg-pirate-gold px-1">Shift+S</kbd>)</li>
          </ul>
        </section>
      </div>
    ),

    'shortcuts': (
      <div className="space-y-6">
        <h3 className="text-pixel text-xl text-pirate-gold mb-4">⌨️ Keyboard Shortcuts</h3>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">Global Navigation</h4>
          <div className="border-2 border-wood-brown bg-white p-3 space-y-1 text-pixel text-xs text-wood-brown">
            <div><kbd className="bg-pirate-gold px-1">Shift+G</kbd> - Go to Library</div>
            <div><kbd className="bg-pirate-gold px-1">Shift+C</kbd> - Go to Collections</div>
            <div><kbd className="bg-pirate-gold px-1">Shift+S</kbd> - Go to Save States</div>
            <div><kbd className="bg-pirate-gold px-1">Shift+P</kbd> - Go to Profile</div>
            <div><kbd className="bg-pirate-gold px-1">Shift+A</kbd> - Go to Admin Panel</div>
          </div>
        </section>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">Library Actions</h4>
          <div className="border-2 border-wood-brown bg-white p-3 space-y-1 text-pixel text-xs text-wood-brown">
            <div><kbd className="bg-pirate-gold px-1">/</kbd> - Focus Search Bar</div>
            <div><kbd className="bg-pirate-gold px-1">Arrow Keys</kbd> - Navigate Game Grid</div>
            <div><kbd className="bg-pirate-gold px-1">Enter</kbd> - Open Selected Game</div>
            <div><kbd className="bg-pirate-gold px-1">Space</kbd> - Play Selected Game</div>
            <div><kbd className="bg-pirate-gold px-1">F</kbd> - Toggle Favorite</div>
            <div><kbd className="bg-pirate-gold px-1">Escape</kbd> - Close Modal / Unfocus</div>
          </div>
        </section>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">In-Game Controls</h4>
          <div className="border-2 border-wood-brown bg-white p-3 space-y-1 text-pixel text-xs text-wood-brown">
            <div><kbd className="bg-pirate-gold px-1">Ctrl+S</kbd> - Quick Save</div>
            <div><kbd className="bg-pirate-gold px-1">Ctrl+L</kbd> - Quick Load</div>
            <div><kbd className="bg-pirate-gold px-1">Ctrl+F</kbd> - Toggle Fullscreen</div>
            <div><kbd className="bg-pirate-gold px-1">Ctrl+P</kbd> - Take Screenshot</div>
          </div>
        </section>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">Help</h4>
          <div className="border-2 border-wood-brown bg-white p-3 text-pixel text-xs text-wood-brown">
            <div><kbd className="bg-pirate-gold px-1">Shift+?</kbd> - Show Keyboard Shortcuts</div>
          </div>
        </section>
      </div>
    ),

    'admin': (
      <div className="space-y-6">
        <h3 className="text-pixel text-xl text-pirate-gold mb-4">⚙️ Admin Features</h3>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">Uploading ROMs</h4>
          <ol className="text-pixel text-xs text-wood-brown space-y-2 list-decimal list-inside">
            <li>Go to Admin Panel (<kbd className="bg-pirate-gold px-1">Shift+A</kbd>)</li>
            <li>Click "ROM UPLOAD" tab</li>
            <li>Choose single or bulk upload</li>
            <li>Select ROM file(s)</li>
            <li>Fill in game details (title, system, etc.)</li>
            <li>Click "UPLOAD"</li>
          </ol>
        </section>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">BIOS Files</h4>
          <p className="text-pixel text-xs text-wood-brown leading-relaxed mb-2">
            Some systems require BIOS files to work properly (PlayStation, Sega CD, etc.)
          </p>
          <ul className="text-pixel text-xs text-wood-brown space-y-1">
            <li>• Go to Admin → BIOS FILES tab</li>
            <li>• Upload the required BIOS for each system</li>
            <li>• The system will tell you which BIOS files are needed</li>
          </ul>
        </section>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">Managing Users</h4>
          <ul className="text-pixel text-xs text-wood-brown space-y-1">
            <li>• View all users in the USERS tab</li>
            <li>• Promote/demote admin privileges</li>
            <li>• Delete inactive users</li>
            <li>• View user statistics</li>
          </ul>
        </section>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">Finding Duplicates</h4>
          <p className="text-pixel text-xs text-wood-brown leading-relaxed">
            The DUPLICATES tab shows games that may have been uploaded multiple times.
            This helps keep your library clean and organized.
          </p>
        </section>
      </div>
    ),

    'troubleshooting': (
      <div className="space-y-6">
        <h3 className="text-pixel text-xl text-pirate-gold mb-4">🔧 Troubleshooting</h3>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">Game Won't Load</h4>
          <ul className="text-pixel text-xs text-wood-brown space-y-2">
            <li><strong>Check BIOS:</strong> Some systems (PS1, Sega CD) need BIOS files</li>
            <li><strong>Browser:</strong> Use Chrome or Firefox for best compatibility</li>
            <li><strong>Internet:</strong> Ensure you have a stable connection</li>
            <li><strong>ROM File:</strong> The file might be corrupted, try re-uploading</li>
          </ul>
        </section>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">Slow Performance</h4>
          <ul className="text-pixel text-xs text-wood-brown space-y-1">
            <li>• Close other browser tabs</li>
            <li>• Disable browser extensions temporarily</li>
            <li>• Clear browser cache</li>
            <li>• Use a more powerful device for demanding games (N64, PS1)</li>
          </ul>
        </section>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">Save States Not Working</h4>
          <ul className="text-pixel text-xs text-wood-brown space-y-1">
            <li>• Make sure you're logged in</li>
            <li>• Check browser storage settings (allow cookies/storage)</li>
            <li>• Try a different browser</li>
          </ul>
        </section>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">Controls Not Responding</h4>
          <ul className="text-pixel text-xs text-wood-brown space-y-1">
            <li>• Click on the game canvas to focus it</li>
            <li>• Make sure no input fields are selected</li>
            <li>• Try refreshing the page</li>
            <li>• Check if external gamepad is connected (may interfere)</li>
          </ul>
        </section>

        <section>
          <h4 className="text-pixel text-sm text-ocean-dark mb-2">Still Having Issues?</h4>
          <p className="text-pixel text-xs text-wood-brown leading-relaxed">
            Contact your system administrator or check the browser console (F12) for error messages.
          </p>
        </section>
      </div>
    ),
  };

  return content[section] || <p>Section not found</p>;
}
