import { Routes, Route } from 'react-router-dom';
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
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from './components/KeyboardShortcutsHelp';

function App() {
  // Enable global keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div className="min-h-screen bg-ocean-dark">
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
      </Routes>

      {/* Global Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp />
    </div>
  );
}

export default App;
