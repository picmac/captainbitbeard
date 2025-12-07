import { useState } from 'react';
import { RomUpload } from '../components/RomUpload';

export function AdminPage() {
  const [uploadKey, setUploadKey] = useState(0);

  const handleUploadComplete = () => {
    // Trigger re-render or refresh game list
    setUploadKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="mb-8 text-center">
        <h1 className="text-pixel mb-2 text-2xl text-pirate-gold">
          🏴‍☠️ ADMIN PANEL
        </h1>
        <p className="text-pixel text-xs text-skull-white">
          Captain's Quarters - ROM Management
        </p>
      </div>

      <RomUpload key={uploadKey} onUploadComplete={handleUploadComplete} />

      <div className="mt-8 text-center">
        <a href="/library" className="btn-retro text-xs">
          ← BACK TO LIBRARY
        </a>
      </div>
    </div>
  );
}
