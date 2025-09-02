import { beforeEach, describe, expect, test } from "bun:test";

import {
  chatRateLimiter,
  createRateLimitResponse,
  getClientIP,
} from "@/src/lib/rate-limiter";

describe("Rate Limiter", () => {
  beforeEach(() => {
    // Clear any existing state before each test
    chatRateLimiter["store"].clear();
  });

  describe("getClientIP", () => {
    test("should extract IP from x-forwarded-for header", () => {
      const mockRequest = new Request("http://localhost", {
        headers: {
          "x-forwarded-for": "192.168.1.1, 10.0.0.1",
        },
      });

      expect(getClientIP(mockRequest)).toBe("192.168.1.1");
    });

    test("should extract IP from x-real-ip header", () => {
      const mockRequest = new Request("http://localhost", {
        headers: {
          "x-real-ip": "192.168.1.2",
        },
      });

      expect(getClientIP(mockRequest)).toBe("192.168.1.2");
    });

    test("should extract IP from x-client-ip header", () => {
      const mockRequest = new Request("http://localhost", {
        headers: {
          "x-client-ip": "192.168.1.3",
        },
      });

      expect(getClientIP(mockRequest)).toBe("192.168.1.3");
    });

    test("should return unknown for missing headers", () => {
      const mockRequest = new Request("http://localhost");

      expect(getClientIP(mockRequest)).toBe("unknown");
    });
  });

  describe("chatRateLimiter", () => {
    test("should allow requests within limit", () => {
      const clientId = "test-client-1";

      // First request should be allowed
      const result1 = chatRateLimiter.check(clientId);
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(9); // 10 - 1

      // Second request should be allowed
      const result2 = chatRateLimiter.check(clientId);
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(8); // 10 - 2
    });

    test("should block requests when limit exceeded", () => {
      const clientId = "test-client-2";

      // Use up all 10 requests
      for (let i = 0; i < 10; i++) {
        const result = chatRateLimiter.check(clientId);
        expect(result.success).toBe(true);
      }

      // 11th request should be blocked
      const result = chatRateLimiter.check(clientId);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    test("should reset limit after time window", async () => {
      // Create a rate limiter with a very short window for testing
      const testRateLimiter = new (chatRateLimiter.constructor as new (
        windowMs: number,
        maxRequests: number
      ) => typeof chatRateLimiter)(100, 2); // 100ms window, 2 requests
      const clientId = "test-client-3";

      // Use up the limit
      testRateLimiter.check(clientId);
      testRateLimiter.check(clientId);

      // Should be blocked
      const blockedResult = testRateLimiter.check(clientId);
      expect(blockedResult.success).toBe(false);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should be allowed again
      const allowedResult = testRateLimiter.check(clientId);
      expect(allowedResult.success).toBe(true);
      expect(allowedResult.remaining).toBe(1); // 2 - 1
    });

    test("should track different clients separately", () => {
      const client1 = "test-client-4";
      const client2 = "test-client-5";

      // Use up limit for client1
      for (let i = 0; i < 10; i++) {
        chatRateLimiter.check(client1);
      }

      // client1 should be blocked
      const result1 = chatRateLimiter.check(client1);
      expect(result1.success).toBe(false);

      // client2 should still be allowed
      const result2 = chatRateLimiter.check(client2);
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(9);
    });

    test("getStatus should not consume requests", () => {
      const clientId = "test-client-6";

      // Get initial status
      const status1 = chatRateLimiter.getStatus(clientId);
      expect(status1.remaining).toBe(10);

      // Get status again - should be the same
      const status2 = chatRateLimiter.getStatus(clientId);
      expect(status2.remaining).toBe(10);

      // Now actually use a request
      chatRateLimiter.check(clientId);

      // Status should reflect the used request
      const status3 = chatRateLimiter.getStatus(clientId);
      expect(status3.remaining).toBe(9);
    });
  });

  describe("createRateLimitResponse", () => {
    test("should create proper rate limit response", () => {
      const resetTime = Date.now() + 60000; // 1 minute from now
      const response = createRateLimitResponse(0, resetTime);

      expect(response.status).toBe(429);
      expect(response.headers.get("Content-Type")).toBe("application/json");
      expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
      expect(response.headers.get("X-RateLimit-Reset")).toBe(
        resetTime.toString()
      );

      // Check response body
      const responseBody = response.json();
      expect(responseBody).resolves.toMatchObject({
        error: "Rate limit exceeded",
        message: "Too many requests. Please try again later.",
      });
    });
  });
});
