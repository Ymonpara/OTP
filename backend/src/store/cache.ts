interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();

  /**
   * Set a key in high-speed RAM memory cache with optional TTL in seconds (default: 300s / 5min)
   */
  public set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Get a cached value from RAM. Returns null if expired or not found.
   */
  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Invalidate/Delete specific cache key
   */
  public del(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cached keys
   */
  public flush(): void {
    this.cache.clear();
  }
}

export const memoryCache = new MemoryCache();
