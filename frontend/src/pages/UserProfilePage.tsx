import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { userProfileApi, type UserProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function UserProfilePage() {
  const { user } = useAuth();
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  // Determine if viewing own profile or another user's profile
  const isOwnProfile = !userId || userId === user?.id;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [user, userId, navigate]);

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = isOwnProfile
        ? await userProfileApi.getMyProfile()
        : await userProfileApi.getUserProfile(userId!);

      setProfile(response.data.profile);
      setAvatarUrl(response.data.profile.avatarUrl || '');
      setBio(response.data.profile.bio || '');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await userProfileApi.updateMyProfile({
        avatarUrl: avatarUrl.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      setProfile(response.data.profile);
      setEditing(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setAvatarUrl(profile?.avatarUrl || '');
    setBio(profile?.bio || '');
    setEditing(false);
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-pixel text-pirate-gold text-xl">LOADING...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          <div className="border-4 border-wood-brown bg-sand-beige p-6 text-center">
            <p className="text-pixel text-wood-brown mb-4">{error || 'Profile not found'}</p>
            <Link to="/library" className="btn-retro text-xs">
              ← BACK TO LIBRARY
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-pixel mb-4 text-center text-2xl text-pirate-gold">
          👤 USER PROFILE
        </h1>

        {/* Back to Library */}
        <div className="mx-auto max-w-4xl mb-4">
          <Link to="/library" className="btn-retro text-xs inline-block">
            ← BACK TO LIBRARY
          </Link>
        </div>
      </div>

      {/* Profile Content */}
      <div className="mx-auto max-w-4xl">
        <div className="border-4 border-wood-brown bg-sand-beige p-6">
          {/* Avatar and Username */}
          <div className="flex items-center gap-6 mb-6">
            {/* Avatar */}
            <div className="w-24 h-24 border-4 border-wood-brown bg-pirate-blue flex items-center justify-center overflow-hidden">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-pixel text-4xl">👤</span>
              )}
            </div>

            {/* Username and Stats */}
            <div className="flex-1">
              <h2 className="text-pixel text-2xl text-wood-brown mb-2">
                {profile.user.username}
              </h2>
              {profile._count && (
                <div className="text-pixel text-sm text-wood-brown space-y-1">
                  <div>📚 Collections: {profile._count.collections}</div>
                  <div>⭐ Favorites: {profile._count.favorites}</div>
                  <div>🎮 Games Played: {profile._count.playHistory}</div>
                </div>
              )}
            </div>

            {/* Edit Button */}
            {isOwnProfile && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="btn-retro text-xs"
              >
                ✏️ EDIT
              </button>
            )}
          </div>

          {/* Bio Section */}
          {editing ? (
            /* Edit Form */
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-pixel text-sm text-wood-brown block mb-2">
                  AVATAR URL
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  className="w-full border-2 border-wood-brown bg-white p-2 text-pixel text-sm focus:outline-none focus:border-pirate-gold"
                />
              </div>

              <div>
                <label className="text-pixel text-sm text-wood-brown block mb-2">
                  BIO
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  maxLength={500}
                  className="w-full border-2 border-wood-brown bg-white p-2 text-pixel text-sm focus:outline-none focus:border-pirate-gold resize-none"
                />
                <div className="text-pixel text-xs text-wood-brown mt-1">
                  {bio.length}/500 characters
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-retro text-xs flex-1"
                >
                  {saving ? 'SAVING...' : '💾 SAVE'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="btn-retro text-xs flex-1"
                >
                  ❌ CANCEL
                </button>
              </div>
            </form>
          ) : (
            /* Display Bio */
            <div>
              <h3 className="text-pixel text-sm text-wood-brown mb-2">BIO</h3>
              <div className="border-2 border-wood-brown bg-white p-4 min-h-[100px]">
                <p className="text-pixel text-sm text-wood-brown whitespace-pre-wrap">
                  {profile.bio || 'No bio yet...'}
                </p>
              </div>
            </div>
          )}

          {/* Member Since */}
          <div className="mt-6 text-pixel text-xs text-wood-brown text-right">
            Member since: {new Date(profile.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
