import { Response } from 'express';
import { AuthRequest } from '../../controllers/auth.controller';
import { SaveStateController } from '../../controllers/savestate.controller';
import { saveStateService } from '../../services/savestate.service';
import { minioService } from '../../services/minio.service';

// Mock services
jest.mock('../../services/savestate.service');
jest.mock('../../services/minio.service');

const controller = new SaveStateController();

function createMockReqRes() {
  const req = {
    user: { id: 'user-123', username: 'testuser', role: 'USER' },
    params: {},
    body: {},
  } as unknown as AuthRequest;

  const res = {
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
  } as unknown as Response;

  return { req, res };
}

describe('SaveState Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSaveState', () => {
    it('should create a save state', async () => {
      const mockSaveState = {
        id: 'save-1',
        userId: 'user-123',
        gameId: 'game-1',
        slot: 1,
        statePath: 'save-states/user-123/game-1/slot-1.state',
      };

      (minioService.uploadFile as jest.Mock).mockResolvedValue('save-states/...');
      (saveStateService.createOrUpdateSaveState as jest.Mock).mockResolvedValue(mockSaveState);

      const { req, res } = createMockReqRes();
      req.params = { gameId: 'game-1' };
      req.body = {
        slot: 1,
        stateData: Buffer.from('save data').toString('base64'),
        description: 'Level 5',
      };

      await controller.createSaveState(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { saveState: mockSaveState },
      });
    });

    it('should return 400 if slot invalid', async () => {
      const { req, res } = createMockReqRes();
      req.params = { gameId: 'game-1' };
      req.body = { slot: 11, stateData: 'data' };

      await controller.createSaveState(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if no state data', async () => {
      const { req, res } = createMockReqRes();
      req.params = { gameId: 'game-1' };
      req.body = { slot: 1 };

      await controller.createSaveState(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getSaveStatesByGame', () => {
    it('should get all save states for a game', async () => {
      const mockStates = [
        { id: 'save-1', slot: 1 },
        { id: 'save-2', slot: 2 },
      ];

      (saveStateService.getSaveStatesByGame as jest.Mock).mockResolvedValue(mockStates);

      const { req, res } = createMockReqRes();
      req.params = { gameId: 'game-1' };

      await controller.getSaveStatesByGame(req, res);

      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { saveStates: mockStates },
      });
    });
  });
});
