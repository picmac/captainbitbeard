import { Response } from 'express';
import { AuthRequest } from '../../controllers/auth.controller';
import { CollectionController } from '../../controllers/collection.controller';
import { collectionService } from '../../services/collection.service';

jest.mock('../../services/collection.service');

const controller = new CollectionController();

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

describe('Collection Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCollection', () => {
    it('should create a collection', async () => {
      const mockCollection = {
        id: 'col-1',
        userId: 'user-123',
        name: 'My Collection',
        description: 'Test collection',
      };

      (collectionService.createCollection as jest.Mock).mockResolvedValue(mockCollection);

      const { req, res } = createMockReqRes();
      req.body = { name: 'My Collection', description: 'Test collection' };

      await controller.createCollection(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { collection: mockCollection },
      });
    });

    it('should return 400 if name empty', async () => {
      const { req, res } = createMockReqRes();
      req.body = { name: '  ' };

      await controller.createCollection(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getUserCollections', () => {
    it('should get all user collections', async () => {
      const mockCollections = [
        { id: 'col-1', name: 'Collection 1' },
        { id: 'col-2', name: 'Collection 2' },
      ];

      (collectionService.getUserCollections as jest.Mock).mockResolvedValue(mockCollections);

      const { req, res } = createMockReqRes();

      await controller.getUserCollections(req, res);

      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { collections: mockCollections },
      });
    });
  });

  describe('getCollectionById', () => {
    it('should get collection by id', async () => {
      const mockCollection = {
        id: 'col-1',
        name: 'My Collection',
        games: [],
      };

      (collectionService.getCollectionById as jest.Mock).mockResolvedValue(mockCollection);

      const { req, res } = createMockReqRes();
      req.params = { collectionId: 'col-1' };

      await controller.getCollectionById(req, res);

      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { collection: mockCollection },
      });
    });

    it('should return 404 if not found', async () => {
      (collectionService.getCollectionById as jest.Mock).mockRejectedValue(
        new Error('Collection not found')
      );

      const { req, res } = createMockReqRes();
      req.params = { collectionId: 'invalid' };

      await controller.getCollectionById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
