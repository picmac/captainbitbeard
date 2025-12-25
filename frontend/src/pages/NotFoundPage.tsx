import { useNavigate } from 'react-router-dom';
import { PageTitle } from '../components/PageTitle';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ocean-dark flex items-center justify-center p-4">
      <PageTitle title="404 - Page Not Found" />

      <div className="max-w-2xl w-full text-center">
        {/* Pirate ASCII Art */}
        <pre className="text-gold text-xs sm:text-sm mb-8 overflow-x-auto">
{`
    ____
   /    \\
  | O  O |
  |  /\\  |
   \\ -- /
    |  |
   /|  |\\
  / |  | \\
`}
        </pre>

        {/* Error Message */}
        <h1 className="text-4xl sm:text-6xl text-gold font-bold mb-4">
          404
        </h1>

        <h2 className="text-2xl sm:text-3xl text-skull-white mb-6">
          Shiver Me Timbers!
        </h2>

        <p className="text-lg text-skull-white mb-8">
          The treasure ye seek has been lost to Davy Jones' Locker.
          <br />
          This page doesn't exist or has walked the plank!
        </p>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="btn-retro"
          >
            ⚓ Back to Port
          </button>

          <button
            onClick={() => navigate(-1)}
            className="btn-retro bg-ocean hover:bg-ocean-blue"
          >
            ↩ Previous Page
          </button>
        </div>

        {/* Footer Message */}
        <p className="text-sm text-sand-beige mt-12 opacity-75">
          Error Code: 404 - Page Not Found
        </p>
      </div>
    </div>
  );
}
