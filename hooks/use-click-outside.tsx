"use client";

import { RefObject, useEffect, useLayoutEffect, useRef } from "react";

/**
 * Hook to detect clicks outside of a specified element
 *
 * Uses a ref to store the handler, preventing unnecessary event listener
 * re-attachment when the handler reference changes. This follows the
 * "Store Event Handlers in Refs" best practice pattern.
 *
 * @param ref - React ref object pointing to the element to detect clicks outside of
 * @param handler - Callback function to execute when a click outside is detected
 *
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * useClickOutside(ref, () => {
 *   console.log('Clicked outside!');
 * });
 * ```
 */
function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
): void {
  // Store handler in ref to prevent event listener re-attachment
  const handlerRef = useRef(handler);

  // Update ref on each render (useLayoutEffect ensures it's updated before events fire)
  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!ref || !ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      // Read from ref to always get the latest handler
      handlerRef.current(event);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [ref]); // handler removed from deps - now stable!
}

export default useClickOutside;
export { useClickOutside };
