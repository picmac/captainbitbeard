import { useState, useRef } from 'react';
import { gameApi } from '../services/api';
import { getSystemsByManufacturer } from '../constants/systems';

interface BulkRomUploadProps {
  onUploadComplete?: () => void;
}

export function BulkRomUpload({ onUploadComplete }: BulkRomUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [system, setSystem] = useState('');
  const [autoScrape, setAutoScrape] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [results, setResults] = useState<{
    total: number;
    successful: string[];
    failed: Array<{ filename: string; error: string }>;
  } | null>(null);
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

  const handleFiles = (files: File[]) => {
    setSelectedFiles(files);
    setError('');
    setResults(null);
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
    setResults(null);
    setUploadProgress(0);

    try {
      const response = await gameApi.bulkUploadRoms(
        selectedFiles,
        system,
        autoScrape,
        (progressEvent: any) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      );

      setResults(response.data.results);
      setSelectedFiles([]);
      setUploadProgress(0);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Bulk upload failed');
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

          {/* Upload Progress */}
          {uploading && (
            <div className="border-4 border-wood-brown bg-ocean-dark p-4">
              <p className="text-pixel mb-2 text-xs text-skull-white">
                UPLOADING {selectedFiles.length} ROMS... {uploadProgress}%
              </p>
              <div className="h-4 border-2 border-pirate-gold bg-night-sky">
                <div
                  className="h-full bg-pirate-gold transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              {autoScrape && (
                <p className="text-pixel mt-2 text-xxs text-skull-white/70">
                  ⏳ Fetching covers and metadata... This may take a while.
                </p>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="border-4 border-blood-red bg-blood-red/20 p-4">
              <p className="text-pixel text-xs text-skull-white">❌ {error}</p>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="border-4 border-treasure-green bg-treasure-green/20 p-4">
              <p className="text-pixel text-sm text-skull-white mb-3">
                ✅ Upload Complete!
              </p>
              <div className="text-pixel text-xs text-skull-white space-y-2">
                <p>
                  📊 Total: {results.total} | Success: {results.successful.length} | Failed:{' '}
                  {results.failed.length}
                </p>

                {results.failed.length > 0 && (
                  <div className="mt-4 border-2 border-blood-red bg-blood-red/10 p-3">
                    <p className="font-bold mb-2">❌ Failed uploads:</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {results.failed.map((fail, idx) => (
                        <div key={idx} className="text-xxs">
                          • {fail.filename}: {fail.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
