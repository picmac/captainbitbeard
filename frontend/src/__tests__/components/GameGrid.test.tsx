import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { GameGrid } from '../../components/GameGrid';
import * as api from '../../services/api';

// Mock the API
vi.mock('../../services/api');

const mockGames = [
  {
    id: '1',
    title: 'Super Mario Bros',
    system: 'nes',
    romPath: 'roms/nes/mario.nes',
    coverUrl: 'http://localhost:9000/covers/1.jpg',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    title: 'The Legend of Zelda',
    system: 'nes',
    romPath: 'roms/nes/zelda.nes',
    coverUrl: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

describe('GameGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('should render loading state initially', () => {
    vi.mocked(api.gameApi.getGames).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithRouter(<GameGrid />);

    expect(screen.getByText('Loading games...')).toBeInTheDocument();
  });

  it('should render games after loading', async () => {
    vi.mocked(api.gameApi.getGames).mockResolvedValue({
      status: 'success',
      data: {
        games: mockGames,
        total: 2,
        limit: 50,
        offset: 0,
      },
    });

    renderWithRouter(<GameGrid />);

    await waitFor(() => {
      expect(screen.getByText('Super Mario Bros')).toBeInTheDocument();
      expect(screen.getByText('The Legend of Zelda')).toBeInTheDocument();
    });
  });

  it('should display cover images', async () => {
    vi.mocked(api.gameApi.getGames).mockResolvedValue({
      status: 'success',
      data: {
        games: mockGames,
        total: 2,
        limit: 50,
        offset: 0,
      },
    });

    renderWithRouter(<GameGrid />);

    await waitFor(() => {
      const img = screen.getByAlt('Super Mario Bros') as HTMLImageElement;
      expect(img).toBeInTheDocument();
      expect(img.src).toContain('covers/1.jpg');
    });
  });

  it('should show fallback icon when no cover available', async () => {
    vi.mocked(api.gameApi.getGames).mockResolvedValue({
      status: 'success',
      data: {
        games: mockGames,
        total: 2,
        limit: 50,
        offset: 0,
      },
    });

    renderWithRouter(<GameGrid />);

    await waitFor(() => {
      expect(screen.getAllByText('🎮')).toHaveLength(1); // Zelda has no cover
    });
  });

  it('should filter games by system', async () => {
    vi.mocked(api.gameApi.getGamesBySystem).mockResolvedValue({
      status: 'success',
      data: {
        games: mockGames,
        total: 2,
        limit: 50,
        offset: 0,
      },
    });

    renderWithRouter(<GameGrid system="nes" />);

    await waitFor(() => {
      expect(api.gameApi.getGamesBySystem).toHaveBeenCalledWith('nes');
    });
  });

  it('should search games by query', async () => {
    vi.mocked(api.gameApi.searchGames).mockResolvedValue({
      status: 'success',
      data: {
        games: [mockGames[0]],
        total: 1,
        limit: 50,
        offset: 0,
      },
    });

    renderWithRouter(<GameGrid searchQuery="mario" />);

    await waitFor(() => {
      expect(api.gameApi.searchGames).toHaveBeenCalledWith('mario');
    });
  });

  it('should show error message on API failure', async () => {
    vi.mocked(api.gameApi.getGames).mockRejectedValue({
      response: { data: { message: 'Failed to fetch games' } },
    });

    renderWithRouter(<GameGrid />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch games/)).toBeInTheDocument();
    });
  });

  it('should show empty state when no games found', async () => {
    vi.mocked(api.gameApi.getGames).mockResolvedValue({
      status: 'success',
      data: {
        games: [],
        total: 0,
        limit: 50,
        offset: 0,
      },
    });

    renderWithRouter(<GameGrid />);

    await waitFor(() => {
      expect(screen.getByText('No games found')).toBeInTheDocument();
    });
  });

  it('should display system badge for each game', async () => {
    vi.mocked(api.gameApi.getGames).mockResolvedValue({
      status: 'success',
      data: {
        games: mockGames,
        total: 2,
        limit: 50,
        offset: 0,
      },
    });

    renderWithRouter(<GameGrid />);

    await waitFor(() => {
      const badges = screen.getAllByText('NES');
      expect(badges.length).toBeGreaterThan(0);
    });
  });
});
