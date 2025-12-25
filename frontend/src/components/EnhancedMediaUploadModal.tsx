import { useState } from 'react';
import { mediaApi } from '../services/api';
import { toast } from '../utils/toast';

interface EnhancedMediaUploadModalProps {
  gameId: string;
  gameName: string;
  onClose: () => void;
  onSuccess: () => void;
}

type MediaType = 'trailer' | 'music' | 'animated-cover' | 'screenshot';

const SCREENSHOT_CATEGORIES = [
  'GAMEPLAY',
  'TITLE_SCREEN',
  'MENU',
  'CUTSCENE',
  'BOSS_FIGHT',
  'ENDING',
  'CREDITS',
  'EASTER_EGG',
  'MULTIPLAYER',
  'CUSTOM',
];

export function EnhancedMediaUploadModal({
  gameId,
  gameName,
  onClose,
  onSuccess,
}: EnhancedMediaUploadModalProps) {
  const [mediaType, setMediaType] = useState<MediaType>('screenshot');
  const [file, setFile] = useState<File | null>(null);
  const [screenshotCategory, setScreenshotCategory] = useState('GAMEPLAY');
  const [screenshotCaption, setScreenshotCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const getAcceptedFormats = (): string => {
    switch (mediaType) {
      case 'trailer':
        return '.mp4,.webm,.mkv,.avi,.mov';
      case 'music':
        return '.mp3,.ogg,.wav,.m4a,.flac';
      case 'animated-cover':
        return '.webp,.apng,.gif';
      case 'screenshot':
        return '.jpg,.jpeg,.png,.webp,.gif';
      default:
        return '*';
    }
  };

  const getMaxFileSize = (): string => {
    switch (mediaType) {
      case 'trailer':
        return '500MB';
      case 'music':
        return '50MB';
      case 'animated-cover':
        return '10MB';
      case 'screenshot':
        return '5MB';
      default:
        return 'N/A';
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      let response;

      switch (mediaType) {
        case 'trailer':
          response = await mediaApi.uploadTrailer(gameId, file);
          break;
        case 'music':
          response = await mediaApi.uploadBackgroundMusic(gameId, file);
          break;
        case 'animated-cover':
          response = await mediaApi.uploadAnimatedCover(gameId, file);
          break;
        case 'screenshot':
          response = await mediaApi.uploadCategorizedScreenshot(
            gameId,
            file,
            screenshotCategory,
            screenshotCaption || undefined
          );
          break;
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success('Upload Successful', response.message || `Media uploaded to ${gameName}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="border-4 border-wood-brown bg-sand-beige w-full max-w-2xl">
        {/* Header */}
        <div className="p-4 bg-wood-brown flex items-center justify-between">
          <h2 className="text-pixel text-sm text-skull-white">
            📤 UPLOAD MEDIA - {gameName}
          </h2>
          <button
            onClick={onClose}
            className="text-pixel text-sm text-skull-white hover:text-blood-red"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Media Type Selection */}
          <div>
            <label className="text-pixel text-xs text-ocean-dark block mb-2">
              Media Type:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMediaType('trailer')}
                className={`btn-retro text-xs px-4 py-2 ${
                  mediaType === 'trailer' ? 'bg-pirate-gold' : ''
                }`}
              >
                🎬 Trailer Video
              </button>
              <button
                onClick={() => setMediaType('music')}
                className={`btn-retro text-xs px-4 py-2 ${
                  mediaType === 'music' ? 'bg-pirate-gold' : ''
                }`}
              >
                🎵 Background Music
              </button>
              <button
                onClick={() => setMediaType('animated-cover')}
                className={`btn-retro text-xs px-4 py-2 ${
                  mediaType === 'animated-cover' ? 'bg-pirate-gold' : ''
                }`}
              >
                ✨ Animated Cover
              </button>
              <button
                onClick={() => setMediaType('screenshot')}
                className={`btn-retro text-xs px-4 py-2 ${
                  mediaType === 'screenshot' ? 'bg-pirate-gold' : ''
                }`}
              >
                📸 Screenshot
              </button>
            </div>
          </div>

          {/* Screenshot-specific options */}
          {mediaType === 'screenshot' && (
            <>
              <div>
                <label className="text-pixel text-xs text-ocean-dark block mb-2">
                  Category:
                </label>
                <select
                  value={screenshotCategory}
                  onChange={(e) => setScreenshotCategory(e.target.value)}
                  className="w-full border-2 border-wood-brown bg-white p-2 text-pixel text-xs text-ocean-dark"
                >
                  {SCREENSHOT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-pixel text-xs text-ocean-dark block mb-2">
                  Caption (optional):
                </label>
                <input
                  type="text"
                  value={screenshotCaption}
                  onChange={(e) => setScreenshotCaption(e.target.value)}
                  placeholder="Describe this screenshot..."
                  className="w-full border-2 border-wood-brown bg-white p-2 text-pixel text-xs text-ocean-dark"
                />
              </div>
            </>
          )}

          {/* File Input */}
          <div>
            <label className="text-pixel text-xs text-ocean-dark block mb-2">
              Select File:
            </label>
            <div className="border-4 border-wood-brown bg-white p-4 text-center">
              <input
                type="file"
                accept={getAcceptedFormats()}
                onChange={handleFileChange}
                className="w-full text-pixel text-xs text-ocean-dark"
              />

              {file && (
                <div className="mt-3 p-2 bg-sand-beige">
                  <p className="text-pixel text-[10px] text-ocean-dark">
                    📁 {file.name}
                  </p>
                  <p className="text-pixel text-[10px] text-wood-brown">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            <p className="text-pixel text-[10px] text-ocean-dark/70 mt-2">
              Accepted formats: {getAcceptedFormats()} • Max size: {getMaxFileSize()}
            </p>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div>
              <div className="h-4 bg-ocean-dark border-2 border-wood-brown overflow-hidden">
                <div
                  className="h-full bg-treasure-green transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-pixel text-xs text-ocean-dark text-center mt-2">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="border-4 border-blood-red bg-blood-red/20 p-3">
              <p className="text-pixel text-xs text-blood-red">❌ {error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t-2 border-wood-brown">
            <button
              onClick={onClose}
              className="btn-retro text-xs px-4 py-2"
              disabled={uploading}
            >
              CANCEL
            </button>
            <button
              onClick={handleUpload}
              className="btn-retro text-xs px-4 py-2 bg-treasure-green"
              disabled={!file || uploading}
            >
              {uploading ? '⏳ UPLOADING...' : '✓ UPLOAD'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
