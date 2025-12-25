import { useState, useRef } from 'react';
import { gameApi, Game } from '../services/api';
import { getSystemsByManufacturer } from '../constants/systems';
import { calculateMD5 } from '../utils/romVerification';
import { ConfirmationModal } from './ConfirmationModal';

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
  const [verifyingHash, setVerifyingHash] = useState(false);
  const [duplicateGame, setDuplicateGame] = useState<Game | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [calculatedMD5, setCalculatedMD5] = useState<string | null>(null);
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

  const validateFile = (file: File): string | null => {
    // File size validation (100MB limit)
    const maxSizeBytes = 100 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds maximum allowed size of 100 MB`;
    }

    // Minimum file size (1KB to avoid empty files)
    if (file.size < 1024) {
      return 'File is too small. ROM files must be at least 1 KB';
    }

    // File extension validation
    const allowedExtensions = [
      '.nes', '.snes', '.sfc', '.gb', '.gbc', '.gba',
      '.n64', '.z64', '.nds', '.smd', '.gen', '.sms',
      '.gg', '.iso', '.cue', '.bin', '.zip', '.7z', '.rar'
    ];

    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(ext)) {
      return `Invalid file type: ${ext}. Allowed types: ${allowedExtensions.join(', ')}`;
    }

    return null;
  };

  const handleFile = async (file: File) => {
    // Validate file first
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError('');
    setSuccess(false);
    setDuplicateGame(null);
    setCalculatedMD5(null);

    // Auto-extract title from filename (remove extension)
    if (!title) {
      const filename = file.name.replace(/\.[^/.]+$/, '');
      setTitle(filename);
    }

    // Calculate MD5 and check for duplicates
    try {
      setVerifyingHash(true);
      const md5Hash = await calculateMD5(file);
      setCalculatedMD5(md5Hash);

      // Check if this ROM already exists
      const duplicateCheck = await gameApi.checkDuplicate(md5Hash);

      if (duplicateCheck.data.isDuplicate && duplicateCheck.data.existingGame) {
        setDuplicateGame(duplicateCheck.data.existingGame);
        setShowDuplicateModal(true);
      }
    } catch (err) {
      console.error('Failed to verify ROM:', err);
      // Don't block upload if verification fails
    } finally {
      setVerifyingHash(false);
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

          {/* Hash Verification Progress */}
          {verifyingHash && (
            <div className="border-4 border-ocean-blue bg-ocean-blue/20 p-4">
              <p className="text-pixel text-xs text-skull-white">
                🔐 VERIFYING ROM INTEGRITY...
              </p>
            </div>
          )}

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
            disabled={uploading || verifyingHash || !selectedFile || !title || !system}
            className="btn-retro w-full"
          >
            {uploading ? 'UPLOADING...' : verifyingHash ? 'VERIFYING...' : 'UPLOAD ROM'}
          </button>
        </form>
      </div>

      {/* Duplicate Warning Modal */}
      <ConfirmationModal
        isOpen={showDuplicateModal}
        onClose={() => {
          setShowDuplicateModal(false);
          setDuplicateGame(null);
        }}
        onConfirm={async () => {
          setShowDuplicateModal(false);
          // User confirmed to upload anyway - just close modal and let them proceed
        }}
        title="⚠️ DUPLICATE ROM DETECTED"
        message="This ROM file already exists in your library. Would you like to upload it anyway as a duplicate?"
        confirmText="UPLOAD ANYWAY"
        cancelText="CANCEL"
        type="warning"
      >
        {duplicateGame && (
          <div className="text-pixel text-xs">
            <p className="mb-2 font-bold text-pirate-gold">
              Existing Game:
            </p>
            <p className="mb-1">
              <span className="text-wood-brown">Title:</span> {duplicateGame.title}
            </p>
            <p className="mb-1">
              <span className="text-wood-brown">System:</span> {duplicateGame.system.toUpperCase()}
            </p>
            {duplicateGame.developer && (
              <p className="mb-1">
                <span className="text-wood-brown">Developer:</span> {duplicateGame.developer}
              </p>
            )}
            {calculatedMD5 && (
              <p className="mt-2 text-[8px] text-ocean-dark/60">
                MD5: {calculatedMD5}
              </p>
            )}
          </div>
        )}
      </ConfirmationModal>
    </div>
  );
}
