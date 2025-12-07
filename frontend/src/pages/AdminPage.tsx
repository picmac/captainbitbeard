export function AdminPage() {
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-pixel mb-8 text-2xl text-pirate-gold">
        ADMIN PANEL
      </h1>
      <div className="space-y-4">
        <div className="border-4 border-wood-brown bg-ocean-dark p-4">
          <h2 className="text-pixel mb-4 text-sm text-pirate-gold">
            UPLOAD ROMS
          </h2>
          <button className="btn-retro">SELECT FILES</button>
        </div>
      </div>
    </div>
  );
}
