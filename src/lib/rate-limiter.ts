interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly maxEntries: number;
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    windowMs: number = 60 * 60 * 1000,
    maxRequests: number = 20,
    maxEntries: number = 1000
  ) {
    this.windowMs = windowMs; // 1 hour default
    this.maxRequests = maxRequests; // 20 requests per hour default
    this.maxEntries = maxEntries; // Maximum entries to prevent memory overflow

    // Clean up expired entries every 30 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 30 * 60 * 1000);
  }

  check(identifier: string): {
    success: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const key = identifier;

    // Prevent memory overflow by limiting entries
    if (this.store.size >= this.maxEntries) {
      this.cleanup();
      // If still at limit after cleanup, reject oldest entry
      if (this.store.size >= this.maxEntries) {
        const oldestKey = this.store.keys().next().value;
        if (oldestKey) {
          this.store.delete(oldestKey);
        }
      }
    }

    let entry = this.store.get(key);

    // If no entry exists or the window has expired, create a new one
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      this.store.set(key, entry);

      return {
        success: true,
        remaining: this.maxRequests - 1,
        resetTime: entry.resetTime,
      };
    }

    // If within the window, check if limit is exceeded
    if (entry.count >= this.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Increment count and allow
    entry.count++;
    this.store.set(key, entry);

    return {
      success: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
        deletedCount++;
      }
    }

    // Log cleanup for monitoring (optional)
    if (deletedCount > 0 && process.env.NODE_ENV === "development") {
      console.log(`Rate limiter cleaned up ${deletedCount} expired entries`);
    }
  }

  // Method to gracefully shutdown and clear intervals
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }

  // Method to get current status without incrementing
  getStatus(identifier: string): { remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now > entry.resetTime) {
      return {
        remaining: this.maxRequests,
        resetTime: now + this.windowMs,
      };
    }

    return {
      remaining: Math.max(0, this.maxRequests - entry.count),
      resetTime: entry.resetTime,
    };
  }
}

// Create a singleton instance for the chat API
// 20 requests per hour for chat API, max 1000 entries to prevent memory issues
export const chatRateLimiter = new RateLimiter(60 * 60 * 1000, 20, 1000);

// Helper function to get client IP from request
export function getClientIP(request: Request): string {
  // Try to get IP from various headers (for different deployment environments)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const clientIP = request.headers.get("x-client-ip");

  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    const ip = forwardedFor.split(",")[0].trim();

    // Basic IP validation to prevent injection
    if (isValidIP(ip)) {
      return ip;
    }
  }

  if (realIP && isValidIP(realIP)) {
    return realIP;
  }

  if (clientIP && isValidIP(clientIP)) {
    return clientIP;
  }

  // Fallback for local development
  return "unknown";
}

// Helper function to validate IP format
function isValidIP(ip: string): boolean {
  // IPv4 validation
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  // IPv6 validation (basic)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

// Helper function to create rate limit response
export function createRateLimitResponse(
  remaining: number,
  resetTime: number
): Response {
  const resetInSeconds = Math.ceil((resetTime - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: "Rate limit exceeded",
      message: "Too many requests. Please try again later.",
      retryAfter: resetInSeconds,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": resetTime.toString(),
        "Retry-After": resetInSeconds.toString(),
      },
    }
  );
}
