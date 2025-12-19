import { Response } from 'express';
import { AuthRequest } from './auth.controller';
import { savedSearchService } from '../services/savedsearch.service';

interface CreateSavedSearchBody {
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

interface UpdateSavedSearchBody {
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

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export class SavedSearchController {
  /**
   * Create a new saved search
   * POST /api/saved-searches
   */
  async createSavedSearch(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const body = req.body as CreateSavedSearchBody;

      if (!body.name || body.name.trim() === '') {
        res.status(400).json({
          status: 'error',
          message: 'Search name is required',
        });
        return;
      }

      const savedSearch = await savedSearchService.createSavedSearch({
        userId,
        name: body.name,
        query: body.query,
        systems: body.systems,
        genres: body.genres,
        developers: body.developers,
        publishers: body.publishers,
        yearFrom: body.yearFrom,
        yearTo: body.yearTo,
        players: body.players,
      });

      res.status(201).json({
        status: 'success',
        data: { savedSearch },
      });
    } catch (error: unknown) {
      console.error('Error creating saved search:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create saved search',
      });
    }
  }

  /**
   * Get all saved searches for current user
   * GET /api/saved-searches
   */
  async getUserSavedSearches(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const savedSearches = await savedSearchService.getUserSavedSearches(userId);

      res.json({
        status: 'success',
        data: { savedSearches },
      });
    } catch (error: unknown) {
      console.error('Error fetching saved searches:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch saved searches',
      });
    }
  }

  /**
   * Get a saved search by ID
   * GET /api/saved-searches/:id
   */
  async getSavedSearchById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const savedSearch = await savedSearchService.getSavedSearchById(id, userId);

      if (!savedSearch) {
        res.status(404).json({
          status: 'error',
          message: 'Saved search not found',
        });
        return;
      }

      res.json({
        status: 'success',
        data: { savedSearch },
      });
    } catch (error: unknown) {
      console.error('Error fetching saved search:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch saved search',
      });
    }
  }

  /**
   * Update a saved search
   * PATCH /api/saved-searches/:id
   */
  async updateSavedSearch(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const updates = req.body as UpdateSavedSearchBody;

      const savedSearch = await savedSearchService.updateSavedSearch(id, userId, updates);

      res.json({
        status: 'success',
        data: { savedSearch },
      });
    } catch (error: unknown) {
      console.error('Error updating saved search:', error);
      const statusCode = getErrorMessage(error).includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to update saved search',
      });
    }
  }

  /**
   * Delete a saved search
   * DELETE /api/saved-searches/:id
   */
  async deleteSavedSearch(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await savedSearchService.deleteSavedSearch(id, userId);

      res.json({
        status: 'success',
        message: 'Saved search deleted successfully',
      });
    } catch (error: unknown) {
      console.error('Error deleting saved search:', error);
      const statusCode = getErrorMessage(error).includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to delete saved search',
      });
    }
  }
}

export const savedSearchController = new SavedSearchController();
