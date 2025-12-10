import { config } from '../config';
import { logger } from '../utils/logger';

/**
 * ScreenScraper.fr API Service
 * API Documentation: https://www.screenscraper.fr/webapi2.php
 */

export interface ScreenScraperGameInfo {
  id: string;
  title: string;
  description?: string;
  releaseDate?: string;
  developer?: string;
  publisher?: string;
  genre?: string;
  players?: number;
  rating?: number;
  coverUrl?: string;
  screenshotUrls?: string[];
}

interface ScreenScraperGame {
  id: string;
  noms: Array<{ region: string; text: string }>;
  synopsis?: Array<{ langue: string; text: string }>;
  dates?: Array<{ region: string; text: string }>;
  developpeur?: { text: string };
  editeur?: { text: string };
  genres?: Array<{ id: string; noms: Array<{ text: string }> }>;
  joueurs?: { text: string };
  note?: { text: string };
  medias?: Array<{
    type: string;
    format: string;
    region?: string;
    url: string;
  }>;
}

interface ScreenScraperResponse {
  header: {
    APIversion: string;
    commandRequested: string;
    success: string;
  };
  response: {
    jeux?: ScreenScraperGame[];
  };
}

export class ScreenScraperService {
  private readonly baseUrl = 'https://www.screenscraper.fr/api2';
  private readonly user: string;
  private readonly password: string;
  private readonly devId: string;
  private readonly devPassword: string;
  private readonly softName: string;

  // System name mapping: EmulatorJS -> ScreenScraper
  private readonly systemMapping: Record<string, string> = {
    nes: 'nes',
    snes: 'snes',
    n64: 'n64',
    gb: 'gb',
    gbc: 'gbc',
    gba: 'gba',
    nds: 'nds',
    genesis: 'megadrive',
    megadrive: 'megadrive',
    mastersystem: 'mastersystem',
    gamegear: 'gamegear',
    saturn: 'saturn',
    dreamcast: 'dreamcast',
    psx: 'psx',
    ps1: 'psx',
    psp: 'psp',
    arcade: 'mame',
    mame: 'mame',
    neogeo: 'neogeo',
    atari2600: 'atari2600',
    atari5200: 'atari5200',
    atari7800: 'atari7800',
    lynx: 'lynx',
    jaguar: 'jaguar',
    virtualboy: 'virtualboy',
    wonderswan: 'wonderswan',
    wonderswancolor: 'wonderswancolor',
    ngp: 'ngp',
    ngpc: 'ngpc',
    pcengine: 'pcengine',
  };

  constructor() {
    this.user = config.screenscraper.user;
    this.password = config.screenscraper.password;
    this.devId = config.screenscraper.devId;
    this.devPassword = config.screenscraper.devPassword;
    this.softName = config.screenscraper.softName;
  }

  /**
   * Check if ScreenScraper credentials are configured
   */
  isConfigured(): boolean {
    return !!(this.user && this.password);
  }

  /**
   * Build API URL with authentication parameters
   */
  private buildUrl(endpoint: string, params: Record<string, string> = {}): string {
    const urlParams = new URLSearchParams({
      devid: this.devId || '',
      devpassword: this.devPassword || '',
      softname: this.softName,
      ssid: this.user,
      sspassword: this.password,
      output: 'json',
      ...params,
    });

    return `${this.baseUrl}/${endpoint}.php?${urlParams.toString()}`;
  }

  /**
   * Search game by ROM name and system
   */
  async searchGameByRomName(
    romName: string,
    system: string
  ): Promise<ScreenScraperGameInfo | null> {
    if (!this.isConfigured()) {
      logger.warn('ScreenScraper not configured, skipping metadata fetch');
      return null;
    }

    const screenScraperSystem = this.systemMapping[system.toLowerCase()] || system;

    // Clean ROM name (remove extension and common patterns)
    const cleanName = this.cleanRomName(romName);

    try {
      const url = this.buildUrl('jeuInfos', {
        systemeid: screenScraperSystem,
        romnom: cleanName,
      });

      logger.info(`Fetching metadata from ScreenScraper: ${cleanName} (${screenScraperSystem})`);

      const response = await fetch(url);

      if (!response.ok) {
        logger.error(`ScreenScraper API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = (await response.json()) as ScreenScraperResponse;

      if (data.header.success !== 'true' || !data.response.jeux || data.response.jeux.length === 0) {
        logger.info(`No results found for: ${cleanName}`);
        return null;
      }

      const game = data.response.jeux[0];
      return this.parseGameInfo(game);
    } catch (error) {
      logger.error({ err: error }, `Failed to fetch metadata for: ${romName}`);
      return null;
    }
  }

  /**
   * Search game by CRC/MD5 hash (more accurate)
   */
  async searchGameByCrc(
    crc: string,
    system: string
  ): Promise<ScreenScraperGameInfo | null> {
    if (!this.isConfigured()) {
      return null;
    }

    const screenScraperSystem = this.systemMapping[system.toLowerCase()] || system;

    try {
      const url = this.buildUrl('jeuInfos', {
        systemeid: screenScraperSystem,
        crc: crc,
      });

      logger.info(`Fetching metadata by CRC: ${crc}`);

      const response = await fetch(url);

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as ScreenScraperResponse;

      if (data.header.success !== 'true' || !data.response.jeux || data.response.jeux.length === 0) {
        return null;
      }

      const game = data.response.jeux[0];
      return this.parseGameInfo(game);
    } catch (error) {
      logger.error({ err: error }, `Failed to fetch metadata by CRC: ${crc}`);
      return null;
    }
  }

  /**
   * Parse ScreenScraper game response to our format
   */
  private parseGameInfo(game: ScreenScraperGame): ScreenScraperGameInfo {
    // Get title (prefer English/US)
    const title =
      game.noms.find((n: { region: string; text: string }) => n.region === 'us' || n.region === 'wor' || n.region === 'eu')?.text ||
      game.noms[0]?.text ||
      'Unknown';

    // Get description (prefer English)
    const description =
      game.synopsis?.find((s: { langue: string; text: string }) => s.langue === 'en' || s.langue === 'us')?.text;

    // Get release date (prefer US/World)
    const releaseDate =
      game.dates?.find((d: { region: string; text: string }) => d.region === 'us' || d.region === 'wor' || d.region === 'eu')?.text;

    // Get genre
    const genre = game.genres?.[0]?.noms?.[0]?.text;

    // Get players count
    const players = game.joueurs?.text ? parseInt(game.joueurs.text, 10) : undefined;

    // Get rating (0-20 scale, convert to 0-5)
    const rating = game.note?.text ? parseFloat(game.note.text) / 4 : undefined;

    // Get cover URL (prefer box-2D front)
    const coverMedia = game.medias?.find(
      (m: { type: string; format: string; region?: string; url: string }) =>
        m.type === 'box-2D' &&
        m.format === 'png' &&
        (!m.region || m.region === 'us' || m.region === 'wor')
    );
    const coverUrl = coverMedia?.url;

    // Get screenshots
    const screenshotUrls =
      game.medias
        ?.filter((m: { type: string; format: string; region?: string; url: string }) => m.type === 'ss' && m.format === 'png')
        .slice(0, 4) // Limit to 4 screenshots
        .map((m: { type: string; format: string; region?: string; url: string }) => m.url) || [];

    return {
      id: game.id,
      title,
      description,
      releaseDate,
      developer: game.developpeur?.text,
      publisher: game.editeur?.text,
      genre,
      players,
      rating,
      coverUrl,
      screenshotUrls,
    };
  }

  /**
   * Clean ROM name for better search results
   */
  private cleanRomName(romName: string): string {
    return (
      romName
        // Remove file extension
        .replace(/\.(zip|rar|7z|nes|snes|sfc|smc|gb|gbc|gba|n64|z64|nds|gen|md|sms|gg|iso|bin|cue|psx|psp)$/i, '')
        // Remove version/region tags in brackets/parentheses
        .replace(/[\[\(].*?[\]\)]/g, '')
        // Remove common suffixes
        .replace(/\s*-\s*(U|E|J|USA|Europe|Japan|World).*$/i, '')
        // Remove extra whitespace
        .replace(/\s+/g, ' ')
        .trim()
    );
  }

  /**
   * Download image from URL
   */
  async downloadImage(url: string): Promise<Buffer | null> {
    try {
      logger.info(`Downloading image: ${url}`);
      const response = await fetch(url);

      if (!response.ok) {
        logger.error(`Failed to download image: ${response.status}`);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      logger.error({ err: error }, `Failed to download image: ${url}`);
      return null;
    }
  }

  /**
   * Get system info
   */
  async getSystemInfo(_systemId: string): Promise<unknown> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const url = this.buildUrl('systemesListe');
      const response = await fetch(url);
      const data = await response.json();

      return data;
    } catch (error) {
      logger.error({ err: error }, 'Failed to fetch system info');
      return null;
    }
  }
}

// Singleton instance
export const screenScraperService = new ScreenScraperService();
