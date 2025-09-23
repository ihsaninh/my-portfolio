interface CacheEntry {
  response: string;
  timestamp: number;
  expiresAt: number;
}

class ChatCache {
  private cache = new Map<string, CacheEntry>();
  private cleanupInterval: NodeJS.Timeout | number;
  private readonly TTL = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_CACHE_SIZE = 500;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }

  private generateKey(userMsg: string, mode: string): string {
    // Normalize the message for better cache hits
    const normalized = userMsg
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[^\w\s]/g, "")
      .slice(0, 200); // Limit length

    return `${mode}:${normalized}`;
  }

  get(userMsg: string, mode: string): string | null {
    const key = this.generateKey(userMsg, mode);
    const entry = this.cache.get(key);

    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.response;
  }

  set(userMsg: string, mode: string, response: string): void {
    const key = this.generateKey(userMsg, mode);
    const now = Date.now();

    // Check if we need to evict old entries
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entries
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      for (let i = 0; i < Math.floor(this.MAX_CACHE_SIZE * 0.1); i++) {
        if (entries[i]) {
          this.cache.delete(entries[i][0]);
        }
      }
    }

    this.cache.set(key, {
      response,
      timestamp: now,
      expiresAt: now + this.TTL,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

export const chatCache = new ChatCache();

// Note: Cleanup is handled automatically by garbage collection in Edge Runtime
