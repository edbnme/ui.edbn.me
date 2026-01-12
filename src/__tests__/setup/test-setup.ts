/**
 * =============================================================================
 * VITEST GLOBAL TEST SETUP
 * =============================================================================
 *
 * This file runs before each test file to set up the testing environment.
 * It configures:
 * - Jest-DOM matchers for DOM assertions
 * - Browser API mocks (matchMedia, ResizeObserver, etc.)
 * - Cleanup between tests
 * - Console warning suppression for known issues
 *
 * @module test-setup
 * =============================================================================
 */

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, vi } from "vitest";

// =============================================================================
// CLEANUP
// =============================================================================

/**
 * Clean up DOM and React state after each test
 * This ensures tests are isolated and don't affect each other
 */
afterEach(() => {
  cleanup();
});

// =============================================================================
// BROWSER API MOCKS
// =============================================================================

/**
 * Mock window.matchMedia
 *
 * Required for:
 * - Media query hooks (useReducedMotion, usePrefersColorScheme)
 * - Responsive component testing
 * - Animation preference detection
 *
 * @see https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
 */
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated but still used by some libraries
    removeListener: vi.fn(), // Deprecated but still used by some libraries
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

/**
 * Mock ResizeObserver
 *
 * Required for:
 * - @radix-ui/react-popover
 * - @radix-ui/react-dropdown-menu
 * - @floating-ui/dom
 * - Any component that observes element size changes
 *
 * This must be a class, not a function mock, because components
 * instantiate it with `new ResizeObserver(callback)`
 */
class ResizeObserverMock implements ResizeObserver {
  private callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.ResizeObserver = ResizeObserverMock;

/**
 * Mock IntersectionObserver
 *
 * Required for:
 * - Lazy loading components
 * - Infinite scroll implementations
 * - Visibility detection
 */
class IntersectionObserverMock implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];

  constructor() {}

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
}

global.IntersectionObserver = IntersectionObserverMock;

/**
 * Mock window.scrollTo
 *
 * Required for:
 * - Scroll restoration
 * - Scroll-to-top buttons
 * - Modal scroll locking
 */
Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: vi.fn(),
});

/**
 * Mock requestAnimationFrame and cancelAnimationFrame
 *
 * Required for:
 * - Animation libraries (motion/react)
 * - Smooth scroll implementations
 * - Performance-optimized updates
 */
let rafId = 0;
global.requestAnimationFrame = vi.fn(
  (callback: FrameRequestCallback): number => {
    rafId += 1;
    setTimeout(() => callback(performance.now()), 0);
    return rafId;
  },
);

global.cancelAnimationFrame = vi.fn((): void => {
  // No-op in tests
});

/**
 * Mock Element.scrollIntoView
 *
 * Required for:
 * - Focus management in dialogs
 * - Scroll-to-element functionality
 */
Element.prototype.scrollIntoView = vi.fn();

/**
 * Mock window.getComputedStyle partial implementation
 *
 * Required for:
 * - Animation detection
 * - Style calculations
 */
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = vi.fn().mockImplementation((element: Element) => {
  return originalGetComputedStyle(element);
});

// =============================================================================
// POINTER EVENTS MOCK
// =============================================================================

/**
 * Mock PointerEvent
 *
 * JSDOM doesn't support PointerEvent, so we need to mock it
 * Required for:
 * - Radix UI components with pointer interactions
 * - Drag and drop functionality
 */
class PointerEventMock extends MouseEvent {
  pointerId: number;
  width: number;
  height: number;
  pressure: number;
  tangentialPressure: number;
  tiltX: number;
  tiltY: number;
  twist: number;
  pointerType: string;
  isPrimary: boolean;

  constructor(type: string, props: PointerEventInit = {}) {
    super(type, props);
    this.pointerId = props.pointerId ?? 0;
    this.width = props.width ?? 1;
    this.height = props.height ?? 1;
    this.pressure = props.pressure ?? 0;
    this.tangentialPressure = props.tangentialPressure ?? 0;
    this.tiltX = props.tiltX ?? 0;
    this.tiltY = props.tiltY ?? 0;
    this.twist = props.twist ?? 0;
    this.pointerType = props.pointerType ?? "";
    this.isPrimary = props.isPrimary ?? false;
  }

  getCoalescedEvents = vi.fn().mockReturnValue([]);
  getPredictedEvents = vi.fn().mockReturnValue([]);
}

global.PointerEvent = PointerEventMock as unknown as typeof PointerEvent;

// =============================================================================
// CONSOLE SUPPRESSIONS
// =============================================================================

/**
 * Suppress known console warnings that clutter test output
 *
 * Suppressed warnings:
 * - Missing Description warnings from Radix UI
 * - React hydration mismatches in tests
 * - Motion animation value warnings
 */
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
  console.warn = (...args: unknown[]) => {
    const message = args[0]?.toString() || "";

    // Skip known warnings that don't affect test validity
    const suppressedPatterns = [
      "Missing `Description`",
      "requires a description",
      "is not an animatable value",
      "value-not-animatable",
      "React does not recognize",
    ];

    if (suppressedPatterns.some((pattern) => message.includes(pattern))) {
      return;
    }

    originalConsoleWarn(...args);
  };

  console.error = (...args: unknown[]) => {
    const message = args[0]?.toString() || "";

    // Skip known errors that don't affect test validity
    const suppressedPatterns = [
      "Warning: React does not recognize",
      "Warning: Invalid DOM property",
    ];

    if (suppressedPatterns.some((pattern) => message.includes(pattern))) {
      return;
    }

    originalConsoleError(...args);
  };
});
