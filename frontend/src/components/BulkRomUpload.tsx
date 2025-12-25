import { useState, useRef } from 'react';
import { gameApi } from '../services/api';
import { getSystemsByManufacturer } from '../constants/systems';

interface BulkRomUploadProps {
  onUploadComplete?: () => void;
}

interface FileProgress {
  name: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  gameId?: string;
}

export function BulkRomUpload({ onUploadComplete }: BulkRomUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [system, setSystem] = useState('');
  const [autoScrape, setAutoScrape] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileProgress, setFileProgress] = useState<FileProgress[]>([]);
  const [error, setError] = useState('');
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
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
      return `Invalid file type: ${ext}`;
    }

    return null;
  };

  const handleFiles = (files: File[]) => {
    // Validate all files
    const invalidFiles: string[] = [];
    const validFiles: File[] = [];

    files.forEach((file) => {
      const validationError = validateFile(file);
      if (validationError) {
        invalidFiles.push(`${file.name}: ${validationError}`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      setError(`Invalid files detected:\n${invalidFiles.slice(0, 5).join('\n')}${invalidFiles.length > 5 ? `\n... and ${invalidFiles.length - 5} more` : ''}`);
    } else {
      setError('');
    }

    setSelectedFiles(validFiles);
    setFileProgress([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0 || !system) {
      setError('Please select files and system');
      return;
    }

    setUploading(true);
    setError('');

    // Initialize progress for all files
    const initialProgress: FileProgress[] = selectedFiles.map((file) => ({
      name: file.name,
      progress: 0,
      status: 'pending' as const,
    }));
    setFileProgress(initialProgress);

    try {
      // Upload files sequentially to track individual progress
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        // Update status to uploading
        setFileProgress((prev) =>
          prev.map((fp, idx) =>
            idx === i ? { ...fp, status: 'uploading' as const } : fp
          )
        );

        try {
          // Extract title from filename
          const title = file.name.replace(/\.[^/.]+$/, '');

          // Upload individual ROM
          const response = await gameApi.uploadRom(
            file,
            {
              title,
              system,
            },
            (progressEvent: any) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setFileProgress((prev) =>
                prev.map((fp, idx) => (idx === i ? { ...fp, progress } : fp))
              );
            }
          );

          // Mark as success
          setFileProgress((prev) =>
            prev.map((fp, idx) =>
              idx === i
                ? {
                    ...fp,
                    progress: 100,
                    status: 'success' as const,
                    gameId: response.data.game.id,
                  }
                : fp
            )
          );

          // Auto-scrape if enabled
          if (autoScrape && response.data.game.id) {
            try {
              await gameApi.scrapeMetadata(response.data.game.id);
            } catch (scrapeError) {
              console.error(`Failed to scrape metadata for ${title}:`, scrapeError);
            }
          }
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || 'Upload failed';
          setFileProgress((prev) =>
            prev.map((fp, idx) =>
              idx === i
                ? {
                    ...fp,
                    status: 'error' as const,
                    error: errorMessage,
                  }
                : fp
            )
          );
        }
      }

      // Clear selected files after successful upload
      setSelectedFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err: any) {
      setError(err.message || 'Bulk upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="border-4 border-wood-brown bg-ocean-dark p-6">
        <h2 className="text-pixel mb-6 text-center text-xl text-pirate-gold">
          BULK UPLOAD ROMS
        </h2>

        <form onSubmit={handleUpload} className="space-y-4">
          {/* Mobile Instructions */}
          {isMobile && (
            <div className="border-4 border-pirate-gold bg-pirate-gold/20 p-3">
              <p className="text-pixel text-[10px] text-skull-white">
                📱 MOBILE TIP: When selecting files, choose "Files" or "Browse" option (NOT Camera/Photos)
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
              {selectedFiles.length > 0 && (
                <div className="text-pixel text-sm text-ocean-dark mb-4">
                  <p className="mb-2">📦 {selectedFiles.length} files selected</p>
                  <div className="max-h-48 space-y-2 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white/20 p-2"
                      >
                        <span className="text-xs truncate flex-1">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="ml-2 text-blood-red hover:text-blood-red/70"
                        >
                          ❌
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-pixel mb-4 text-sm text-ocean-dark text-center">
                Select multiple ROM files
              </p>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                accept=".zip,.rar,.7z,.nes,.snes,.smc,.sfc,.gb,.gbc,.gba,.n64,.z64,.nds,.gen,.smd,.bin,.iso"
                className="w-full border-4 border-wood-brown bg-sand-beige p-3 text-sm text-ocean-dark cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-pirate-gold file:text-ocean-dark hover:file:bg-pirate-gold/80"
              />
            </div>
          </div>

          {/* System */}
          <div>
            <label htmlFor="bulk-system" className="text-pixel mb-2 block text-xs text-skull-white">
              SYSTEM * (All files must be for the same system)
            </label>
            <select
              id="bulk-system"
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

          {/* Auto-scrape option */}
          <div className="border-4 border-wood-brown bg-sand-beige p-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoScrape}
                onChange={(e) => setAutoScrape(e.target.checked)}
                className="mr-3 h-5 w-5"
              />
              <div className="text-pixel text-xs text-ocean-dark">
                <div className="font-bold">🎨 AUTO-FETCH COVERS & METADATA</div>
                <div className="text-xxs mt-1 opacity-70">
                  Automatically download covers, descriptions, and metadata from ScreenScraper
                </div>
              </div>
            </label>
          </div>

          {/* Per-File Upload Progress */}
          {fileProgress.length > 0 && (
            <div className="border-4 border-wood-brown bg-ocean-dark p-4">
              <p className="text-pixel mb-3 text-xs text-skull-white">
                UPLOADING ROMS ({fileProgress.filter(f => f.status === 'success').length}/{fileProgress.length} complete)
              </p>
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {fileProgress.map((file, index) => (
                  <div key={index} className="border-2 border-wood-brown bg-sand-beige p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-pixel text-xs text-ocean-dark truncate flex-1">
                        {file.name}
                      </span>
                      <span className="text-pixel text-xs ml-2">
                        {file.status === 'pending' && '⏳'}
                        {file.status === 'uploading' && '📤'}
                        {file.status === 'success' && '✅'}
                        {file.status === 'error' && '❌'}
                      </span>
                    </div>
                    {file.status === 'uploading' && (
                      <div className="h-2 border border-wood-brown bg-night-sky">
                        <div
                          className="h-full bg-pirate-gold transition-all"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                    {file.status === 'error' && file.error && (
                      <p className="text-pixel text-xxs text-blood-red mt-1">
                        {file.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {autoScrape && uploading && (
                <p className="text-pixel mt-3 text-xxs text-skull-white/70">
                  ⏳ Auto-fetching covers and metadata after each upload...
                </p>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="border-4 border-blood-red bg-blood-red/20 p-4">
              <p className="text-pixel text-xs text-skull-white whitespace-pre-line">❌ {error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || selectedFiles.length === 0 || !system}
            className="btn-retro w-full"
          >
            {uploading
              ? `UPLOADING ${selectedFiles.length} ROMS...`
              : `UPLOAD ${selectedFiles.length || ''} ROM${selectedFiles.length !== 1 ? 'S' : ''}`}
          </button>
        </form>
      </div>
    </div>
  );
}
