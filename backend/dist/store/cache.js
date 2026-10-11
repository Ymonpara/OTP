"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryCache = exports.MemoryCache = void 0;
class MemoryCache {
    cache = new Map();
    /**
     * Set a key in high-speed RAM memory cache with optional TTL in seconds (default: 300s / 5min)
     */
    set(key, value, ttlSeconds = 300) {
        const expiresAt = Date.now() + ttlSeconds * 1000;
        this.cache.set(key, { value, expiresAt });
    }
    /**
     * Get a cached value from RAM. Returns null if expired or not found.
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }
    /**
     * Invalidate/Delete specific cache key
     */
    del(key) {
        this.cache.delete(key);
    }
    /**
     * Clear all cached keys
     */
    flush() {
        this.cache.clear();
    }
}
exports.MemoryCache = MemoryCache;
exports.memoryCache = new MemoryCache();
