import { useState, useEffect } from 'react';
import { type BiosFile, biosApi } from '../services/api';

export function BiosManager() {
  const [biosFiles, setBiosFiles] = useState<BiosFile[]>([]);
  const [systemsRequiringBios, setSystemsRequiringBios] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Upload form state
  const [system, setSystem] = useState('');
  const [biosFile, setBiosFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState('');
  const [version, setVersion] = useState('');
  const [required, setRequired] = useState(true);

  // Filter state
  const [filterSystem, setFilterSystem] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [biosResponse, systemsResponse] = await Promise.all([
        biosApi.getAllBiosFiles(),
        biosApi.getSystemsRequiringBios(),
      ]);

      setBiosFiles(biosResponse.data.biosFiles);
      setSystemsRequiringBios(systemsResponse.data.systems);
    } catch (error) {
      console.error('Failed to load BIOS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadBios = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!biosFile) {
      alert('Please select a BIOS file');
      return;
    }

    if (!system) {
      alert('Please select a system');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('bios', biosFile);
      formData.append('system', system);
      if (description) formData.append('description', description);
      if (region) formData.append('region', region);
      if (version) formData.append('version', version);
      formData.append('required', required.toString());

      await biosApi.uploadBiosFile(formData);

      alert('✅ BIOS file uploaded successfully!');
      setShowUploadForm(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Failed to upload BIOS:', error);
      alert(`❌ ${error.response?.data?.message || 'Failed to upload BIOS file'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBios = async (id: string, fileName: string) => {
    if (!confirm(`Delete BIOS file "${fileName}"? This cannot be undone!`)) {
      return;
    }

    try {
      await biosApi.deleteBiosFile(id);
      alert('✅ BIOS file deleted successfully!');
      loadData();
    } catch (error) {
      console.error('Failed to delete BIOS:', error);
      alert('❌ Failed to delete BIOS file');
    }
  };

  const handleVerifyMd5 = async (id: string, fileName: string) => {
    const expectedMd5 = prompt(`Enter expected MD5 hash for ${fileName}:`);
    if (!expectedMd5) return;

    try {
      const response = await biosApi.verifyBiosMd5(id, expectedMd5);
      if (response.data.isValid) {
        alert('✅ MD5 hash is valid!');
      } else {
        alert('❌ MD5 hash does NOT match!');
      }
      loadData();
    } catch (error) {
      console.error('Failed to verify MD5:', error);
      alert('❌ Failed to verify MD5 hash');
    }
  };

  const resetForm = () => {
    setSystem('');
    setBiosFile(null);
    setDescription('');
    setRegion('');
    setVersion('');
    setRequired(true);
  };

  const formatFileSize = (bytes: string): string => {
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const filteredBiosFiles = filterSystem
    ? biosFiles.filter((bios) => bios.system === filterSystem)
    : biosFiles;

  const groupedBiosFiles = filteredBiosFiles.reduce((acc, bios) => {
    if (!acc[bios.system]) acc[bios.system] = [];
    acc[bios.system].push(bios);
    return acc;
  }, {} as Record<string, BiosFile[]>);

  if (loading) {
    return (
      <div className="border-4 border-wood-brown bg-sand-beige p-6">
        <p className="text-pixel text-xs text-ocean-dark">Loading BIOS files...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-pixel text-lg text-skull-white">💾 BIOS FILE MANAGEMENT</h3>
          <p className="text-pixel text-xs text-skull-white/70 mt-1">
            {biosFiles.length} BIOS files • {systemsRequiringBios.length} systems supported
          </p>
        </div>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="btn-retro text-xs px-4 py-2 bg-treasure-green"
        >
          {showUploadForm ? '✕ CANCEL' : '➕ UPLOAD BIOS'}
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <form
          onSubmit={handleUploadBios}
          className="border-4 border-wood-brown bg-sand-beige p-4 mb-4"
        >
          <h4 className="text-pixel text-sm text-ocean-dark mb-3">UPLOAD BIOS FILE</h4>

          <div className="space-y-3">
            <div>
              <label className="text-pixel text-xs text-ocean-dark block mb-1">System:</label>
              <select
                value={system}
                onChange={(e) => setSystem(e.target.value)}
                className="w-full border-2 border-wood-brown bg-white p-2 text-pixel text-xs text-ocean-dark"
                required
              >
                <option value="">Select system...</option>
                {systemsRequiringBios.map((sys) => (
                  <option key={sys} value={sys}>
                    {sys.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-pixel text-xs text-ocean-dark block mb-1">BIOS File:</label>
              <input
                type="file"
                onChange={(e) => setBiosFile(e.target.files?.[0] || null)}
                accept=".bin,.bios,.rom,.img,.dat"
                className="w-full border-2 border-wood-brown bg-white p-2 text-pixel text-xs text-ocean-dark"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-pixel text-xs text-ocean-dark block mb-1">Region:</label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="USA, JPN, EUR..."
                  className="w-full border-2 border-wood-brown bg-white p-2 text-pixel text-xs text-ocean-dark"
                />
              </div>

              <div>
                <label className="text-pixel text-xs text-ocean-dark block mb-1">Version:</label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="v1.0, SCPH-1001..."
                  className="w-full border-2 border-wood-brown bg-white p-2 text-pixel text-xs text-ocean-dark"
                />
              </div>
            </div>

            <div>
              <label className="text-pixel text-xs text-ocean-dark block mb-1">Description:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this BIOS is for..."
                className="w-full border-2 border-wood-brown bg-white p-2 text-pixel text-xs text-ocean-dark"
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="required"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="required" className="text-pixel text-xs text-ocean-dark">
                Mark as required
              </label>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="btn-retro text-xs w-full bg-treasure-green"
            >
              {uploading ? '⏳ UPLOADING...' : '✓ UPLOAD BIOS'}
            </button>
          </div>
        </form>
      )}

      {/* Filter */}
      <div className="mb-4">
        <select
          value={filterSystem}
          onChange={(e) => setFilterSystem(e.target.value)}
          className="border-2 border-wood-brown bg-sand-beige p-2 text-pixel text-xs text-ocean-dark"
        >
          <option value="">All Systems ({biosFiles.length})</option>
          {systemsRequiringBios.map((sys) => {
            const count = biosFiles.filter((b) => b.system === sys).length;
            return (
              <option key={sys} value={sys}>
                {sys.toUpperCase()} ({count})
              </option>
            );
          })}
        </select>
      </div>

      {/* BIOS Files List */}
      {Object.keys(groupedBiosFiles).length === 0 ? (
        <div className="border-4 border-wood-brown bg-sand-beige p-8 text-center">
          <p className="text-pixel text-xs text-ocean-dark">No BIOS files uploaded yet</p>
          <p className="text-pixel text-[10px] text-ocean-dark/70 mt-2">
            Upload BIOS files for systems that require them
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedBiosFiles).map(([systemName, files]) => (
            <div key={systemName} className="border-4 border-wood-brown bg-sand-beige p-4">
              <h4 className="text-pixel text-sm text-ocean-dark font-bold mb-3">
                {systemName.toUpperCase()} ({files.length} file{files.length !== 1 ? 's' : ''})
              </h4>

              <div className="space-y-2">
                {files.map((bios) => (
                  <div
                    key={bios.id}
                    className="border-2 border-wood-brown bg-white p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="text-pixel text-xs text-ocean-dark font-bold">
                          {bios.fileName}
                        </h5>

                        <div className="flex flex-wrap gap-3 mt-1">
                          <span className="text-pixel text-[10px] text-wood-brown">
                            💾 {formatFileSize(bios.fileSize)}
                          </span>
                          {bios.region && (
                            <span className="text-pixel text-[10px] text-wood-brown">
                              📍 {bios.region}
                            </span>
                          )}
                          {bios.version && (
                            <span className="text-pixel text-[10px] text-wood-brown">
                              🔄 {bios.version}
                            </span>
                          )}
                          <span
                            className={`text-pixel text-[10px] ${
                              bios.verified ? 'text-treasure-green' : 'text-blood-red'
                            }`}
                          >
                            {bios.verified ? '✓ Verified' : '⚠ Not Verified'}
                          </span>
                          {bios.required && (
                            <span className="text-pixel text-[10px] text-blood-red">
                              ⚠ REQUIRED
                            </span>
                          )}
                        </div>

                        {bios.description && (
                          <p className="text-pixel text-[10px] text-ocean-dark mt-1">
                            {bios.description}
                          </p>
                        )}

                        <p className="text-pixel text-[8px] text-wood-brown mt-1">
                          MD5: {bios.md5Hash}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1 ml-2">
                        <button
                          onClick={() => handleVerifyMd5(bios.id, bios.fileName)}
                          className="btn-retro text-[8px] px-2 py-1 bg-pirate-gold"
                          title="Verify MD5 hash"
                        >
                          🔐 VERIFY
                        </button>
                        <button
                          onClick={() => handleDeleteBios(bios.id, bios.fileName)}
                          className="btn-retro text-[8px] px-2 py-1 bg-blood-red"
                          title="Delete BIOS file"
                        >
                          🗑️ DELETE
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
