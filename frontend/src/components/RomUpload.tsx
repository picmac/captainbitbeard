import { useState, useRef } from 'react';
import { gameApi } from '../services/api';
import { getSystemsByManufacturer } from '../constants/systems';

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

  // Detect mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // Group systems by manufacturer for organized dropdown
  const systemsByManufacturer = getSystemsByManufacturer();

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
          {/* Mobile Instructions */}
          {isMobile && (
            <div className="border-4 border-pirate-gold bg-pirate-gold/20 p-3">
              <p className="text-pixel text-[10px] text-skull-white">
                📱 MOBILE TIP: When selecting file, choose "Files" or "Browse" option (NOT Camera/Photos)
              </p>
            </div>
          )}

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
            <div className="w-full">
              {selectedFile ? (
                <div className="text-pixel text-sm text-ocean-dark mb-4">
                  <p className="mb-2">📁 {selectedFile.name}</p>
                  <p className="text-xs">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <p className="text-pixel mb-4 text-sm text-ocean-dark text-center">
                  Select your ROM file
                </p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept=".zip,.rar,.7z,.nes,.snes,.smc,.sfc,.gb,.gbc,.gba,.n64,.z64,.nds,.gen,.smd,.bin,.iso"
                className="w-full border-4 border-wood-brown bg-sand-beige p-3 text-sm text-ocean-dark cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-pirate-gold file:text-ocean-dark hover:file:bg-pirate-gold/80"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="game-title" className="text-pixel mb-2 block text-xs text-skull-white">
              GAME TITLE *
            </label>
            <input
              type="text"
              id="game-title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border-4 border-wood-brown bg-sand-beige p-3 text-sm text-ocean-dark"
              placeholder="Super Mario Bros"
            />
          </div>

          {/* System */}
          <div>
            <label htmlFor="game-system" className="text-pixel mb-2 block text-xs text-skull-white">
              SYSTEM *
            </label>
            <select
              id="game-system"
              name="system"
              value={system}
              onChange={(e) => setSystem(e.target.value)}
              required
              className="w-full border-4 border-wood-brown bg-sand-beige p-3 text-sm text-ocean-dark"
            >
              <option value="">Select system...</option>
              {Array.from(systemsByManufacturer.entries()).map(([manufacturer, systems]) => (
                <optgroup key={manufacturer} label={manufacturer}>
                  {systems.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="game-description" className="text-pixel mb-2 block text-xs text-skull-white">
              DESCRIPTION
            </label>
            <textarea
              id="game-description"
              name="description"
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
