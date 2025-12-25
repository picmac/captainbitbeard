import { GameService } from '../../services/game.service';
import { PrismaClient } from '@prisma/client';

// Get mocked Prisma instance
const prisma = new PrismaClient() as any;

describe('GameService', () => {
  let gameService: GameService;

  beforeEach(() => {
    gameService = new GameService();
    jest.clearAllMocks();
  });

  describe('createGame', () => {
    it('should create a game with ROM upload', async () => {
      const mockGame = {
        id: 'game-123',
        title: 'Super Mario Bros',
        system: 'nes',
        romPath: 'roms/nes/super-mario.nes',
        coverUrl: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.game.create.mockResolvedValue(mockGame);

      const result = await gameService.createGame({
        title: 'Super Mario Bros',
        system: 'nes',
        romBuffer: Buffer.from('mock-rom'),
        romFileName: 'super-mario.nes',
      });

      expect(result).toEqual(mockGame);
      expect(prisma.game.create).toHaveBeenCalled();
    });

    it('should handle cover image if provided', async () => {
      const mockGame = {
        id: 'game-123',
        title: 'Test Game',
        system: 'snes',
        romPath: 'roms/snes/test.sfc',
        coverUrl: 'http://localhost:9000/covers/game-123.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.game.create.mockResolvedValue(mockGame);

      const result = await gameService.createGame({
        title: 'Test Game',
        system: 'snes',
        romBuffer: Buffer.from('mock-rom'),
        romFileName: 'test.sfc',
        coverBuffer: Buffer.from('mock-cover'),
      });

      expect(result.coverUrl).toBeTruthy();
    });

    it('should calculate MD5 hash', async () => {
      const mockGame = {
        id: 'game-123',
        title: 'Test',
        system: 'nes',
        romPath: 'roms/nes/test.nes',
        metadata: {
          md5Hash: expect.any(String),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.game.create.mockResolvedValue(mockGame);

      await gameService.createGame({
        title: 'Test',
        system: 'nes',
        romBuffer: Buffer.from('test-data'),
        romFileName: 'test.nes',
      });

      const createCall = prisma.game.create.mock.calls[0][0];
      expect(createCall.data.metadata.create.md5Hash).toBeTruthy();
    });
  });

  describe('getAllGames', () => {
    it('should return paginated games', async () => {
      const mockGames = [
        { id: '1', title: 'Game 1', system: 'nes' },
        { id: '2', title: 'Game 2', system: 'snes' },
      ];

      prisma.game.findMany.mockResolvedValue(mockGames);
      prisma.game.count.mockResolvedValue(2);

      const result = await gameService.getAllGames({
        limit: 10,
        offset: 0,
      });

      expect(result.games).toEqual(mockGames);
      expect(result.total).toBe(2);
    });

    it('should filter by system', async () => {
      const mockGames = [{ id: '1', title: 'NES Game', system: 'nes' }];

      prisma.game.findMany.mockResolvedValue(mockGames);
      prisma.game.count.mockResolvedValue(1);

      await gameService.getAllGames({ system: 'nes' });

      const findManyCall = prisma.game.findMany.mock.calls[0][0];
      expect(findManyCall.where.system).toBe('nes');
    });

    it('should search by title', async () => {
      const mockGames = [{ id: '1', title: 'Super Mario', system: 'nes' }];

      prisma.game.findMany.mockResolvedValue(mockGames);
      prisma.game.count.mockResolvedValue(1);

      await gameService.getAllGames({ search: 'mario' });

      const findManyCall = prisma.game.findMany.mock.calls[0][0];
      expect(findManyCall.where.title).toEqual({
        contains: 'mario',
        mode: 'insensitive',
      });
    });
  });

  describe('getGameById', () => {
    it('should return game with metadata', async () => {
      const mockGame = {
        id: 'game-123',
        title: 'Test Game',
        system: 'nes',
        metadata: {
          fileSize: BigInt(1024),
        },
      };

      prisma.game.findUnique.mockResolvedValue(mockGame);

      const result = await gameService.getGameById('game-123');

      expect(result).toEqual(mockGame);
      expect(prisma.game.findUnique).toHaveBeenCalledWith({
        where: { id: 'game-123' },
        include: {
          metadata: true,
          screenshots: true,
        },
      });
    });

    it('should return null if game not found', async () => {
      prisma.game.findUnique.mockResolvedValue(null);

      const result = await gameService.getGameById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getGameWithDownloadUrl', () => {
    it.skip('should return game with ROM download URL', async () => {
      const mockGame = {
        id: 'game-123',
        title: 'Test',
        system: 'nes',
        romPath: 'roms/nes/test.nes',
      };

      prisma.game.findUnique.mockResolvedValue(mockGame);

      const result = await gameService.getGameWithDownloadUrl('game-123');

      expect(result).toHaveProperty('romDownloadUrl');
      expect(result?.romDownloadUrl).toBe('https://mock-url.com/file');
    });
  });

  describe('searchGames', () => {
    it('should search games by title', async () => {
      const mockGames = [
        { id: '1', title: 'Super Mario Bros' },
        { id: '2', title: 'Super Mario World' },
      ];

      prisma.game.findMany.mockResolvedValue(mockGames);

      const result = await gameService.searchGames('mario');

      expect(result.length).toBe(2);
      expect(result).toEqual(mockGames);
    });

    it('should limit search results to 20', async () => {
      await gameService.searchGames('test');

      const findManyCall = prisma.game.findMany.mock.calls[0][0];
      expect(findManyCall.take).toBe(20);
    });
  });

  describe('updateGame', () => {
    it('should update game metadata', async () => {
      const mockUpdatedGame = {
        id: 'game-123',
        title: 'Updated Title',
        description: 'New description',
      };

      prisma.game.update.mockResolvedValue(mockUpdatedGame);

      const result = await gameService.updateGame('game-123', {
        title: 'Updated Title',
        description: 'New description',
      });

      expect(result).toEqual(mockUpdatedGame);
      expect(prisma.game.update).toHaveBeenCalledWith({
        where: { id: 'game-123' },
        data: {
          title: 'Updated Title',
          description: 'New description',
        },
        include: { metadata: true },
      });
    });
  });

  describe('deleteGame', () => {
    it('should delete game and associated files', async () => {
      const mockGame = {
        id: 'game-123',
        title: 'Test',
        romPath: 'roms/nes/test.nes',
        coverUrl: 'http://localhost:9000/covers/game-123.jpg',
      };

      prisma.game.findUnique.mockResolvedValue(mockGame);
      prisma.game.delete.mockResolvedValue(mockGame);

      await gameService.deleteGame('game-123');

      expect(prisma.game.delete).toHaveBeenCalledWith({
        where: { id: 'game-123' },
      });
    });

    it('should throw error if game not found', async () => {
      prisma.game.findUnique.mockResolvedValue(null);

      await expect(gameService.deleteGame('non-existent')).rejects.toThrow(
        'Game not found'
      );
    });
  });

  describe('getSupportedSystems', () => {
    it('should return systems with game counts and metadata', async () => {
      const mockSystems = [
        { system: 'nes', _count: { system: 10 } },
        { system: 'snes', _count: { system: 5 } },
      ];

      prisma.game.groupBy.mockResolvedValue(mockSystems);

      const result = await gameService.getSupportedSystems();

      // Should return all 48 supported systems
      expect(result.length).toBeGreaterThan(40);

      // Check that NES system has correct data
      const nesSystem = result.find(s => s.id === 'nes');
      expect(nesSystem).toMatchObject({
        id: 'nes',
        name: 'Nintendo Entertainment System',
        manufacturer: 'Nintendo',
        core: 'fceumm',
        biosRequired: false,
        count: 10,
      });
      expect(nesSystem?.extensions).toContain('nes');

      // Check that SNES system has correct data
      const snesSystem = result.find(s => s.id === 'snes');
      expect(snesSystem).toMatchObject({
        id: 'snes',
        name: 'Super Nintendo',
        manufacturer: 'Nintendo',
        core: 'snes9x',
        biosRequired: false,
        count: 5,
      });
      expect(snesSystem?.extensions).toContain('sfc');

      // Check that systems with no games have count of 0
      const n64System = result.find(s => s.id === 'n64');
      expect(n64System?.count).toBe(0);
    });
  });
});
