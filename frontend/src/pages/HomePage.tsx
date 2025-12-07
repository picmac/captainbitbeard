import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-pixel mb-8 text-4xl text-pirate-gold">
          🏴‍☠️ CAPTAIN BITBEARD
        </h1>
        <p className="text-pixel mb-12 text-sm text-skull-white">
          Ahoy! Welcome Aboard
        </p>

        <div className="flex flex-col gap-4">
          <Link to="/library" className="btn-retro">
            START GAMING
          </Link>
          <Link to="/login" className="btn-retro">
            LOGIN
          </Link>
        </div>

        <div className="mt-16 text-center">
          <p className="text-pixel text-xs text-sand-beige">
            Press Start to Continue...
          </p>
        </div>
      </div>
    </div>
  );
}
