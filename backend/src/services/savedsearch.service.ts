import { PrismaClient, SavedSearch } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateSavedSearchData {
  userId: string;
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

interface UpdateSavedSearchData {
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

export class SavedSearchService {
  /**
   * Create a new saved search
   */
  async createSavedSearch(data: CreateSavedSearchData): Promise<SavedSearch> {
    return prisma.savedSearch.create({
      data: {
        userId: data.userId,
        name: data.name,
        query: data.query,
        systems: data.systems || [],
        genres: data.genres || [],
        developers: data.developers || [],
        publishers: data.publishers || [],
        yearFrom: data.yearFrom,
        yearTo: data.yearTo,
        players: data.players,
      },
    });
  }

  /**
   * Get all saved searches for a user
   */
  async getUserSavedSearches(userId: string): Promise<SavedSearch[]> {
    return prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a saved search by ID
   */
  async getSavedSearchById(id: string, userId: string): Promise<SavedSearch | null> {
    return prisma.savedSearch.findFirst({
      where: {
        id,
        userId, // Ensure user owns this search
      },
    });
  }

  /**
   * Update a saved search
   */
  async updateSavedSearch(
    id: string,
    userId: string,
    data: UpdateSavedSearchData
  ): Promise<SavedSearch> {
    // First verify ownership
    const existing = await this.getSavedSearchById(id, userId);
    if (!existing) {
      throw new Error('Saved search not found');
    }

    return prisma.savedSearch.update({
      where: { id },
      data: {
        name: data.name,
        query: data.query,
        systems: data.systems,
        genres: data.genres,
        developers: data.developers,
        publishers: data.publishers,
        yearFrom: data.yearFrom,
        yearTo: data.yearTo,
        players: data.players,
      },
    });
  }

  /**
   * Delete a saved search
   */
  async deleteSavedSearch(id: string, userId: string): Promise<void> {
    // First verify ownership
    const existing = await this.getSavedSearchById(id, userId);
    if (!existing) {
      throw new Error('Saved search not found');
    }

    await prisma.savedSearch.delete({
      where: { id },
    });
  }
}

export const savedSearchService = new SavedSearchService();
