import { useState } from 'react';
import { screenshotApi } from '../services/api';
import { toast } from '../utils/toast';

interface ScreenshotUploadModalProps {
  gameId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ScreenshotUploadModal({
  gameId,
  onClose,
  onSuccess,
}: ScreenshotUploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [type, setType] = useState('gameplay');
  const [url, setUrl] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUrl(''); // Clear URL if file is selected

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile && !url.trim()) {
      toast.warning('No File Selected', 'Please select a file or enter a URL');
      return;
    }

    setUploading(true);
    try {
      if (selectedFile) {
        // Upload file
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          await screenshotApi.addScreenshot(gameId, {
            imageData: base64,
            type,
          });
          onSuccess();
          onClose();
        };
        reader.readAsDataURL(selectedFile);
      } else {
        // Use URL
        await screenshotApi.addScreenshot(gameId, {
          url: url.trim(),
          type,
        });
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(err, 'Failed to upload screenshot');
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg border-4 border-wood-brown bg-sand-beige p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-pixel text-lg text-ocean-dark">UPLOAD SCREENSHOT</h2>
          <button onClick={onClose} className="btn-retro text-xs px-3">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="text-pixel text-xs text-ocean-dark block mb-2">
              UPLOAD FILE
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="w-full border-2 border-wood-brown bg-white p-2 text-pixel text-xs"
            />
          </div>

          {/* OR */}
          <div className="text-center text-pixel text-xs text-wood-brown">OR</div>

          {/* URL Input */}
          <div>
            <label className="text-pixel text-xs text-ocean-dark block mb-2">
              IMAGE URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setSelectedFile(null); // Clear file if URL is entered
                setPreviewUrl(null);
              }}
              placeholder="https://example.com/screenshot.png"
              disabled={uploading}
              className="w-full border-2 border-wood-brown bg-white p-2 text-pixel text-xs"
            />
          </div>

          {/* Type Selection */}
          <div>
            <label className="text-pixel text-xs text-ocean-dark block mb-2">
              SCREENSHOT TYPE
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={uploading}
              className="w-full border-2 border-wood-brown bg-white p-2 text-pixel text-xs"
            >
              <option value="gameplay">Gameplay</option>
              <option value="title">Title Screen</option>
              <option value="box">Box Art</option>
              <option value="menu">Menu</option>
              <option value="cutscene">Cutscene</option>
            </select>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div>
              <label className="text-pixel text-xs text-ocean-dark block mb-2">
                PREVIEW
              </label>
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full border-2 border-wood-brown"
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading || (!selectedFile && !url.trim())}
            className="btn-retro w-full text-xs"
          >
            {uploading ? 'UPLOADING...' : '📤 UPLOAD'}
          </button>
        </form>
      </div>
    </div>
  );
}
