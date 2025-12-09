import { useState } from 'react';
import { RomUpload } from '../components/RomUpload';
import { BulkRomUpload } from '../components/BulkRomUpload';

export function AdminPage() {
  const [uploadKey, setUploadKey] = useState(0);
  const [uploadMode, setUploadMode] = useState<'single' | 'bulk'>('bulk');

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

      {/* Upload Mode Toggle */}
      <div className="mb-6 flex justify-center gap-4">
        <button
          onClick={() => setUploadMode('single')}
          className={`btn-retro text-xs ${
            uploadMode === 'single' ? 'bg-pirate-gold' : 'opacity-50'
          }`}
        >
          📦 SINGLE UPLOAD
        </button>
        <button
          onClick={() => setUploadMode('bulk')}
          className={`btn-retro text-xs ${
            uploadMode === 'bulk' ? 'bg-pirate-gold' : 'opacity-50'
          }`}
        >
          📚 BULK UPLOAD
        </button>
      </div>

      {/* Upload Components */}
      {uploadMode === 'single' ? (
        <RomUpload key={uploadKey} onUploadComplete={handleUploadComplete} />
      ) : (
        <BulkRomUpload key={uploadKey} onUploadComplete={handleUploadComplete} />
      )}

      <div className="mt-8 text-center">
        <a href="/library" className="btn-retro text-xs">
          ← BACK TO LIBRARY
        </a>
      </div>
    </div>
  );
}
