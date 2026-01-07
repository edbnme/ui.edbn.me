/**
 * =============================================================================
 * ANALYTICS VALIDATION TESTS
 * =============================================================================
 *
 * Tests for Zod validation schemas used in analytics API routes.
 *
 * @module analytics/validation.test
 * =============================================================================
 */

import { describe, it, expect } from "vitest";
import {
  trackEventSchema,
  batchEventsSchema,
  statsQuerySchema,
  eventTypeSchema,
} from "@/lib/analytics/validation";

describe("Analytics Validation Schemas", () => {
  describe("eventTypeSchema", () => {
    it("should accept valid event types", () => {
      expect(eventTypeSchema.safeParse("install").success).toBe(true);
      expect(eventTypeSchema.safeParse("view").success).toBe(true);
      expect(eventTypeSchema.safeParse("copy").success).toBe(true);
      expect(eventTypeSchema.safeParse("download").success).toBe(true);
      expect(eventTypeSchema.safeParse("search").success).toBe(true);
    });

    it("should reject invalid event types", () => {
      expect(eventTypeSchema.safeParse("invalid").success).toBe(false);
      expect(eventTypeSchema.safeParse("page_view").success).toBe(false);
    });
  });

  describe("trackEventSchema", () => {
    it("should validate a valid install event", () => {
      const event = {
        eventType: "install",
        componentName: "button",
        componentVersion: "1.0.0",
      };

      const result = trackEventSchema.safeParse(event);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.componentName).toBe("button");
        expect(result.data.componentVersion).toBe("1.0.0");
      }
    });

    it("should validate a valid view event", () => {
      const event = {
        eventType: "view",
        componentName: "dropdown-menu",
        path: "/docs/components/dropdown-menu",
      };

      const result = trackEventSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it("should validate a valid copy event", () => {
      const event = {
        eventType: "copy",
        componentName: "input",
      };

      const result = trackEventSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it("should validate a valid search event", () => {
      const event = {
        eventType: "search",
        searchQuery: "button variant",
      };

      const result = trackEventSchema.safeParse(event);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.searchQuery).toBe("button variant");
      }
    });

    it("should reject invalid eventType", () => {
      const event = {
        eventType: "invalid_event",
        path: "/test",
      };

      const result = trackEventSchema.safeParse(event);
      expect(result.success).toBe(false);
    });

    it("should reject invalid componentName format", () => {
      const event = {
        eventType: "view",
        componentName: "Button", // Must be lowercase
      };

      const result = trackEventSchema.safeParse(event);
      expect(result.success).toBe(false);
    });

    it("should accept kebab-case componentName", () => {
      const event = {
        eventType: "view",
        componentName: "dropdown-menu",
      };

      const result = trackEventSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it("should reject excessively long path", () => {
      const event = {
        eventType: "view",
        path: "/test".repeat(500),
      };

      const result = trackEventSchema.safeParse(event);
      expect(result.success).toBe(false);
    });

    it("should accept optional metadata", () => {
      const event = {
        eventType: "view",
        componentName: "button",
        metadata: { theme: "dark", variant: "primary" },
      };

      const result = trackEventSchema.safeParse(event);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metadata).toEqual({
          theme: "dark",
          variant: "primary",
        });
      }
    });

    it("should reject metadata that is too large", () => {
      const event = {
        eventType: "view",
        componentName: "button",
        metadata: { largeData: "x".repeat(15000) },
      };

      const result = trackEventSchema.safeParse(event);
      expect(result.success).toBe(false);
    });

    it("should accept valid version formats", () => {
      expect(
        trackEventSchema.safeParse({
          eventType: "install",
          componentName: "button",
          componentVersion: "1.0.0",
        }).success,
      ).toBe(true);

      expect(
        trackEventSchema.safeParse({
          eventType: "install",
          componentName: "button",
          componentVersion: "2.1.3-beta.1",
        }).success,
      ).toBe(true);
    });
  });

  describe("batchEventsSchema", () => {
    it("should validate an array of valid events", () => {
      const batch = {
        events: [
          { eventType: "view", componentName: "button" },
          {
            eventType: "install",
            componentName: "input",
            componentVersion: "1.0.0",
          },
          { eventType: "copy", componentName: "card" },
        ],
      };

      const result = batchEventsSchema.safeParse(batch);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.events).toHaveLength(3);
      }
    });

    it("should reject empty events array", () => {
      const batch = { events: [] };

      const result = batchEventsSchema.safeParse(batch);
      expect(result.success).toBe(false);
    });

    it("should reject too many events (max 50)", () => {
      const batch = {
        events: Array.from({ length: 51 }, (_, i) => ({
          eventType: "view",
          componentName: `component-${i}`,
        })),
      };

      const result = batchEventsSchema.safeParse(batch);
      expect(result.success).toBe(false);
    });

    it("should reject if any event is invalid", () => {
      const batch = {
        events: [
          { eventType: "view", componentName: "button" },
          { eventType: "invalid_type", componentName: "test" },
        ],
      };

      const result = batchEventsSchema.safeParse(batch);
      expect(result.success).toBe(false);
    });
  });

  describe("statsQuerySchema", () => {
    it("should validate with default values", () => {
      const query = {};

      const result = statsQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
        expect(result.data.offset).toBe(0);
      }
    });

    it("should accept valid componentName", () => {
      const query = { componentName: "button" };

      const result = statsQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.componentName).toBe("button");
      }
    });

    it("should accept valid date filters", () => {
      const query = {
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      };

      const result = statsQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
    });

    it("should accept valid limit parameter", () => {
      const query = { limit: 50 };

      const result = statsQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
      }
    });

    it("should reject limit > 100", () => {
      const query = { limit: 200 };

      const result = statsQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it("should accept valid countryCode", () => {
      const query = { countryCode: "US" };

      const result = statsQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
    });

    it("should reject invalid countryCode format", () => {
      const query = { countryCode: "usa" }; // Must be 2 uppercase letters

      const result = statsQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it("should accept valid groupBy values", () => {
      expect(statsQuerySchema.safeParse({ groupBy: "day" }).success).toBe(true);
      expect(statsQuerySchema.safeParse({ groupBy: "week" }).success).toBe(
        true,
      );
      expect(statsQuerySchema.safeParse({ groupBy: "month" }).success).toBe(
        true,
      );
      expect(statsQuerySchema.safeParse({ groupBy: "component" }).success).toBe(
        true,
      );
      expect(statsQuerySchema.safeParse({ groupBy: "country" }).success).toBe(
        true,
      );
    });

    it("should reject invalid groupBy value", () => {
      const query = { groupBy: "invalid" };

      const result = statsQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });
  });
});
