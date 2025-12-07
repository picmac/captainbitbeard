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
};
