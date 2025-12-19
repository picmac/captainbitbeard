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
