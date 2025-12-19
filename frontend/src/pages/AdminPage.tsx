import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RomUpload } from '../components/RomUpload';
import { BulkRomUpload } from '../components/BulkRomUpload';
import { BiosManager } from '../components/BiosManager';
import {
  adminApi,
  type SystemStats,
  type AdminUser,
  type ActivityStats,
  type StorageStats,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

type TabType = 'dashboard' | 'upload' | 'users' | 'bulk' | 'duplicates' | 'bios';

export function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [uploadKey, setUploadKey] = useState(0);
  const [uploadMode, setUploadMode] = useState<'single' | 'bulk'>('bulk');

  // Dashboard state
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // User management state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Duplicates state
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [loadingDuplicates, setLoadingDuplicates] = useState(false);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboardStats();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'duplicates') {
      loadDuplicates();
    }
  }, [activeTab]);

  const loadDashboardStats = async () => {
    setLoadingStats(true);
    try {
      const [system, activity, storage] = await Promise.all([
        adminApi.getSystemStats(),
        adminApi.getActivityStats(),
        adminApi.getStorageStats(),
      ]);
      setSystemStats(system.data);
      setActivityStats(activity.data);
      setStorageStats(storage.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await adminApi.getAllUsers(true);
      setUsers(response.data.users);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadDuplicates = async () => {
    setLoadingDuplicates(true);
    try {
      const response = await adminApi.findDuplicates();
      setDuplicates(response.data.duplicates);
    } catch (err) {
      console.error('Failed to load duplicates:', err);
    } finally {
      setLoadingDuplicates(false);
    }
  };

  const handleUploadComplete = () => {
    setUploadKey((prev) => prev + 1);
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    if (!window.confirm(`Change user role to ${role}?`)) return;

    try {
      await adminApi.updateUserRole(userId, role);
      await loadUsers();
      alert('User role updated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!window.confirm(`Delete user "${username}"? This cannot be undone!`)) return;

    try {
      await adminApi.deleteUser(userId);
      await loadUsers();
      alert('User deleted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="border-4 border-blood-red bg-blood-red/20 p-6 text-center">
          <p className="text-pixel text-sm text-skull-white mb-4">
            ⛔ ACCESS DENIED
          </p>
          <Link to="/library" className="btn-retro text-xs">
            ← BACK TO LIBRARY
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-pixel mb-2 text-2xl text-pirate-gold">
          🏴‍☠️ ADMIN PANEL
        </h1>
        <p className="text-pixel text-xs text-skull-white">
          Captain's Quarters - System Management
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex justify-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`btn-retro text-xs ${
            activeTab === 'dashboard' ? 'bg-pirate-gold' : 'opacity-50'
          }`}
        >
          📊 DASHBOARD
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`btn-retro text-xs ${
            activeTab === 'upload' ? 'bg-pirate-gold' : 'opacity-50'
          }`}
        >
          📦 ROM UPLOAD
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`btn-retro text-xs ${
            activeTab === 'users' ? 'bg-pirate-gold' : 'opacity-50'
          }`}
        >
          👥 USERS
        </button>
        <button
          onClick={() => setActiveTab('duplicates')}
          className={`btn-retro text-xs ${
            activeTab === 'duplicates' ? 'bg-pirate-gold' : 'opacity-50'
          }`}
        >
          🔍 DUPLICATES
        </button>
        <button
          onClick={() => setActiveTab('bios')}
          className={`btn-retro text-xs ${
            activeTab === 'bios' ? 'bg-pirate-gold' : 'opacity-50'
          }`}
        >
          💾 BIOS FILES
        </button>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {loadingStats ? (
              <div className="text-center text-pixel text-pirate-gold">
                LOADING STATISTICS...
              </div>
            ) : (
              <>
                {/* Overview Stats */}
                {systemStats && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatCard
                      icon="🎮"
                      label="Games"
                      value={systemStats.overview.totalGames}
                    />
                    <StatCard
                      icon="👥"
                      label="Users"
                      value={systemStats.overview.totalUsers}
                    />
                    <StatCard
                      icon="📚"
                      label="Collections"
                      value={systemStats.overview.totalCollections}
                    />
                    <StatCard
                      icon="💾"
                      label="Save States"
                      value={systemStats.overview.totalSaveStates}
                    />
                    <StatCard
                      icon="🎯"
                      label="Play Sessions"
                      value={systemStats.overview.totalPlaySessions}
                    />
                    <StatCard
                      icon="📸"
                      label="Screenshots"
                      value={systemStats.overview.totalScreenshots}
                    />
                  </div>
                )}

                {/* Activity Stats */}
                {activityStats && (
                  <div className="border-4 border-wood-brown bg-sand-beige p-6">
                    <h2 className="text-pixel text-lg text-ocean-dark mb-4">
                      📈 ACTIVITY (LAST 30 DAYS)
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <ActivityCard label="New Games" value={activityStats.newGames} />
                      <ActivityCard label="New Users" value={activityStats.newUsers} />
                      <ActivityCard label="Play Sessions" value={activityStats.playSessions} />
                      <ActivityCard label="New Collections" value={activityStats.newCollections} />
                    </div>
                  </div>
                )}

                {/* Games by System */}
                {systemStats && systemStats.gamesBySystem.length > 0 && (
                  <div className="border-4 border-wood-brown bg-sand-beige p-6">
                    <h2 className="text-pixel text-lg text-ocean-dark mb-4">
                      🎮 GAMES BY SYSTEM
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {systemStats.gamesBySystem.map((item) => (
                        <div
                          key={item.system}
                          className="border-2 border-wood-brown bg-white p-3"
                        >
                          <div className="text-pixel text-xs text-ocean-dark">
                            {item.system.toUpperCase()}
                          </div>
                          <div className="text-pixel text-lg text-pirate-gold">
                            {item.count}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Recent Users */}
                  {systemStats && systemStats.recentUsers.length > 0 && (
                    <div className="border-4 border-wood-brown bg-sand-beige p-6">
                      <h2 className="text-pixel text-sm text-ocean-dark mb-4">
                        👥 RECENT USERS
                      </h2>
                      <div className="space-y-2">
                        {systemStats.recentUsers.slice(0, 5).map((u) => (
                          <div
                            key={u.id}
                            className="border-2 border-wood-brown bg-white p-2 text-pixel text-xs"
                          >
                            <div className="text-ocean-dark">{u.username}</div>
                            <div className="text-wood-brown text-[10px]">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Games */}
                  {systemStats && systemStats.recentGames.length > 0 && (
                    <div className="border-4 border-wood-brown bg-sand-beige p-6">
                      <h2 className="text-pixel text-sm text-ocean-dark mb-4">
                        🎮 RECENT GAMES
                      </h2>
                      <div className="space-y-2">
                        {systemStats.recentGames.slice(0, 5).map((g) => (
                          <div
                            key={g.id}
                            className="border-2 border-wood-brown bg-white p-2 text-pixel text-xs"
                          >
                            <div className="text-ocean-dark">{g.title}</div>
                            <div className="text-wood-brown text-[10px]">
                              {g.system.toUpperCase()} •{' '}
                              {new Date(g.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ROM Upload Tab */}
        {activeTab === 'upload' && (
          <div>
            <div className="mb-6 flex justify-center gap-4">
              <button
                onClick={() => setUploadMode('single')}
                className={`btn-retro text-xs ${
                  uploadMode === 'single' ? 'bg-pirate-gold' : 'opacity-50'
                }`}
              >
                📦 SINGLE UPLOAD
              </button>
              <button
                onClick={() => setUploadMode('bulk')}
                className={`btn-retro text-xs ${
                  uploadMode === 'bulk' ? 'bg-pirate-gold' : 'opacity-50'
                }`}
              >
                📚 BULK UPLOAD
              </button>
            </div>

            {uploadMode === 'single' ? (
              <RomUpload key={uploadKey} onUploadComplete={handleUploadComplete} />
            ) : (
              <BulkRomUpload key={uploadKey} onUploadComplete={handleUploadComplete} />
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="border-4 border-wood-brown bg-sand-beige p-6">
            <h2 className="text-pixel text-lg text-ocean-dark mb-4">
              👥 USER MANAGEMENT
            </h2>

            {loadingUsers ? (
              <div className="text-center text-pixel text-wood-brown">
                LOADING USERS...
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="border-2 border-wood-brown bg-white p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="text-pixel text-sm text-ocean-dark">
                        {u.username}
                      </div>
                      <div className="text-pixel text-xs text-wood-brown">
                        {u.email}
                      </div>
                      {u._count && (
                        <div className="text-pixel text-[10px] text-wood-brown mt-1">
                          Collections: {u._count.collections} • Favorites:{' '}
                          {u._count.favorites} • Saves: {u._count.saveStates}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 items-center">
                      <span
                        className={`text-pixel text-xs px-2 py-1 border-2 ${
                          u.role === 'ADMIN'
                            ? 'border-pirate-gold bg-pirate-gold'
                            : 'border-wood-brown bg-sand-beige'
                        }`}
                      >
                        {u.role}
                      </span>

                      {u.id !== user?.id && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateUserRole(
                                u.id,
                                u.role === 'ADMIN' ? 'USER' : 'ADMIN'
                              )
                            }
                            className="btn-retro text-[10px] px-2"
                          >
                            {u.role === 'ADMIN' ? '👤 DEMOTE' : '⭐ PROMOTE'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            className="btn-retro bg-blood-red text-[10px] px-2"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Duplicates Tab */}
        {activeTab === 'duplicates' && (
          <div className="border-4 border-wood-brown bg-sand-beige p-6">
            <h2 className="text-pixel text-lg text-ocean-dark mb-4">
              🔍 DUPLICATE GAMES
            </h2>

            {loadingDuplicates ? (
              <div className="text-center text-pixel text-wood-brown">
                SCANNING FOR DUPLICATES...
              </div>
            ) : duplicates.length === 0 ? (
              <div className="text-center text-pixel text-wood-brown">
                ✅ NO DUPLICATES FOUND
              </div>
            ) : (
              <div className="space-y-4">
                {duplicates.map((group, index) => (
                  <div
                    key={index}
                    className="border-2 border-blood-red bg-white p-4"
                  >
                    <div className="text-pixel text-sm text-ocean-dark mb-2">
                      {group[0].title} ({group[0].system.toUpperCase()})
                    </div>
                    <div className="text-pixel text-xs text-wood-brown mb-3">
                      {group.length} duplicates found
                    </div>
                    <div className="space-y-2">
                      {group.map((game: any) => (
                        <div
                          key={game.id}
                          className="text-pixel text-xs text-wood-brown border-l-2 border-wood-brown pl-2"
                        >
                          ID: {game.id} • Added:{' '}
                          {new Date(game.createdAt).toLocaleDateString()}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BIOS Tab */}
        {activeTab === 'bios' && <BiosManager />}
      </div>

      {/* Back to Library */}
      <div className="mt-8 text-center">
        <Link to="/library" className="btn-retro text-xs">
          ← BACK TO LIBRARY
        </Link>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="border-4 border-wood-brown bg-sand-beige p-4 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-pixel text-2xl text-pirate-gold mb-1">{value}</div>
      <div className="text-pixel text-xs text-wood-brown">{label}</div>
    </div>
  );
}

// Activity Card Component
function ActivityCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-2 border-wood-brown bg-white p-3 text-center">
      <div className="text-pixel text-xl text-ocean-dark">{value}</div>
      <div className="text-pixel text-xs text-wood-brown">{label}</div>
    </div>
  );
}
