"use client";

import {
  useCallback,
  type Ref,
  type RefCallback,
  type MutableRefObject,
} from "react";

/**
 * Type for any valid ref - can be a RefObject, RefCallback, or null
 */
type PossibleRef<T> = Ref<T> | undefined;

/**
 * Assigns a value to a ref, handling both callback refs and RefObjects
 *
 * @param ref - The ref to assign to
 * @param value - The value to assign
 */
function assignRef<T>(ref: PossibleRef<T>, value: T | null): void {
  if (ref === null || ref === undefined) {
    return;
  }

  if (typeof ref === "function") {
    ref(value);
  } else {
    // It's a RefObject
    (ref as MutableRefObject<T | null>).current = value;
  }
}

/**
 * Merges multiple refs into a single callback ref
 *
 * This is useful when you need to pass multiple refs to a single element,
 * such as when combining a forwarded ref with an internal ref.
 *
 * @param refs - The refs to merge
 * @returns A callback ref that assigns to all provided refs
 *
 * @example
 * ```tsx
 * const MyComponent = forwardRef<HTMLDivElement, Props>((props, forwardedRef) => {
 *   const internalRef = useRef<HTMLDivElement>(null);
 *   const mergedRef = useMergedRefs(forwardedRef, internalRef);
 *
 *   return <div ref={mergedRef} />;
 * });
 * ```
 *
 * @example
 * ```tsx
 * // With multiple refs
 * const Component = forwardRef((props, ref) => {
 *   const localRef = useRef(null);
 *   const animationRef = useRef(null);
 *   const mergedRef = useMergedRefs(ref, localRef, animationRef);
 *
 *   return <div ref={mergedRef} />;
 * });
 * ```
 */
export function useMergedRefs<T>(...refs: PossibleRef<T>[]): RefCallback<T> {
  return useCallback(
    (node: T | null) => {
      refs.forEach((ref) => {
        assignRef(ref, node);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs,
  );
}

/**
 * Merges refs without hooks - for use outside of components
 *
 * @param refs - The refs to merge
 * @returns A callback ref that assigns to all provided refs
 *
 * @example
 * ```tsx
 * const callbackRef = mergeRefs(ref1, ref2, ref3);
 * ```
 */
export function mergeRefs<T>(...refs: PossibleRef<T>[]): RefCallback<T> {
  return (node: T | null) => {
    refs.forEach((ref) => {
      assignRef(ref, node);
    });
  };
}

export default useMergedRefs;
