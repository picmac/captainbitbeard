import { useState, useRef } from 'react';
import { gameApi } from '../services/api';

interface RomUploadProps {
  onUploadComplete?: () => void;
}

export function RomUpload({ onUploadComplete }: RomUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [system, setSystem] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const systems = [
    { value: 'nes', label: 'Nintendo Entertainment System (NES)' },
    { value: 'snes', label: 'Super Nintendo (SNES)' },
    { value: 'gb', label: 'Game Boy (GB)' },
    { value: 'gbc', label: 'Game Boy Color (GBC)' },
    { value: 'gba', label: 'Game Boy Advance (GBA)' },
    { value: 'n64', label: 'Nintendo 64 (N64)' },
    { value: 'nds', label: 'Nintendo DS (NDS)' },
    { value: 'genesis', label: 'Sega Genesis/Mega Drive' },
    { value: 'sms', label: 'Sega Master System' },
    { value: 'gg', label: 'Sega Game Gear' },
    { value: 'psx', label: 'PlayStation 1 (PSX)' },
    { value: 'psp', label: 'PlayStation Portable (PSP)' },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    setError('');
    setSuccess(false);

    // Auto-extract title from filename (remove extension)
    if (!title) {
      const filename = file.name.replace(/\.[^/.]+$/, '');
      setTitle(filename);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !title || !system) {
      setError('Please fill in all required fields');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      await gameApi.uploadRom(
        selectedFile,
        {
          title,
          system,
          description: description || undefined,
        },
        (progressEvent: any) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        }
      );

      setSuccess(true);
      setSelectedFile(null);
      setTitle('');
      setDescription('');
      setUploadProgress(0);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (onUploadComplete) {
        onUploadComplete();
      }

      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="border-4 border-wood-brown bg-ocean-dark p-6">
        <h2 className="text-pixel mb-6 text-center text-xl text-pirate-gold">
          UPLOAD ROM
        </h2>

        <form onSubmit={handleUpload} className="space-y-4">
          {/* Drag & Drop Area */}
          <div
            className={`border-4 ${
              dragActive ? 'border-pirate-gold bg-ocean-blue' : 'border-wood-brown bg-sand-beige'
            } p-8 text-center transition-colors`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept=".nes,.snes,.sfc,.gb,.gbc,.gba,.n64,.z64,.nds,.smd,.gen,.iso,.bin,.cue,.zip,.7z,.rar"
              className="hidden"
              id="rom-file"
            />

            {selectedFile ? (
              <div className="text-pixel text-sm text-ocean-dark">
                <p className="mb-2">📁 {selectedFile.name}</p>
                <p className="text-xs">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-retro mt-4 text-xs"
                >
                  CHANGE FILE
                </button>
              </div>
            ) : (
              <div>
                <p className="text-pixel mb-4 text-sm text-ocean-dark">
                  Drag & Drop ROM file here
                </p>
                <label htmlFor="rom-file" className="btn-retro cursor-pointer text-xs">
                  SELECT FILE
                </label>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-pixel mb-2 block text-xs text-skull-white">
              GAME TITLE *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border-4 border-wood-brown bg-sand-beige p-3 text-sm text-ocean-dark"
              placeholder="Super Mario Bros"
            />
          </div>

          {/* System */}
          <div>
            <label className="text-pixel mb-2 block text-xs text-skull-white">
              SYSTEM *
            </label>
            <select
              value={system}
              onChange={(e) => setSystem(e.target.value)}
              required
              className="w-full border-4 border-wood-brown bg-sand-beige p-3 text-sm text-ocean-dark"
            >
              <option value="">Select system...</option>
              {systems.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-pixel mb-2 block text-xs text-skull-white">
              DESCRIPTION
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border-4 border-wood-brown bg-sand-beige p-3 text-sm text-ocean-dark"
              placeholder="Optional game description..."
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="border-4 border-wood-brown bg-ocean-dark p-4">
              <p className="text-pixel mb-2 text-xs text-skull-white">
                UPLOADING... {uploadProgress}%
              </p>
              <div className="h-4 border-2 border-pirate-gold bg-night-sky">
                <div
                  className="h-full bg-pirate-gold transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="border-4 border-blood-red bg-blood-red/20 p-4">
              <p className="text-pixel text-xs text-skull-white">❌ {error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="border-4 border-treasure-green bg-treasure-green/20 p-4">
              <p className="text-pixel text-xs text-skull-white">
                ✅ ROM uploaded successfully!
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || !selectedFile || !title || !system}
            className="btn-retro w-full"
          >
            {uploading ? 'UPLOADING...' : 'UPLOAD ROM'}
          </button>
        </form>
      </div>
    </div>
  );
}
