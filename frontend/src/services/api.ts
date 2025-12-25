import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Game {
  id: string;
  title: string;
  system: string;
  romPath: string;
  coverUrl?: string | null;
  boxArtUrl?: string | null;
  backgroundUrl?: string | null;
  logoUrl?: string | null;
  videoUrl?: string | null;
  backgroundMusicUrl?: string | null;
  animatedCoverUrl?: string | null;
  description?: string;
  releaseDate?: string;
  developer?: string;
  publisher?: string;
  genre?: string;
  players?: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
  romDownloadUrl?: string;
}

export interface GameListResponse {
  status: string;
  data: {
    games: Game[];
    total: number;
    limit: number;
    offset: number;
  };
}

export interface GameResponse {
  status: string;
  data: {
    game: Game;
  };
}

export interface SystemsResponse {
  status: string;
  data: {
    systems: Array<{ system: string; count: number }>;
  };
}

// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

// Auth API
export const authApi = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register
  register: async (data: RegisterRequest): Promise<{ message: string; user: User }> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Get current user
  me: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

// Add token to requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Favorites API
export interface FavoriteResponse {
  status: string;
  data: {
    favorite: {
      id: string;
      gameId: string;
      userId: string;
      createdAt: string;
    };
  };
}

export interface FavoriteStatusResponse {
  status: string;
  data: {
    isFavorited: boolean;
  };
}

export interface FavoriteCountResponse {
  status: string;
  data: {
    count: number;
  };
}

export const favoriteApi = {
  // Get all user favorites
  getUserFavorites: async (): Promise<GameListResponse> => {
    const response = await api.get('/favorites');
    return response.data;
  },

  // Check if game is favorited
  getFavoriteStatus: async (gameId: string): Promise<FavoriteStatusResponse> => {
    const response = await api.get(`/favorites/${gameId}/status`);
    return response.data;
  },

  // Add game to favorites
  addFavorite: async (gameId: string): Promise<FavoriteResponse> => {
    const response = await api.post(`/favorites/${gameId}`);
    return response.data;
  },

  // Remove game from favorites
  removeFavorite: async (gameId: string): Promise<void> => {
    await api.delete(`/favorites/${gameId}`);
  },

  // Toggle favorite status
  toggleFavorite: async (gameId: string): Promise<FavoriteStatusResponse> => {
    const response = await api.put(`/favorites/${gameId}/toggle`);
    return response.data;
  },

  // Get favorite count for a game
  getFavoriteCount: async (gameId: string): Promise<FavoriteCountResponse> => {
    const response = await api.get(`/favorites/${gameId}/count`);
    return response.data;
  },
};

// Play History API
export const playHistoryApi = {
  // Get recent games
  getRecentGames: async (limit: number = 10): Promise<GameListResponse> => {
    const response = await api.get('/play-history/recent', { params: { limit } });
    return response.data;
  },

  // Record play session
  recordPlay: async (gameId: string): Promise<void> => {
    await api.post(`/play-history/${gameId}`);
  },

  // Get play history for a game
  getGameHistory: async (gameId: string) => {
    const response = await api.get(`/play-history/game/${gameId}`);
    return response.data;
  },
};

// Collection Types
export enum CollectionVisibility {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
  UNLISTED = 'UNLISTED',
}

export enum SharePermission {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  visibility: CollectionVisibility;
  shareLink?: string | null;
  createdAt: string;
  updatedAt: string;
  games: CollectionGame[];
  user?: {
    id: string;
    username: string;
  };
  permission?: SharePermission;
}

export interface CollectionGame {
  collectionId: string;
  gameId: string;
  order: number;
  addedAt: string;
  game: Game;
}

export interface CollectionResponse {
  status: string;
  data: {
    collection: Collection;
  };
}

export interface CollectionsResponse {
  status: string;
  data: {
    collections: Collection[];
  };
}

// Collection API
export const collectionApi = {
  // Get all user collections
  getUserCollections: async (): Promise<CollectionsResponse> => {
    const response = await api.get('/collections');
    return response.data;
  },

  // Get a single collection by ID
  getCollectionById: async (collectionId: string): Promise<CollectionResponse> => {
    const response = await api.get(`/collections/${collectionId}`);
    return response.data;
  },

  // Create a new collection
  createCollection: async (
    name: string,
    description?: string
  ): Promise<CollectionResponse> => {
    const response = await api.post('/collections', { name, description });
    return response.data;
  },

  // Update a collection
  updateCollection: async (
    collectionId: string,
    updates: { name?: string; description?: string }
  ): Promise<CollectionResponse> => {
    const response = await api.patch(`/collections/${collectionId}`, updates);
    return response.data;
  },

  // Delete a collection
  deleteCollection: async (collectionId: string): Promise<void> => {
    await api.delete(`/collections/${collectionId}`);
  },

  // Add game to collection
  addGameToCollection: async (collectionId: string, gameId: string): Promise<void> => {
    await api.post(`/collections/${collectionId}/games/${gameId}`);
  },

  // Remove game from collection
  removeGameFromCollection: async (collectionId: string, gameId: string): Promise<void> => {
    await api.delete(`/collections/${collectionId}/games/${gameId}`);
  },

  // Reorder games in collection
  reorderGames: async (
    collectionId: string,
    gameOrders: Array<{ gameId: string; order: number }>
  ): Promise<CollectionResponse> => {
    const response = await api.put(`/collections/${collectionId}/reorder`, { gameOrders });
    return response.data;
  },

  // Get collections that contain a specific game
  getCollectionsWithGame: async (gameId: string): Promise<CollectionsResponse> => {
    const response = await api.get(`/collections/game/${gameId}`);
    return response.data;
  },
};

// Game API
export const gameApi = {
  // Get all games
  getGames: async (params?: {
    system?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<GameListResponse> => {
    const response = await api.get('/games', { params });
    return response.data;
  },

  // Get game by ID
  getGame: async (id: string): Promise<GameResponse> => {
    const response = await api.get(`/games/${id}`);
    return response.data;
  },

  // Get game for playing (with ROM download URL)
  getGameForPlay: async (id: string): Promise<GameResponse> => {
    const response = await api.get(`/games/${id}/play`);
    return response.data;
  },

  // Get games by system
  getGamesBySystem: async (system: string): Promise<GameListResponse> => {
    const response = await api.get(`/games/system/${system}`);
    return response.data;
  },

  // Search games
  searchGames: async (query: string): Promise<GameListResponse> => {
    const response = await api.get('/games/search', {
      params: { q: query },
    });
    return response.data;
  },

  // Get supported systems
  getSystems: async (): Promise<SystemsResponse> => {
    const response = await api.get('/games/systems');
    return response.data;
  },

  // Upload ROM
  uploadRom: async (
    romFile: File,
    metadata: {
      title: string;
      system: string;
      description?: string;
      developer?: string;
      publisher?: string;
      genre?: string;
      players?: number;
    },
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<GameResponse> => {
    const formData = new FormData();
    formData.append('rom', romFile);
    formData.append('title', metadata.title);
    formData.append('system', metadata.system);

    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.developer) formData.append('developer', metadata.developer);
    if (metadata.publisher) formData.append('publisher', metadata.publisher);
    if (metadata.genre) formData.append('genre', metadata.genre);
    if (metadata.players) formData.append('players', metadata.players.toString());

    const response = await api.post('/games/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });

    return response.data;
  },

  // Update game
  updateGame: async (
    id: string,
    updates: Partial<Omit<Game, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<GameResponse> => {
    const response = await api.patch(`/games/${id}`, updates);
    return response.data;
  },

  // Delete game
  deleteGame: async (id: string): Promise<void> => {
    await api.delete(`/games/${id}`);
  },

  // Bulk upload ROMs
  bulkUploadRoms: async (
    romFiles: File[],
    system: string,
    autoScrape: boolean = true,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<{
    status: string;
    data: {
      results: {
        total: number;
        successful: string[];
        failed: Array<{ filename: string; error: string }>;
      };
    };
  }> => {
    const formData = new FormData();

    // Append all ROM files
    romFiles.forEach((file) => {
      formData.append('roms', file);
    });

    formData.append('system', system);
    formData.append('autoScrape', autoScrape.toString());

    const response = await api.post('/games/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });

    return response.data;
  },

  // Scrape metadata for a single game
  scrapeMetadata: async (gameId: string): Promise<GameResponse> => {
    const response = await api.post(`/games/${gameId}/scrape`);
    return response.data;
  },

  // Bulk scrape metadata
  bulkScrapeMetadata: async (
    gameIds: string[]
  ): Promise<{
    status: string;
    data: {
      results: {
        success: number;
        failed: number;
        results: Array<{ gameId: string; success: boolean; error?: string }>;
      };
    };
  }> => {
    const response = await api.post('/games/bulk-scrape', { gameIds });
    return response.data;
  },
};

// User Profile Types
export interface UserProfile {
  id: string;
  userId: string;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  _count?: {
    collections: number;
    favorites: number;
    playHistory: number;
  };
}

export interface UserProfileResponse {
  status: string;
  data: {
    profile: UserProfile;
  };
}

export interface UpdateUserProfileRequest {
  avatarUrl?: string;
  bio?: string;
}

// User Profile API
export const userProfileApi = {
  // Get my profile
  getMyProfile: async (): Promise<UserProfileResponse> => {
    const response = await api.get('/profile/me');
    return response.data;
  },

  // Update my profile
  updateMyProfile: async (data: UpdateUserProfileRequest): Promise<UserProfileResponse> => {
    const response = await api.patch('/profile/me', data);
    return response.data;
  },

  // Get user profile by ID
  getUserProfile: async (userId: string): Promise<UserProfileResponse> => {
    const response = await api.get(`/profile/${userId}`);
    return response.data;
  },
};

// Collection Share Types
export interface CollectionShare {
  id: string;
  collectionId: string;
  userId: string;
  permission: SharePermission;
  createdAt: string;
  user: {
    id: string;
    username: string;
  };
}

export interface CollectionShareResponse {
  status: string;
  data: {
    share: CollectionShare;
  };
}

export interface CollectionSharesResponse {
  status: string;
  data: {
    shares: CollectionShare[];
  };
}

export interface SharedCollectionsResponse {
  status: string;
  data: {
    collections: Collection[];
  };
}

// Collection Sharing API
export const collectionShareApi = {
  // Update collection visibility
  updateVisibility: async (
    collectionId: string,
    visibility: CollectionVisibility
  ): Promise<CollectionResponse> => {
    const response = await api.patch(`/collection-sharing/${collectionId}/visibility`, {
      visibility,
    });
    return response.data;
  },

  // Generate share link
  generateShareLink: async (
    collectionId: string
  ): Promise<{
    status: string;
    data: { collection: Collection; shareUrl: string };
  }> => {
    const response = await api.post(`/collection-sharing/${collectionId}/share-link`);
    return response.data;
  },

  // Remove share link
  removeShareLink: async (collectionId: string): Promise<CollectionResponse> => {
    const response = await api.delete(`/collection-sharing/${collectionId}/share-link`);
    return response.data;
  },

  // Share with specific user
  shareWithUser: async (
    collectionId: string,
    userId: string,
    permission: SharePermission
  ): Promise<CollectionShareResponse> => {
    const response = await api.post(`/collection-sharing/${collectionId}/share`, {
      userId,
      permission,
    });
    return response.data;
  },

  // Get users with access to collection
  getSharedUsers: async (collectionId: string): Promise<CollectionSharesResponse> => {
    const response = await api.get(`/collection-sharing/${collectionId}/shares`);
    return response.data;
  },

  // Remove user access
  removeUserAccess: async (collectionId: string, userId: string): Promise<void> => {
    await api.delete(`/collection-sharing/${collectionId}/shares/${userId}`);
  },

  // Get collections shared with me
  getSharedWithMe: async (): Promise<SharedCollectionsResponse> => {
    const response = await api.get('/collection-sharing/shared-with-me');
    return response.data;
  },

  // Get collection by share link (public, no auth required)
  getByShareLink: async (shareLink: string): Promise<CollectionResponse> => {
    const response = await api.get(`/collection-sharing/shared/${shareLink}`);
    return response.data;
  },
};

// Save State Types
export interface SaveState {
  id: string;
  userId: string;
  gameId: string;
  slot: number;
  statePath: string;
  screenshotUrl?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  game: {
    id: string;
    title: string;
    system: string;
    coverUrl?: string | null;
  };
}

export interface SaveStateResponse {
  status: string;
  data: {
    saveState: SaveState;
  };
}

export interface SaveStatesResponse {
  status: string;
  data: {
    saveStates: SaveState[];
  };
}

export interface CreateSaveStateRequest {
  slot: number;
  stateData: string; // Base64 encoded save state data
  screenshot?: string; // Base64 encoded screenshot
  description?: string;
}

// Save State API
export const saveStateApi = {
  // Create or update save state
  createSaveState: async (
    gameId: string,
    data: CreateSaveStateRequest
  ): Promise<SaveStateResponse> => {
    const response = await api.post(`/save-states/game/${gameId}`, data);
    return response.data;
  },

  // Get all save states for current user
  getMySaveStates: async (): Promise<SaveStatesResponse> => {
    const response = await api.get('/save-states/my-saves');
    return response.data;
  },

  // Get save states for a specific game
  getSaveStatesByGame: async (gameId: string): Promise<SaveStatesResponse> => {
    const response = await api.get(`/save-states/game/${gameId}`);
    return response.data;
  },

  // Get specific save state by ID
  getSaveStateById: async (id: string): Promise<SaveStateResponse> => {
    const response = await api.get(`/save-states/${id}`);
    return response.data;
  },

  // Load save state data (returns blob)
  loadSaveState: async (id: string): Promise<Blob> => {
    const response = await api.get(`/save-states/${id}/load`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Update save state description
  updateSaveState: async (id: string, description?: string): Promise<SaveStateResponse> => {
    const response = await api.patch(`/save-states/${id}`, { description });
    return response.data;
  },

  // Delete save state
  deleteSaveState: async (id: string): Promise<void> => {
    await api.delete(`/save-states/${id}`);
  },
};

// Screenshot Types
export interface Screenshot {
  id: string;
  gameId: string;
  url: string;
  type: string;
  category?: string;
  caption?: string;
  order: number;
  createdAt: string;
}

export interface ScreenshotResponse {
  status: string;
  data: {
    screenshot: Screenshot;
  };
}

export interface ScreenshotsResponse {
  status: string;
  data: {
    screenshots: Screenshot[];
  };
}

export interface AddScreenshotRequest {
  url?: string;
  imageData?: string; // Base64 encoded image
  type?: string;
  order?: number;
}

// Screenshot API
export const screenshotApi = {
  // Get screenshots for a game
  getScreenshots: async (gameId: string, type?: string): Promise<ScreenshotsResponse> => {
    const params = type ? { type } : {};
    const response = await api.get(`/screenshots/game/${gameId}`, { params });
    return response.data;
  },

  // Add screenshot (admin)
  addScreenshot: async (
    gameId: string,
    data: AddScreenshotRequest
  ): Promise<ScreenshotResponse> => {
    const response = await api.post(`/screenshots/game/${gameId}`, data);
    return response.data;
  },

  // Bulk add screenshots (admin)
  bulkAddScreenshots: async (
    gameId: string,
    screenshots: AddScreenshotRequest[]
  ): Promise<{ status: string; data: { count: number } }> => {
    const response = await api.post(`/screenshots/game/${gameId}/bulk`, { screenshots });
    return response.data;
  },

  // Reorder screenshots (admin)
  reorderScreenshots: async (
    updates: Array<{ id: string; order: number }>
  ): Promise<ScreenshotsResponse> => {
    const response = await api.put('/screenshots/reorder', { updates });
    return response.data;
  },

  // Delete screenshot (admin)
  deleteScreenshot: async (id: string): Promise<void> => {
    await api.delete(`/screenshots/${id}`);
  },
};

// Admin Types
export interface SystemStats {
  overview: {
    totalGames: number;
    totalUsers: number;
    totalCollections: number;
    totalSaveStates: number;
    totalPlaySessions: number;
    totalScreenshots: number;
  };
  usersByRole: Array<{ role: string; count: number }>;
  gamesBySystem: Array<{ system: string; count: number }>;
  recentUsers: Array<{
    id: string;
    username: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
  recentGames: Array<{
    id: string;
    title: string;
    system: string;
    coverUrl?: string | null;
    createdAt: string;
  }>;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    collections: number;
    favorites: number;
    playHistory: number;
    saveStates: number;
  };
}

export interface StorageStats {
  totalGames: number;
  gamesWithCover: number;
  totalScreenshots: number;
  totalSaveStates: number;
}

export interface ActivityStats {
  newGames: number;
  newUsers: number;
  playSessions: number;
  newCollections: number;
}

export interface DuplicateGroup {
  id: string;
  title: string;
  system: string;
  createdAt: string;
}

// Admin API
export const adminApi = {
  // Get system statistics
  getSystemStats: async (): Promise<{ status: string; data: SystemStats }> => {
    const response = await api.get('/admin/stats/system');
    return response.data;
  },

  // Get storage statistics
  getStorageStats: async (): Promise<{ status: string; data: StorageStats }> => {
    const response = await api.get('/admin/stats/storage');
    return response.data;
  },

  // Get activity statistics
  getActivityStats: async (): Promise<{ status: string; data: ActivityStats }> => {
    const response = await api.get('/admin/stats/activity');
    return response.data;
  },

  // Get all users
  getAllUsers: async (includeStats = false): Promise<{ status: string; data: { users: AdminUser[] } }> => {
    const params = includeStats ? { includeStats: 'true' } : {};
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  // Update user role
  updateUserRole: async (userId: string, role: string): Promise<{ status: string; data: { user: AdminUser } }> => {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  // Delete user
  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
  },

  // Bulk delete games
  bulkDeleteGames: async (gameIds: string[]): Promise<{ status: string; data: { deletedCount: number } }> => {
    const response = await api.post('/admin/games/bulk-delete', { gameIds });
    return response.data;
  },

  // Bulk update games
  bulkUpdateGames: async (
    gameIds: string[],
    updates: { system?: string; genre?: string; developer?: string; publisher?: string }
  ): Promise<{ status: string; data: { updatedCount: number } }> => {
    const response = await api.patch('/admin/games/bulk-update', { gameIds, updates });
    return response.data;
  },

  // Find duplicate games
  findDuplicates: async (): Promise<{ status: string; data: { duplicates: DuplicateGroup[][] } }> => {
    const response = await api.get('/admin/games/duplicates');
    return response.data;
  },
};

// Saved Search Types
export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  query?: string;
  systems: string[];
  genres: string[];
  developers: string[];
  publishers: string[];
  yearFrom?: number;
  yearTo?: number;
  players?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavedSearchData {
  name: string;
  query?: string;
  systems?: string[];
  genres?: string[];
  developers?: string[];
  publishers?: string[];
  yearFrom?: number;
  yearTo?: number;
  players?: number;
}

export interface UpdateSavedSearchData {
  name?: string;
  query?: string;
  systems?: string[];
  genres?: string[];
  developers?: string[];
  publishers?: string[];
  yearFrom?: number;
  yearTo?: number;
  players?: number;
}

// Saved Search API
export const savedSearchApi = {
  // Create a new saved search
  createSavedSearch: async (data: CreateSavedSearchData): Promise<{ status: string; data: { savedSearch: SavedSearch } }> => {
    const response = await api.post('/saved-searches', data);
    return response.data;
  },

  // Get all saved searches for current user
  getUserSavedSearches: async (): Promise<{ status: string; data: { savedSearches: SavedSearch[] } }> => {
    const response = await api.get('/saved-searches');
    return response.data;
  },

  // Get a saved search by ID
  getSavedSearchById: async (id: string): Promise<{ status: string; data: { savedSearch: SavedSearch } }> => {
    const response = await api.get(`/saved-searches/${id}`);
    return response.data;
  },

  // Update a saved search
  updateSavedSearch: async (id: string, data: UpdateSavedSearchData): Promise<{ status: string; data: { savedSearch: SavedSearch } }> => {
    const response = await api.patch(`/saved-searches/${id}`, data);
    return response.data;
  },

  // Delete a saved search
  deleteSavedSearch: async (id: string): Promise<void> => {
    await api.delete(`/saved-searches/${id}`);
  },

  // Execute a saved search
  executeSavedSearch: async (search: SavedSearch): Promise<{ status: string; data: { games: Game[]; count: number } }> => {
    const params = new URLSearchParams();

    if (search.query) params.append('q', search.query);
    if (search.systems.length > 0) params.append('systems', search.systems.join(','));
    if (search.genres.length > 0) params.append('genres', search.genres.join(','));
    if (search.developers.length > 0) params.append('developers', search.developers.join(','));
    if (search.publishers.length > 0) params.append('publishers', search.publishers.join(','));
    if (search.yearFrom) params.append('yearFrom', search.yearFrom.toString());
    if (search.yearTo) params.append('yearTo', search.yearTo.toString());
    if (search.players) params.append('players', search.players.toString());

    const response = await api.get(`/games/advanced-search?${params.toString()}`);
    return response.data;
  },
};

// Advanced Search API
export interface AdvancedSearchParams {
  query?: string;
  systems?: string[];
  genres?: string[];
  developers?: string[];
  publishers?: string[];
  yearFrom?: number;
  yearTo?: number;
  players?: number;
  limit?: number;
}

export const advancedSearchApi = {
  search: async (params: AdvancedSearchParams): Promise<{ status: string; data: { games: Game[]; count: number } }> => {
    const urlParams = new URLSearchParams();

    if (params.query) urlParams.append('q', params.query);
    if (params.systems && params.systems.length > 0) urlParams.append('systems', params.systems.join(','));
    if (params.genres && params.genres.length > 0) urlParams.append('genres', params.genres.join(','));
    if (params.developers && params.developers.length > 0) urlParams.append('developers', params.developers.join(','));
    if (params.publishers && params.publishers.length > 0) urlParams.append('publishers', params.publishers.join(','));
    if (params.yearFrom) urlParams.append('yearFrom', params.yearFrom.toString());
    if (params.yearTo) urlParams.append('yearTo', params.yearTo.toString());
    if (params.players) urlParams.append('players', params.players.toString());
    if (params.limit) urlParams.append('limit', params.limit.toString());

    const response = await api.get(`/games/advanced-search?${urlParams.toString()}`);
    return response.data;
  },
};

// Game Version Types
export interface GameVersion {
  id: string;
  gameId: string;
  versionName: string;
  region: string;
  revision?: string;
  romPath: string;
  md5Hash: string;
  fileSize: string;
  releaseDate?: string;
  changes?: string;
  isPreferred: boolean;
  createdAt: string;
  updatedAt: string;
}

// Game Version API
export const gameVersionApi = {
  // Get all versions for a game
  getGameVersions: async (gameId: string): Promise<{ status: string; data: { versions: GameVersion[] } }> => {
    const response = await api.get(`/game-versions/${gameId}`);
    return response.data;
  },

  // Create a new game version
  createGameVersion: async (
    gameId: string,
    formData: FormData
  ): Promise<{ status: string; data: { version: GameVersion } }> => {
    const response = await api.post(`/game-versions/${gameId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Set preferred version
  setPreferredVersion: async (
    gameId: string,
    versionId: string
  ): Promise<{ status: string; data: { version: GameVersion } }> => {
    const response = await api.patch(`/game-versions/${gameId}/${versionId}/preferred`);
    return response.data;
  },

  // Delete a game version
  deleteGameVersion: async (gameId: string, versionId: string): Promise<void> => {
    await api.delete(`/game-versions/${gameId}/${versionId}`);
  },

  // Get download URL for a version's ROM
  getVersionDownloadUrl: async (gameId: string, versionId: string): Promise<{ status: string; data: { url: string } }> => {
    const response = await api.get(`/game-versions/${gameId}/${versionId}/download`);
    return response.data;
  },
};

// BIOS File Types
export interface BiosFile {
  id: string;
  system: string;
  fileName: string;
  filePath: string;
  md5Hash: string;
  fileSize: string;
  description?: string;
  region?: string;
  version?: string;
  required: boolean;
  verified: boolean;
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// BIOS API
export const biosApi = {
  // Get all BIOS files
  getAllBiosFiles: async (): Promise<{ status: string; data: { biosFiles: BiosFile[] } }> => {
    const response = await api.get('/bios');
    return response.data;
  },

  // Get BIOS files by system
  getBiosFilesBySystem: async (system: string): Promise<{ status: string; data: { biosFiles: BiosFile[] } }> => {
    const response = await api.get(`/bios/system/${system}`);
    return response.data;
  },

  // Get systems requiring BIOS
  getSystemsRequiringBios: async (): Promise<{ status: string; data: { systems: string[] } }> => {
    const response = await api.get('/bios/systems/requiring-bios');
    return response.data;
  },

  // Upload BIOS file
  uploadBiosFile: async (formData: FormData): Promise<{ status: string; data: { biosFile: BiosFile } }> => {
    const response = await api.post('/bios/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update BIOS file metadata
  updateBiosFile: async (
    id: string,
    data: {
      description?: string;
      region?: string;
      version?: string;
      required?: boolean;
      verified?: boolean;
    }
  ): Promise<{ status: string; data: { biosFile: BiosFile } }> => {
    const response = await api.patch(`/bios/${id}`, data);
    return response.data;
  },

  // Delete BIOS file
  deleteBiosFile: async (id: string): Promise<void> => {
    await api.delete(`/bios/${id}`);
  },

  // Get download URL for BIOS file
  getBiosDownloadUrl: async (id: string): Promise<{ status: string; data: { url: string } }> => {
    const response = await api.get(`/bios/${id}/download`);
    return response.data;
  },

  // Verify BIOS MD5 hash
  verifyBiosMd5: async (id: string, expectedMd5: string): Promise<{ status: string; data: { isValid: boolean } }> => {
    const response = await api.post(`/bios/${id}/verify`, { expectedMd5 });
    return response.data;
  },
};

// Media API
export const mediaApi = {
  // Upload trailer video
  uploadTrailer: async (gameId: string, videoFile: File) => {
    const formData = new FormData();
    formData.append('video', videoFile);

    const token = localStorage.getItem('token');
    const response = await api.post(`/media/games/${gameId}/media/trailer`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Upload background music
  uploadBackgroundMusic: async (gameId: string, musicFile: File) => {
    const formData = new FormData();
    formData.append('music', musicFile);

    const token = localStorage.getItem('token');
    const response = await api.post(`/media/games/${gameId}/media/music`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Upload animated cover
  uploadAnimatedCover: async (gameId: string, coverFile: File) => {
    const formData = new FormData();
    formData.append('cover', coverFile);

    const token = localStorage.getItem('token');
    const response = await api.post(`/media/games/${gameId}/media/animated-cover`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Upload categorized screenshot
  uploadCategorizedScreenshot: async (
    gameId: string,
    screenshotFile: File,
    category?: string,
    caption?: string
  ) => {
    const formData = new FormData();
    formData.append('screenshot', screenshotFile);
    if (category) formData.append('category', category);
    if (caption) formData.append('caption', caption);

    const token = localStorage.getItem('token');
    const response = await api.post(`/media/games/${gameId}/media/screenshot`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Delete trailer
  deleteTrailer: async (gameId: string) => {
    const token = localStorage.getItem('token');
    const response = await api.delete(`/media/games/${gameId}/media/trailer`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Delete background music
  deleteBackgroundMusic: async (gameId: string) => {
    const token = localStorage.getItem('token');
    const response = await api.delete(`/media/games/${gameId}/media/music`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Delete animated cover
  deleteAnimatedCover: async (gameId: string) => {
    const token = localStorage.getItem('token');
    const response = await api.delete(`/media/games/${gameId}/media/animated-cover`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get screenshots by category
  getScreenshotsByCategory: async (gameId: string, category?: string) => {
    const token = localStorage.getItem('token');
    const params = category ? `?category=${category}` : '';
    const response = await api.get(`/media/games/${gameId}/media/screenshots${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Update screenshot metadata
  updateScreenshot: async (screenshotId: string, data: { category?: string; caption?: string }) => {
    const token = localStorage.getItem('token');
    const response = await api.patch(`/media/screenshots/${screenshotId}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
