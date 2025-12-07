export function GameLibraryPage() {
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-pixel mb-8 text-2xl text-pirate-gold">
        GAME LIBRARY
      </h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {/* Placeholder game cards */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="aspect-square border-4 border-wood-brown bg-sand-beige p-4"
          >
            <div className="flex h-full items-center justify-center">
              <span className="text-pixel text-xs text-ocean-dark">
                GAME {i}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
