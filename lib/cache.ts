// Simple in-memory cache
// For a multi-instance production environment (e.g., scalable Render deployment), 
// this would ideally be backed by Redis. For this switch, memory cache is a great V1.

interface CacheEntry<T> {
    value: T;
    expiry: number;
}

class InMemoryCache {
    private cache: Map<string, CacheEntry<any>> = new Map();

    /**
     * Set a value in the cache.
     * @param key Cache key
     * @param value Value to store
     * @param ttlMs Time to live in milliseconds (default: 5 minutes)
     */
    set<T>(key: string, value: T, ttlMs: number = 5 * 60 * 1000): void {
        const expiry = Date.now() + ttlMs;
        this.cache.set(key, { value, expiry });
    }

    /**
     * Get a value from the cache. Returns null if expired or not found.
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }

        return entry.value as T;
    }

    /**
     * Invalidate a specific key.
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear all expired entries to free up memory.
     */
    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiry) {
                this.cache.delete(key);
            }
        }
    }
}

export const cache = new InMemoryCache();

// Run cleanup every 15 minutes to prevent memory leaks in long-running node processes
if (typeof setInterval !== 'undefined') {
    setInterval(() => cache.cleanup(), 15 * 60 * 1000);
}
