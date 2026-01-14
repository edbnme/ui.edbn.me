"use client";

import { useId, useMemo } from "react";

// Global counter for SSR-safe IDs when useId is not available
let globalCounter = 0;

/**
 * Generates a stable, SSR-safe ID that persists across renders.
 *
 * This hook ensures that IDs remain consistent between server and client
 * renders, preventing hydration mismatches. It uses React 18's useId
 * when available, with a fallback for older React versions.
 *
 * @param prefix - Optional prefix for the generated ID
 * @returns A stable, unique ID string
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const id = useStableId('dialog');
 *
 *   return (
 *     <div aria-labelledby={`${id}-title`}>
 *       <h2 id={`${id}-title`}>Title</h2>
 *     </div>
 *   );
 * }
 * ```
 */
export function useStableId(prefix = "id"): string {
  // Use React 18+'s useId for stable, SSR-safe identifiers
  const reactId = useId();

  // Memoize the ID construction for render stability
  const stableId = useMemo(() => {
    // Remove colons from React's useId format (e.g., ":r0:") for valid HTML IDs
    const cleanId = reactId.replace(/:/g, "");
    return `${prefix}-${cleanId}`;
  }, [reactId, prefix]);

  return stableId;
}

/**
 * Generates a stable ID without React's useId hook.
 * Use this as a fallback or in non-component contexts.
 *
 * ⚠️ Warning: This may cause hydration mismatches if used during SSR.
 * Prefer useStableId in React components.
 *
 * @param prefix - Optional prefix for the generated ID
 * @returns A unique ID string
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const idRef = useRef<string | null>(null);
 *
 *   if (!idRef.current) {
 *     idRef.current = generateId('button');
 *   }
 *
 *   return <button id={idRef.current}>Click me</button>;
 * }
 * ```
 */
export function generateId(prefix = "id"): string {
  return `${prefix}-${++globalCounter}`;
}

/**
 * Hook that generates related IDs for a component and its parts.
 *
 * Useful for components with multiple elements that need related IDs
 * (e.g., dialog with title, description, content).
 *
 * @param prefix - Base prefix for all IDs
 * @returns An object with methods to generate related IDs
 *
 * @example
 * ```tsx
 * function Dialog() {
 *   const ids = useRelatedIds('dialog');
 *
 *   return (
 *     <div
 *       role="dialog"
 *       aria-labelledby={ids.for('title')}
 *       aria-describedby={ids.for('description')}
 *     >
 *       <h2 id={ids.for('title')}>Title</h2>
 *       <p id={ids.for('description')}>Description</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useRelatedIds(prefix = "component"): {
  base: string;
  for: (part: string) => string;
} {
  const baseId = useStableId(prefix);

  return {
    base: baseId,
    for: (part: string) => `${baseId}-${part}`,
  };
}

export default useStableId;
