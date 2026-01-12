"use client";

import { useSyncExternalStore, useCallback } from "react";

/**
 * Hook to detect user's reduced motion preference
 *
 * Uses the `prefers-reduced-motion` media query to detect if the user
 * has requested reduced motion in their system settings.
 *
 * @param override - Optional boolean to override the system preference
 * @returns Whether reduced motion is preferred
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const prefersReducedMotion = useReducedMotion();
 *
 *   return (
 *     <motion.div
 *       animate={{ x: prefersReducedMotion ? 0 : 100 }}
 *     />
 *   );
 * }
 * ```
 */
export function useReducedMotion(override?: boolean): boolean {
  const subscribe = useCallback((callback: () => void) => {
    if (typeof window === "undefined") return () => {};

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    mediaQuery.addEventListener("change", callback);
    return () => mediaQuery.removeEventListener("change", callback);
  }, []);

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Server snapshot should always return false for SSR
  const getServerSnapshot = useCallback(() => false, []);

  const prefersReducedMotion = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // Override takes precedence if provided
  if (override !== undefined) {
    return override;
  }

  return prefersReducedMotion;
}

export default useReducedMotion;
