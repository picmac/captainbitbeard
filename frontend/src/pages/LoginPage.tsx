import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }

    try {
      setIsLoading(true);
      await login(username, password);
      // Redirect to home page on success
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h2 className="text-pixel mb-8 text-center text-2xl text-pirate-gold">
          LOGIN
        </h2>

        {error && (
          <div className="mb-4 border-4 border-blood-red bg-blood-red/20 p-3 text-center text-skull-white">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="text-pixel mb-2 block text-xs text-skull-white">
              USERNAME
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              className="w-full border-4 border-wood-brown bg-sand-beige p-3 text-ocean-dark disabled:opacity-50"
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-pixel mb-2 block text-xs text-skull-white">
              PASSWORD
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full border-4 border-wood-brown bg-sand-beige p-3 text-ocean-dark disabled:opacity-50"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-retro w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>

        <p className="text-pixel mt-6 text-center text-xs text-skull-white/60">
          Default: admin / admin
        </p>
      </div>
    </div>
  );
}
