import { useState, useEffect } from 'react';
import { type GameVersion, gameVersionApi } from '../services/api';

interface GameVersionManagerProps {
  gameId: string;
  isAdmin?: boolean;
}

export function GameVersionManager({ gameId, isAdmin = false }: GameVersionManagerProps) {
  const [versions, setVersions] = useState<GameVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Upload form state
  const [versionName, setVersionName] = useState('');
  const [region, setRegion] = useState('USA');
  const [revision, setRevision] = useState('');
  const [changes, setChanges] = useState('');
  const [isPreferred, setIsPreferred] = useState(false);
  const [romFile, setRomFile] = useState<File | null>(null);

  const regions = ['USA', 'EUR', 'JPN', 'KOR', 'CHN', 'BRA', 'AUS', 'WORLD', 'UNK'];

  useEffect(() => {
    loadVersions();
  }, [gameId]);

  const loadVersions = async () => {
    try {
      const response = await gameVersionApi.getGameVersions(gameId);
      setVersions(response.data.versions);
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadVersion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!romFile) {
      alert('Please select a ROM file');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('rom', romFile);
      formData.append('versionName', versionName);
      formData.append('region', region);
      if (revision) formData.append('revision', revision);
      if (changes) formData.append('changes', changes);
      formData.append('isPreferred', isPreferred.toString());

      await gameVersionApi.createGameVersion(gameId, formData);

      alert('✅ Version uploaded successfully!');
      setShowUploadForm(false);
      resetForm();
      loadVersions();
    } catch (error) {
      console.error('Failed to upload version:', error);
      alert('❌ Failed to upload version');
    } finally {
      setUploading(false);
    }
  };

  const handleSetPreferred = async (versionId: string) => {
    try {
      await gameVersionApi.setPreferredVersion(gameId, versionId);
      alert('✅ Preferred version set!');
      loadVersions();
    } catch (error) {
      console.error('Failed to set preferred version:', error);
      alert('❌ Failed to set preferred version');
    }
  };

  const handleDeleteVersion = async (versionId: string, versionName: string) => {
    if (!confirm(`Delete version "${versionName}"? This cannot be undone!`)) {
      return;
    }

    try {
      await gameVersionApi.deleteGameVersion(gameId, versionId);
      alert('✅ Version deleted successfully!');
      loadVersions();
    } catch (error) {
      console.error('Failed to delete version:', error);
      alert('❌ Failed to delete version');
    }
  };

  const resetForm = () => {
    setVersionName('');
    setRegion('USA');
    setRevision('');
    setChanges('');
    setIsPreferred(false);
    setRomFile(null);
  };

  const formatFileSize = (bytes: string): string => {
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <div className="border-4 border-wood-brown bg-sand-beige p-4">
        <p className="text-pixel text-xs text-ocean-dark">Loading versions...</p>
      </div>
    );
  }

  return (
    <div className="border-4 border-wood-brown bg-sand-beige p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-pixel text-sm text-ocean-dark">🔄 GAME VERSIONS ({versions.length})</h3>
        {isAdmin && (
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="btn-retro text-[10px] px-3 py-1 bg-treasure-green"
          >
            {showUploadForm ? '✕ CANCEL' : '➕ ADD VERSION'}
          </button>
        )}
      </div>

      {/* Upload Form */}
      {showUploadForm && isAdmin && (
        <form onSubmit={handleUploadVersion} className="mb-4 border-2 border-wood-brown bg-skull-white p-3">
          <h4 className="text-pixel text-xs text-ocean-dark mb-2">UPLOAD NEW VERSION</h4>

          <div className="space-y-2">
            <div>
              <label className="text-pixel text-[10px] text-ocean-dark block mb-1">Version Name:</label>
              <input
                type="text"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="USA Rev A"
                className="w-full border-2 border-wood-brown bg-white p-2 text-pixel text-[10px] text-ocean-dark"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-pixel text-[10px] text-ocean-dark block mb-1">Region:</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full border-2 border-wood-brown bg-white p-2 text-pixel text-[10px] text-ocean-dark"
                >
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-pixel text-[10px] text-ocean-dark block mb-1">Revision:</label>
                <input
                  type="text"
                  value={revision}
                  onChange={(e) => setRevision(e.target.value)}
                  placeholder="Rev A, v1.0"
                  className="w-full border-2 border-wood-brown bg-white p-2 text-pixel text-[10px] text-ocean-dark"
                />
              </div>
            </div>

            <div>
              <label className="text-pixel text-[10px] text-ocean-dark block mb-1">Changes/Notes:</label>
              <textarea
                value={changes}
                onChange={(e) => setChanges(e.target.value)}
                placeholder="What changed in this version..."
                className="w-full border-2 border-wood-brown bg-white p-2 text-pixel text-[10px] text-ocean-dark"
                rows={2}
              />
            </div>

            <div>
              <label className="text-pixel text-[10px] text-ocean-dark block mb-1">ROM File:</label>
              <input
                type="file"
                onChange={(e) => setRomFile(e.target.files?.[0] || null)}
                accept=".nes,.snes,.sfc,.gb,.gbc,.gba,.n64,.z64,.nds,.smd,.gen,.sms,.gg,.iso,.cue,.bin,.zip,.7z,.rar"
                className="w-full border-2 border-wood-brown bg-white p-2 text-pixel text-[10px] text-ocean-dark"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPreferred"
                checked={isPreferred}
                onChange={(e) => setIsPreferred(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="isPreferred" className="text-pixel text-[10px] text-ocean-dark">
                Set as preferred version
              </label>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="btn-retro text-[10px] w-full bg-treasure-green"
            >
              {uploading ? '⏳ UPLOADING...' : '✓ UPLOAD VERSION'}
            </button>
          </div>
        </form>
      )}

      {/* Versions List */}
      {versions.length === 0 ? (
        <p className="text-pixel text-[10px] text-ocean-dark/70 text-center py-4">
          No alternate versions available
        </p>
      ) : (
        <div className="space-y-2">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`border-2 p-3 ${
                version.isPreferred
                  ? 'border-pirate-gold bg-pirate-gold/20'
                  : 'border-wood-brown bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-pixel text-xs text-ocean-dark font-bold">
                      {version.versionName}
                    </h4>
                    {version.isPreferred && (
                      <span className="text-pixel text-[8px] px-2 py-0.5 bg-pirate-gold text-skull-white">
                        ⭐ PREFERRED
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3 mb-1">
                    <span className="text-pixel text-[10px] text-wood-brown">
                      📍 {version.region}
                    </span>
                    {version.revision && (
                      <span className="text-pixel text-[10px] text-wood-brown">
                        🔄 {version.revision}
                      </span>
                    )}
                    <span className="text-pixel text-[10px] text-wood-brown">
                      💾 {formatFileSize(version.fileSize)}
                    </span>
                  </div>

                  {version.changes && (
                    <p className="text-pixel text-[10px] text-ocean-dark mt-1">
                      {version.changes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {isAdmin && (
                  <div className="flex flex-col gap-1">
                    {!version.isPreferred && (
                      <button
                        onClick={() => handleSetPreferred(version.id)}
                        className="btn-retro text-[8px] px-2 py-1 bg-pirate-gold"
                        title="Set as preferred version"
                      >
                        ⭐ SET PREFERRED
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteVersion(version.id, version.versionName)}
                      className="btn-retro text-[8px] px-2 py-1 bg-blood-red"
                      title="Delete version"
                    >
                      🗑️ DELETE
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
