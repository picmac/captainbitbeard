import { useState } from 'react';
import { type Screenshot } from '../services/api';

interface ImageGalleryProps {
  screenshots: Screenshot[];
  coverUrl?: string | null;
  boxArtUrl?: string | null;
  backgroundUrl?: string | null;
  logoUrl?: string | null;
}

export function ImageGallery({
  screenshots,
  coverUrl,
  boxArtUrl,
  backgroundUrl,
  logoUrl,
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Combine all images
  const allImages: Array<{ url: string; label: string }> = [];

  if (coverUrl) {
    allImages.push({ url: coverUrl, label: 'Cover' });
  }
  if (boxArtUrl) {
    allImages.push({ url: boxArtUrl, label: 'Box Art' });
  }
  if (logoUrl) {
    allImages.push({ url: logoUrl, label: 'Logo' });
  }

  // Add screenshots
  screenshots.forEach((screenshot) => {
    allImages.push({
      url: screenshot.url,
      label: screenshot.type.charAt(0).toUpperCase() + screenshot.type.slice(1),
    });
  });

  if (allImages.length === 0) {
    return null;
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {allImages.map((image, index) => (
          <div
            key={index}
            onClick={() => setSelectedImage(image.url)}
            className="border-4 border-wood-brown bg-ocean-dark aspect-video overflow-hidden cursor-pointer hover:border-pirate-gold transition-colors relative group"
          >
            <img
              src={image.url}
              alt={image.label}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-pixel text-xs text-skull-white">
                🔍 {image.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Background Image (if available) */}
      {backgroundUrl && (
        <div className="mt-4">
          <button
            onClick={() => setSelectedImage(backgroundUrl)}
            className="btn-retro text-xs w-full"
          >
            🖼️ VIEW BACKGROUND
          </button>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 btn-retro text-xs px-4"
          >
            ✕ CLOSE
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain border-4 border-pirate-gold"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
