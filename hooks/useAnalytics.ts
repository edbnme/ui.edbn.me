"use client";
/**
 * @edbn/ui Analytics - React Hook for Client-Side Tracking
 *
 * Provides a simple interface for tracking analytics events from React components.
 * Handles session management, batching, and error handling.
 *
 * @example
 * import { useAnalytics } from "@/hooks/useAnalytics";
 *
 * function ComponentDocs() {
 *   const { trackView, trackCopy, trackInstall } = useAnalytics();
 *
 *   useEffect(() => {
 *     trackView("button");
 *   }, []);
 *
 *   const handleCopy = () => {
 *     navigator.clipboard.writeText(code);
 *     trackCopy("button");
 *   };
 *
 *   return <Button onClick={handleCopy}>Copy</Button>;
 * }
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { signInAnonymously, getSessionId } from "@/lib/supabase/client";
import type { EventType } from "@/lib/analytics/validation";

// ============================================================
// Types
// ============================================================

interface TrackEventOptions {
  componentName?: string;
  componentVersion?: string;
  metadata?: Record<string, unknown>;
}

interface AnalyticsHook {
  /** Track any event type */
  trackEvent: (eventType: EventType, options?: TrackEventOptions) => void;
  /** Track component view */
  trackView: (
    componentName: string,
    metadata?: Record<string, unknown>,
  ) => void;
  /** Track code copy */
  trackCopy: (
    componentName: string,
    metadata?: Record<string, unknown>,
  ) => void;
  /** Track component install (via CLI) */
  trackInstall: (componentName: string, version?: string) => void;
  /** Track file download */
  trackDownload: (
    componentName: string,
    metadata?: Record<string, unknown>,
  ) => void;
  /** Track search */
  trackSearch: (query: string) => void;
  /** Current session ID */
  sessionId: string | null;
  /** Whether analytics is ready */
  isReady: boolean;
  /** Whether analytics is enabled */
  isEnabled: boolean;
}

// ============================================================
// Configuration
// ============================================================

const API_ENDPOINT = "/api/analytics/track";
const BATCH_SIZE = 10;
const BATCH_INTERVAL = 5000; // 5 seconds

// Check if analytics is enabled
function isAnalyticsEnabled(): boolean {
  if (typeof window === "undefined") return false;

  // Respect user's DNT preference
  if (navigator.doNotTrack === "1") return false;

  // Check env var
  const envEnabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED;
  if (envEnabled === "false") return false;

  // Enable by default in production
  return process.env.NODE_ENV === "production" || envEnabled === "true";
}

// ============================================================
// Event Queue (for batching)
// ============================================================

interface QueuedEvent {
  eventType: EventType;
  componentName?: string;
  componentVersion?: string;
  path: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

class EventQueue {
  private queue: QueuedEvent[] = [];
  private flushTimeout: NodeJS.Timeout | null = null;
  private sessionId: string | null = null;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = isAnalyticsEnabled();
  }

  setSessionId(id: string) {
    this.sessionId = id;
    // Flush any queued events now that we have a session
    if (this.queue.length > 0) {
      this.flush();
    }
  }

  add(event: QueuedEvent) {
    if (!this.isEnabled) return;

    this.queue.push(event);

    // Flush immediately if batch is full
    if (this.queue.length >= BATCH_SIZE) {
      this.flush();
      return;
    }

    // Schedule flush if not already scheduled
    if (!this.flushTimeout) {
      this.flushTimeout = setTimeout(() => this.flush(), BATCH_INTERVAL);
    }
  }

  async flush() {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }

    if (this.queue.length === 0) return;
    if (!this.sessionId) {
      // Wait for session to be established
      return;
    }

    const events = [...this.queue];
    this.queue = [];

    try {
      // Send single event or batch
      if (events.length === 1) {
        await fetch(API_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(events[0]),
          keepalive: true, // Ensure request completes on page unload
        });
      } else {
        await fetch(`${API_ENDPOINT}/batch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ events }),
          keepalive: true,
        });
      }
    } catch (error) {
      // Re-queue events on failure (with limit to prevent infinite growth)
      if (this.queue.length < 100) {
        this.queue.push(...events);
      }
      console.error("[Analytics] Failed to send events:", error);
    }
  }

  // Flush on page unload
  setupUnloadHandler() {
    if (typeof window === "undefined") return;

    const handleUnload = () => {
      if (this.queue.length > 0 && this.sessionId) {
        // Use sendBeacon for reliable delivery on unload
        navigator.sendBeacon?.(
          `${API_ENDPOINT}/batch`,
          JSON.stringify({ events: this.queue }),
        );
        this.queue = [];
      }
    };

    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        handleUnload();
      }
    });

    window.addEventListener("pagehide", handleUnload);
  }
}

// Singleton queue instance
let eventQueue: EventQueue | null = null;

function getEventQueue(): EventQueue {
  if (!eventQueue) {
    eventQueue = new EventQueue();
    eventQueue.setupUnloadHandler();
  }
  return eventQueue;
}

// ============================================================
// Hook Implementation
// ============================================================

/**
 * React hook for analytics tracking.
 * Automatically manages session creation and event batching.
 */
export function useAnalytics(): AnalyticsHook {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const initRef = useRef(false);
  const isEnabled = isAnalyticsEnabled();

  // Initialize session on mount
  useEffect(() => {
    if (!isEnabled) {
      setIsReady(true);
      return;
    }

    if (initRef.current) return;
    initRef.current = true;

    async function initSession() {
      try {
        // Try to get existing session first
        const existingId = await getSessionId();
        if (existingId) {
          setSessionId(existingId);
          getEventQueue().setSessionId(existingId);
          setIsReady(true);
          return;
        }

        // Create anonymous session
        const result = await signInAnonymously();
        if (result.sessionId) {
          setSessionId(result.sessionId);
          getEventQueue().setSessionId(result.sessionId);
        }
      } catch (error) {
        console.error("[Analytics] Failed to initialize session:", error);
      } finally {
        setIsReady(true);
      }
    }

    initSession();
  }, [isEnabled]);

  // Track any event
  const trackEvent = useCallback(
    (eventType: EventType, options?: TrackEventOptions) => {
      if (!isEnabled) return;

      getEventQueue().add({
        eventType,
        componentName: options?.componentName,
        componentVersion: options?.componentVersion,
        path: typeof window !== "undefined" ? window.location.pathname : "",
        metadata: options?.metadata,
        timestamp: Date.now(),
      });
    },
    [isEnabled],
  );

  // Convenience methods
  const trackView = useCallback(
    (componentName: string, metadata?: Record<string, unknown>) => {
      trackEvent("view", { componentName, metadata });
    },
    [trackEvent],
  );

  const trackCopy = useCallback(
    (componentName: string, metadata?: Record<string, unknown>) => {
      trackEvent("copy", { componentName, metadata });
    },
    [trackEvent],
  );

  const trackInstall = useCallback(
    (componentName: string, version?: string) => {
      trackEvent("install", { componentName, componentVersion: version });
    },
    [trackEvent],
  );

  const trackDownload = useCallback(
    (componentName: string, metadata?: Record<string, unknown>) => {
      trackEvent("download", { componentName, metadata });
    },
    [trackEvent],
  );

  const trackSearch = useCallback(
    (query: string) => {
      trackEvent("search", { metadata: { query } });
    },
    [trackEvent],
  );

  return {
    trackEvent,
    trackView,
    trackCopy,
    trackInstall,
    trackDownload,
    trackSearch,
    sessionId,
    isReady,
    isEnabled,
  };
}

// ============================================================
// Non-Hook Tracking (for use outside React)
// ============================================================

/**
 * Track an event without using the hook.
 * Useful for tracking in non-React code or utilities.
 *
 * @example
 * // In a utility function
 * import { trackEventDirect } from "@/hooks/useAnalytics";
 * trackEventDirect("install", { componentName: "button" });
 */
export function trackEventDirect(
  eventType: EventType,
  options?: TrackEventOptions,
): void {
  if (!isAnalyticsEnabled()) return;

  getEventQueue().add({
    eventType,
    componentName: options?.componentName,
    componentVersion: options?.componentVersion,
    path: typeof window !== "undefined" ? window.location.pathname : "",
    metadata: options?.metadata,
    timestamp: Date.now(),
  });
}
