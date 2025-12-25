/**
 * EmulatorJS Core Cache using IndexedDB
 * Caches emulator cores for faster repeat loading
 */

const DB_NAME = 'emulator-core-cache';
const DB_VERSION = 1;
const CORE_STORE = 'cores';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500MB

interface CachedCore {
  key: string;
  system: string;
  version: string;
  data: Blob;
  timestamp: number;
  size: number;
}

interface CacheStats {
  totalSize: number;
  coreCount: number;
  cores: { system: string; size: number; age: number }[];
}

class CoreCacheService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  /**
   * Initialize IndexedDB connection
   */
  private async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create core store if it doesn't exist
        if (!db.objectStoreNames.contains(CORE_STORE)) {
          const store = db.createObjectStore(CORE_STORE, { keyPath: 'key' });
          store.createIndex('system', 'system', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Generate cache key for a core
   */
  private getCoreKey(system: string, version: string = 'latest'): string {
    return `${system}-${version}`;
  }

  /**
   * Check if cached core is still valid (not expired)
   */
  private isValid(cachedCore: CachedCore): boolean {
    const age = Date.now() - cachedCore.timestamp;
    return age < CACHE_TTL;
  }

  /**
   * Get cached core
   */
  async get(system: string, version: string = 'latest'): Promise<Blob | null> {
    try {
      const db = await this.init();
      const key = this.getCoreKey(system, version);

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([CORE_STORE], 'readonly');
        const store = transaction.objectStore(CORE_STORE);
        const request = store.get(key);

        request.onsuccess = () => {
          const cachedCore = request.result as CachedCore | undefined;

          if (!cachedCore) {
            resolve(null);
            return;
          }

          // Check if cache is still valid
          if (!this.isValid(cachedCore)) {
            // Delete expired cache
            this.delete(system, version).catch(console.error);
            resolve(null);
            return;
          }

          resolve(cachedCore.data);
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get cached core:', error);
      return null;
    }
  }

  /**
   * Store core in cache
   */
  async set(
    system: string,
    data: Blob,
    version: string = 'latest'
  ): Promise<void> {
    try {
      const db = await this.init();
      const key = this.getCoreKey(system, version);

      // Check cache size before adding
      const stats = await this.getStats();
      if (stats.totalSize + data.size > MAX_CACHE_SIZE) {
        // Remove oldest cores to make space
        await this.evictOldest(data.size);
      }

      const cachedCore: CachedCore = {
        key,
        system,
        version,
        data,
        timestamp: Date.now(),
        size: data.size,
      };

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([CORE_STORE], 'readwrite');
        const store = transaction.objectStore(CORE_STORE);
        const request = store.put(cachedCore);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to cache core:', error);
      throw error;
    }
  }

  /**
   * Delete cached core
   */
  async delete(system: string, version: string = 'latest'): Promise<void> {
    try {
      const db = await this.init();
      const key = this.getCoreKey(system, version);

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([CORE_STORE], 'readwrite');
        const store = transaction.objectStore(CORE_STORE);
        const request = store.delete(key);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to delete cached core:', error);
      throw error;
    }
  }

  /**
   * Check if core is cached
   */
  async has(system: string, version: string = 'latest'): Promise<boolean> {
    const core = await this.get(system, version);
    return core !== null;
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    try {
      const db = await this.init();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([CORE_STORE], 'readonly');
        const store = transaction.objectStore(CORE_STORE);
        const request = store.getAll();

        request.onsuccess = () => {
          const cores = request.result as CachedCore[];
          const now = Date.now();

          const stats: CacheStats = {
            totalSize: 0,
            coreCount: cores.length,
            cores: cores.map((core) => ({
              system: core.system,
              size: core.size,
              age: now - core.timestamp,
            })),
          };

          stats.totalSize = cores.reduce((sum, core) => sum + core.size, 0);

          resolve(stats);
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return { totalSize: 0, coreCount: 0, cores: [] };
    }
  }

  /**
   * Evict oldest cores to free up space
   */
  private async evictOldest(requiredSpace: number): Promise<void> {
    try {
      const db = await this.init();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([CORE_STORE], 'readwrite');
        const store = transaction.objectStore(CORE_STORE);
        const index = store.index('timestamp');
        const request = index.openCursor();

        let freedSpace = 0;

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;

          if (!cursor || freedSpace >= requiredSpace) {
            resolve();
            return;
          }

          const core = cursor.value as CachedCore;
          freedSpace += core.size;
          cursor.delete();
          cursor.continue();
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to evict old cores:', error);
    }
  }

  /**
   * Clear all cached cores
   */
  async clear(): Promise<void> {
    try {
      const db = await this.init();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([CORE_STORE], 'readwrite');
        const store = transaction.objectStore(CORE_STORE);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }

  /**
   * Prefetch and cache a core
   */
  async prefetch(
    system: string,
    coreUrl: string,
    version: string = 'latest',
    onProgress?: (progress: number) => void
  ): Promise<void> {
    try {
      // Check if already cached
      const cached = await this.has(system, version);
      if (cached) {
        if (onProgress) onProgress(100);
        return;
      }

      // Download core
      if (onProgress) onProgress(0);

      const response = await fetch(coreUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const totalSize = parseInt(response.headers.get('content-length') || '0', 10);
      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error('Response body is null');
      }

      const chunks: Uint8Array[] = [];
      let receivedSize = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedSize += value.length;

        if (onProgress && totalSize > 0) {
          onProgress(Math.round((receivedSize / totalSize) * 100));
        }
      }

      const blob = new Blob(chunks as BlobPart[]);

      // Cache the core
      await this.set(system, blob, version);

      if (onProgress) onProgress(100);
    } catch (error) {
      console.error('Failed to prefetch core:', error);
      throw error;
    }
  }

  /**
   * Get core with automatic caching
   */
  async getOrFetch(
    system: string,
    coreUrl: string,
    version: string = 'latest',
    onProgress?: (stage: 'checking' | 'downloading' | 'caching', progress: number) => void
  ): Promise<Blob> {
    try {
      // Check cache first
      if (onProgress) onProgress('checking', 0);

      const cached = await this.get(system, version);
      if (cached) {
        if (onProgress) onProgress('checking', 100);
        return cached;
      }

      // Download and cache
      if (onProgress) onProgress('downloading', 0);

      const response = await fetch(coreUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const totalSize = parseInt(response.headers.get('content-length') || '0', 10);
      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error('Response body is null');
      }

      const chunks: Uint8Array[] = [];
      let receivedSize = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedSize += value.length;

        if (onProgress && totalSize > 0) {
          onProgress('downloading', Math.round((receivedSize / totalSize) * 100));
        }
      }

      const blob = new Blob(chunks as BlobPart[]);

      // Cache for next time
      if (onProgress) onProgress('caching', 0);
      await this.set(system, blob, version);
      if (onProgress) onProgress('caching', 100);

      return blob;
    } catch (error) {
      console.error('Failed to get or fetch core:', error);
      throw error;
    }
  }
}

// Singleton instance
export const coreCache = new CoreCacheService();

/**
 * Hook for React components to check cache status
 */
export async function checkCoreCache(system: string): Promise<{
  cached: boolean;
  age?: number;
}> {
  const cached = await coreCache.has(system);

  if (!cached) {
    return { cached: false };
  }

  const stats = await coreCache.getStats();
  const coreStats = stats.cores.find((c) => c.system === system);

  return {
    cached: true,
    age: coreStats?.age,
  };
}
