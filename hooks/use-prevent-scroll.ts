"use client";

import { useLayoutEffect, useEffect, useRef } from "react";

// Use useLayoutEffect on client, useEffect for SSR
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Global lock counter for nested scroll locks
let scrollLockCount = 0;
let originalStyles: {
  bodyOverflow: string;
  bodyPaddingRight: string;
  htmlOverflow: string;
  scrollbarWidth: number;
} | null = null;

/**
 * Get the scrollbar width reliably
 */
function getScrollbarWidth(): number {
  // Create a temporary scrollable element
  const outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.overflow = "scroll";
  document.body.appendChild(outer);

  const inner = document.createElement("div");
  outer.appendChild(inner);

  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  outer.remove();

  return scrollbarWidth;
}

/**
 * Apply scroll lock styles
 */
function lockScroll(reserveScrollBarGap: boolean): void {
  scrollLockCount++;

  // Only apply on first lock
  if (scrollLockCount > 1) return;

  const scrollbarWidth = reserveScrollBarGap ? getScrollbarWidth() : 0;

  // Store original styles
  originalStyles = {
    bodyOverflow: document.body.style.overflow,
    bodyPaddingRight: document.body.style.paddingRight,
    htmlOverflow: document.documentElement.style.overflow,
    scrollbarWidth,
  };

  // Set CSS custom property for fixed elements
  document.documentElement.style.setProperty(
    "--scrollbar-width",
    `${scrollbarWidth}px`,
  );

  // Lock scroll
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";

  // Add padding to prevent layout shift
  if (scrollbarWidth > 0) {
    const currentPadding =
      parseInt(getComputedStyle(document.body).paddingRight, 10) || 0;
    document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
  }
}

/**
 * Remove scroll lock styles
 */
function unlockScroll(): void {
  scrollLockCount--;

  // Only restore on last unlock
  if (scrollLockCount > 0 || !originalStyles) return;

  document.documentElement.style.overflow = originalStyles.htmlOverflow;
  document.body.style.overflow = originalStyles.bodyOverflow;
  document.body.style.paddingRight = originalStyles.bodyPaddingRight;
  document.documentElement.style.removeProperty("--scrollbar-width");

  originalStyles = null;
}

/**
 * Hook to prevent body scroll when a modal/overlay is open
 *
 * Production-grade scroll locking for overlays, modals, sheets, and dialogs.
 *
 * Features:
 * - Uses layout effect for synchronous style application (no flash)
 * - Accurate scrollbar width measurement
 * - CSS custom property for fixed element compensation
 * - Nested lock support (multiple components can call this)
 * - Memory efficient (minimal re-renders)
 *
 * @param isLocked - Whether to lock the scroll
 * @param reserveScrollBarGap - Whether to add padding to prevent layout shift (default: true)
 *
 * @example
 * ```tsx
 * function Modal({ isOpen }) {
 *   usePreventScroll(isOpen);
 *   return isOpen ? <div>Modal Content</div> : null;
 * }
 * ```
 */
export function usePreventScroll(
  isLocked: boolean,
  reserveScrollBarGap: boolean = true,
): void {
  const wasLockedRef = useRef(false);

  useIsomorphicLayoutEffect(() => {
    if (isLocked && !wasLockedRef.current) {
      lockScroll(reserveScrollBarGap);
      wasLockedRef.current = true;
    }

    return () => {
      if (wasLockedRef.current) {
        unlockScroll();
        wasLockedRef.current = false;
      }
    };
  }, [isLocked, reserveScrollBarGap]);
}

export default usePreventScroll;
