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
    jeu?: ScreenScraperGame;  // Single game result
    jeux?: ScreenScraperGame[];  // Multiple games result (search)
  };
}

export class ScreenScraperService {
  private readonly baseUrl = 'https://www.screenscraper.fr/api2';
  private readonly user: string;
  private readonly password: string;
  private readonly devId: string;
  private readonly devPassword: string;
  private readonly softName: string;

  // System name mapping: EmulatorJS -> ScreenScraper System ID
  // Full list: https://www.screenscraper.fr/api2/systemesListe.php
  private readonly systemMapping: Record<string, string> = {
    nes: '3',           // Nintendo NES
    snes: '4',          // Super Nintendo
    n64: '14',          // Nintendo 64
    gb: '9',            // Game Boy
    gbc: '10',          // Game Boy Color
    gba: '12',          // Game Boy Advance
    nds: '15',          // Nintendo DS
    genesis: '1',       // Sega Genesis/Mega Drive
    megadrive: '1',     // Sega Mega Drive
    sms: '2',           // Sega Master System
    mastersystem: '2',  // Sega Master System
    gg: '21',           // Sega Game Gear
    gamegear: '21',     // Sega Game Gear
    saturn: '22',       // Sega Saturn
    dreamcast: '23',    // Sega Dreamcast
    psx: '57',          // Sony PlayStation
    ps1: '57',          // Sony PlayStation
    ps2: '58',          // Sony PlayStation 2
    psp: '61',          // Sony PSP
    arcade: '75',       // MAME
    mame: '75',         // MAME
    neogeo: '142',      // SNK Neo Geo
    atari2600: '26',    // Atari 2600
    atari5200: '40',    // Atari 5200
    atari7800: '41',    // Atari 7800
    lynx: '28',         // Atari Lynx
    jaguar: '27',       // Atari Jaguar
    virtualboy: '11',   // Nintendo Virtual Boy
    wonderswan: '45',   // WonderSwan
    wonderswancolor: '46', // WonderSwan Color
    ngp: '82',          // Neo Geo Pocket
    ngpc: '83',         // Neo Geo Pocket Color
    pcengine: '31',     // PC Engine/TurboGrafx-16
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

      if (data.header.success !== 'true') {
        logger.info(`No results found for: ${cleanName}`);
        return null;
      }

      // API returns either 'jeu' (single) or 'jeux' (multiple)
      const game = data.response.jeu || data.response.jeux?.[0];
      if (!game) {
        logger.info(`No results found for: ${cleanName}`);
        return null;
      }

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
    let cleaned = romName
      // Remove file extension
      .replace(/\.(zip|rar|7z|nes|snes|sfc|smc|gb|gbc|gba|n64|z64|nds|gen|md|sms|gg|iso|bin|cue|psx|psp)$/i, '')
      // Remove version/region tags in brackets/parentheses
      .replace(/[\[\(].*?[\]\)]/g, '')
      // Remove common suffixes
      .replace(/\s*-\s*(U|E|J|USA|Europe|Japan|World).*$/i, '')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      .trim();

    // Move "The" from end to beginning (e.g., "Addams Family, The" -> "The Addams Family")
    cleaned = cleaned.replace(/,\s*The$/i, '');

    // Remove "The" from beginning for better matching (many games drop "The")
    cleaned = cleaned.replace(/^The\s+/i, '');

    return cleaned.trim();
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
