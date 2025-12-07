import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { GameLibraryPage } from './pages/GameLibraryPage';
import { GamePlayerPage } from './pages/GamePlayerPage';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';

function App() {
  return (
    <div className="min-h-screen bg-ocean-dark">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/library" element={<GameLibraryPage />} />
        <Route path="/play/:gameId" element={<GamePlayerPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  );
}

export default App;
