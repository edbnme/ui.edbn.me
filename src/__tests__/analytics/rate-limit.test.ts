/**
 * =============================================================================
 * ANALYTICS RATE LIMIT TESTS
 * =============================================================================
 *
 * Tests for the rate limiting functionality used in analytics API routes.
 *
 * @module analytics/rate-limit.test
 * =============================================================================
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { rateLimit, rateLimitAnalytics } from "@/lib/analytics/rate-limit";

describe("Rate Limiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("rateLimit (standard)", () => {
    it("should allow requests under the limit", async () => {
      const result1 = await rateLimit("test-standard-1");
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(99); // 100 - 1
      expect(result1.limit).toBe(100);

      const result2 = await rateLimit("test-standard-1");
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(98); // 100 - 2
    });

    it("should track different keys independently", async () => {
      // Use key A
      const resultA = await rateLimit("test-standard-a");
      expect(resultA.remaining).toBe(99);

      // Use key B - should have full quota
      const resultB = await rateLimit("test-standard-b");
      expect(resultB.remaining).toBe(99);
    });

    it("should reset after window expires", async () => {
      // Make a request
      await rateLimit("test-standard-reset");

      // Advance time past the 1 minute window
      vi.advanceTimersByTime(61 * 1000);

      // Should have full quota again
      const result = await rateLimit("test-standard-reset");
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(99);
    });
  });

  describe("rateLimitAnalytics", () => {
    it("should allow requests under the limit", async () => {
      const result1 = await rateLimitAnalytics("test-analytics-1");
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(29); // 30 - 1
      expect(result1.limit).toBe(30);
    });

    it("should block requests over the limit", async () => {
      // Use up all 30 requests
      for (let i = 0; i < 30; i++) {
        await rateLimitAnalytics("test-analytics-block");
      }

      // This should be blocked
      const result = await rateLimitAnalytics("test-analytics-block");
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("should provide reset time", async () => {
      const result = await rateLimitAnalytics("test-analytics-reset-time");
      expect(result.reset).toBeDefined();
      expect(typeof result.reset).toBe("number");
    });
  });
});
