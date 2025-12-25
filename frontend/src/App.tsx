import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { HomePage } from './pages/HomePage';
import { GameLibraryPage } from './pages/GameLibraryPage';
import { GameDetailsPage } from './pages/GameDetailsPage';
import { GamePlayerPage } from './pages/GamePlayerPage';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { CollectionDetailPage } from './pages/CollectionDetailPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { SharedCollectionPage } from './pages/SharedCollectionPage';
import { SaveStatesPage } from './pages/SaveStatesPage';
import NotFoundPage from './pages/NotFoundPage';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from './components/KeyboardShortcutsHelp';
import { SkipToContent } from './components/SkipToContent';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';

function App() {
  // Enable global keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div className="min-h-screen bg-ocean-dark">
      {/* Skip to main content link for accessibility */}
      <SkipToContent />

      <main id="main-content">
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/library" element={<GameLibraryPage />} />
        <Route path="/game/:gameId" element={<GameDetailsPage />} />
        <Route path="/play/:gameId" element={<GamePlayerPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/collections/:collectionId" element={<CollectionDetailPage />} />
        <Route path="/shared/:shareLink" element={<SharedCollectionPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/profile/:userId" element={<UserProfilePage />} />
        <Route path="/save-states" element={<SaveStatesPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Global Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#e8d5b7',
            color: '#0f4c81',
            border: '2px solid #8b4513',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            imageRendering: 'pixelated',
          },
          className: 'text-pixel',
        }}
        richColors
      />
      </main>
    </div>
  );
}

export default App;
