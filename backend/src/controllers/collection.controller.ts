import { Response } from 'express';
import { AuthRequest } from './auth.controller';
import { collectionService } from '../services/collection.service';

export class CollectionController {
  // Create a new collection
  async createCollection(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { name, description } = req.body;

      if (!name || name.trim().length === 0) {
        res.status(400).json({
          status: 'error',
          message: 'Collection name is required',
        });
        return;
      }

      const collection = await collectionService.createCollection(
        userId,
        name.trim(),
        description?.trim()
      );

      res.status(201).json({
        status: 'success',
        data: { collection },
      });
    } catch (error: any) {
      console.error('Error creating collection:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to create collection',
      });
    }
  }

  // Get all collections for the current user
  async getUserCollections(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const collections = await collectionService.getUserCollections(userId);

      res.json({
        status: 'success',
        data: { collections },
      });
    } catch (error: any) {
      console.error('Error fetching collections:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch collections',
      });
    }
  }

  // Get a single collection by ID
  async getCollectionById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { collectionId } = req.params;

      const collection = await collectionService.getCollectionById(collectionId, userId);

      res.json({
        status: 'success',
        data: { collection },
      });
    } catch (error: any) {
      console.error('Error fetching collection:', error);
      const statusCode = error.message === 'Collection not found' ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: error.message || 'Failed to fetch collection',
      });
    }
  }

  // Update a collection
  async updateCollection(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { collectionId } = req.params;
      const { name, description } = req.body;

      const updates: { name?: string; description?: string } = {};
      if (name !== undefined) updates.name = name.trim();
      if (description !== undefined) updates.description = description?.trim();

      const collection = await collectionService.updateCollection(
        collectionId,
        userId,
        updates
      );

      res.json({
        status: 'success',
        data: { collection },
      });
    } catch (error: any) {
      console.error('Error updating collection:', error);
      const statusCode = error.message === 'Collection not found' ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: error.message || 'Failed to update collection',
      });
    }
  }

  // Delete a collection
  async deleteCollection(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { collectionId } = req.params;

      await collectionService.deleteCollection(collectionId, userId);

      res.json({
        status: 'success',
        message: 'Collection deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting collection:', error);
      const statusCode = error.message === 'Collection not found' ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: error.message || 'Failed to delete collection',
      });
    }
  }

  // Add a game to a collection
  async addGameToCollection(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { collectionId, gameId } = req.params;

      const collectionGame = await collectionService.addGameToCollection(
        collectionId,
        gameId,
        userId
      );

      res.status(201).json({
        status: 'success',
        data: { collectionGame },
      });
    } catch (error: any) {
      console.error('Error adding game to collection:', error);
      let statusCode = 500;
      if (error.message === 'Collection not found' || error.message === 'Game not found') {
        statusCode = 404;
      } else if (error.message === 'Game already in collection') {
        statusCode = 409;
      }
      res.status(statusCode).json({
        status: 'error',
        message: error.message || 'Failed to add game to collection',
      });
    }
  }

  // Remove a game from a collection
  async removeGameFromCollection(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { collectionId, gameId } = req.params;

      await collectionService.removeGameFromCollection(collectionId, gameId, userId);

      res.json({
        status: 'success',
        message: 'Game removed from collection',
      });
    } catch (error: any) {
      console.error('Error removing game from collection:', error);
      const statusCode = error.message === 'Collection not found' ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: error.message || 'Failed to remove game from collection',
      });
    }
  }

  // Reorder games in a collection
  async reorderGames(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { collectionId } = req.params;
      const { gameOrders } = req.body;

      if (!Array.isArray(gameOrders)) {
        res.status(400).json({
          status: 'error',
          message: 'gameOrders must be an array',
        });
        return;
      }

      const collection = await collectionService.reorderGames(
        collectionId,
        userId,
        gameOrders
      );

      res.json({
        status: 'success',
        data: { collection },
      });
    } catch (error: any) {
      console.error('Error reordering games:', error);
      const statusCode = error.message === 'Collection not found' ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: error.message || 'Failed to reorder games',
      });
    }
  }

  // Get collections that contain a specific game
  async getCollectionsWithGame(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { gameId } = req.params;

      const collections = await collectionService.getCollectionsWithGame(gameId, userId);

      res.json({
        status: 'success',
        data: { collections },
      });
    } catch (error: any) {
      console.error('Error fetching collections with game:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch collections',
      });
    }
  }
}

export const collectionController = new CollectionController();
