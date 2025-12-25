import { useState } from 'react';
import { type Screenshot } from '../services/api';

interface CategorizedScreenshotGalleryProps {
  screenshots: Screenshot[];
  onImageClick?: (screenshot: Screenshot) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  GAMEPLAY: '🎮 Gameplay',
  TITLE_SCREEN: '📺 Title Screen',
  MENU: '📋 Menus',
  CUTSCENE: '🎬 Cutscenes',
  BOSS_FIGHT: '👹 Boss Fights',
  ENDING: '🏁 Endings',
  CREDITS: '📜 Credits',
  EASTER_EGG: '🥚 Easter Eggs',
  MULTIPLAYER: '👥 Multiplayer',
  CUSTOM: '✨ Custom',
};

export function CategorizedScreenshotGallery({
  screenshots,
  onImageClick,
}: CategorizedScreenshotGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [lightboxImage, setLightboxImage] = useState<Screenshot | null>(null);

  // Group screenshots by category
  const groupedScreenshots = screenshots.reduce((acc, screenshot) => {
    const category = screenshot.category || 'GAMEPLAY';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(screenshot);
    return acc;
  }, {} as Record<string, Screenshot[]>);

  // Get available categories
  const categories = Object.keys(groupedScreenshots).sort();
  const allCategories = ['ALL', ...categories];

  // Filter screenshots by selected category
  const filteredScreenshots =
    selectedCategory === 'ALL'
      ? screenshots
      : groupedScreenshots[selectedCategory] || [];

  const handleImageClick = (screenshot: Screenshot) => {
    setLightboxImage(screenshot);
    if (onImageClick) {
      onImageClick(screenshot);
    }
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  return (
    <div>
      {/* Category Filter Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {allCategories.map((category) => {
          const count =
            category === 'ALL'
              ? screenshots.length
              : groupedScreenshots[category]?.length || 0;

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`btn-retro text-[10px] px-3 py-1 ${
                selectedCategory === category
                  ? 'bg-pirate-gold text-skull-white'
                  : 'bg-sand-beige text-ocean-dark'
              }`}
            >
              {category === 'ALL' ? `📸 All (${count})` : CATEGORY_LABELS[category] || category}{' '}
              {category !== 'ALL' && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Screenshot Grid */}
      {filteredScreenshots.length === 0 ? (
        <div className="border-4 border-wood-brown bg-sand-beige p-8 text-center">
          <p className="text-pixel text-xs text-ocean-dark">
            No screenshots in this category
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredScreenshots.map((screenshot) => (
            <div
              key={screenshot.id}
              className="border-4 border-wood-brown bg-black cursor-pointer hover:border-pirate-gold transition-colors group"
              onClick={() => handleImageClick(screenshot)}
            >
              {/* Screenshot Image */}
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={screenshot.url}
                  alt={screenshot.caption || 'Screenshot'}
                  className="w-full h-full object-cover pixel-art group-hover:scale-110 transition-transform"
                />

                {/* Category Badge */}
                <div className="absolute top-2 left-2 bg-black/80 px-2 py-1">
                  <span className="text-pixel text-[8px] text-pirate-gold">
                    {CATEGORY_LABELS[screenshot.category || 'GAMEPLAY'] ||
                      screenshot.category}
                  </span>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-pixel text-xl text-skull-white">🔍</span>
                </div>
              </div>

              {/* Caption (if exists) */}
              {screenshot.caption && (
                <div className="p-2 bg-sand-beige">
                  <p className="text-pixel text-[8px] text-ocean-dark line-clamp-2">
                    {screenshot.caption}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-6xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 btn-retro text-xs px-4 py-2 bg-blood-red"
            >
              ✕ CLOSE
            </button>

            {/* Image */}
            <div className="border-4 border-wood-brown bg-black">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.caption || 'Screenshot'}
                className="w-full h-auto pixel-art"
              />
            </div>

            {/* Image Info */}
            <div className="mt-4 border-4 border-wood-brown bg-sand-beige p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-pixel text-xs text-pirate-gold">
                  {CATEGORY_LABELS[lightboxImage.category || 'GAMEPLAY'] ||
                    lightboxImage.category}
                </span>
                <span className="text-pixel text-[10px] text-ocean-dark">
                  {new Date(lightboxImage.createdAt).toLocaleDateString()}
                </span>
              </div>

              {lightboxImage.caption && (
                <p className="text-pixel text-xs text-ocean-dark">
                  {lightboxImage.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
