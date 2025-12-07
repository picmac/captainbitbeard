export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h2 className="text-pixel mb-8 text-center text-2xl text-pirate-gold">
          LOGIN
        </h2>
        <form className="space-y-4">
          <div>
            <label className="text-pixel mb-2 block text-xs text-skull-white">
              USERNAME
            </label>
            <input
              type="text"
              className="w-full border-4 border-wood-brown bg-sand-beige p-3 text-ocean-dark"
            />
          </div>
          <div>
            <label className="text-pixel mb-2 block text-xs text-skull-white">
              PASSWORD
            </label>
            <input
              type="password"
              className="w-full border-4 border-wood-brown bg-sand-beige p-3 text-ocean-dark"
            />
          </div>
          <button type="submit" className="btn-retro w-full">
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
}
