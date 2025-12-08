'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook to prevent body scroll when a modal/sheet is open
 * 
 * Handles scroll locking for overlays, modals, sheets, and dialogs.
 * Preserves scroll position and prevents background scroll on mobile.
 * 
 * @param isLocked - Whether to lock the scroll
 * @param reserveScrollBarGap - Whether to add padding to prevent layout shift
 * 
 * @example
 * ```tsx
 * function Modal({ isOpen }) {
 *   usePreventScroll(isOpen);
 *   
 *   return isOpen ? <div>Modal Content</div> : null;
 * }
 * ```
 */
export function usePreventScroll(
  isLocked: boolean,
  reserveScrollBarGap: boolean = true
): void {
  const scrollPositionRef = useRef<number>(0);

  useEffect(() => {
    if (!isLocked) return;

    // Store current scroll position
    scrollPositionRef.current = window.scrollY;

    // Get scrollbar width
    const scrollbarWidth = reserveScrollBarGap
      ? window.innerWidth - document.documentElement.clientWidth
      : 0;

    // Store original styles
    const originalStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      paddingRight: document.body.style.paddingRight,
    };

    // Apply lock styles
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPositionRef.current}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';

    // Add padding to prevent layout shift from scrollbar disappearing
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Cleanup: restore original styles and scroll position
    return () => {
      document.body.style.overflow = originalStyles.overflow;
      document.body.style.position = originalStyles.position;
      document.body.style.top = originalStyles.top;
      document.body.style.left = originalStyles.left;
      document.body.style.right = originalStyles.right;
      document.body.style.paddingRight = originalStyles.paddingRight;

      // Restore scroll position
      window.scrollTo(0, scrollPositionRef.current);
    };
  }, [isLocked, reserveScrollBarGap]);
}

export default usePreventScroll;
