"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type Dispatch,
  type SetStateAction,
} from "react";

/**
 * Configuration for useControllableState hook
 */
export interface UseControllableStateParams<T> {
  /**
   * The controlled value. If provided, the component is controlled.
   */
  value?: T;
  /**
   * The default value for uncontrolled mode.
   */
  defaultValue?: T | (() => T);
  /**
   * Callback fired when the value changes.
   */
  onChange?: (value: T) => void;
}

/**
 * Hook for creating state that can be either controlled or uncontrolled.
 *
 * This pattern allows components to work in both controlled and uncontrolled modes,
 * giving consumers flexibility in how they use the component.
 *
 * @param params - Configuration parameters
 * @returns A tuple of [value, setValue] similar to useState
 *
 * @example
 * ```tsx
 * // Uncontrolled usage
 * function MyComponent({ defaultOpen, onOpenChange }) {
 *   const [isOpen, setIsOpen] = useControllableState({
 *     defaultValue: defaultOpen ?? false,
 *     onChange: onOpenChange,
 *   });
 *
 *   return <div>{isOpen ? 'Open' : 'Closed'}</div>;
 * }
 *
 * // Controlled usage
 * function MyComponent({ open, onOpenChange }) {
 *   const [isOpen, setIsOpen] = useControllableState({
 *     value: open,
 *     onChange: onOpenChange,
 *   });
 *
 *   return <div>{isOpen ? 'Open' : 'Closed'}</div>;
 * }
 * ```
 */
export function useControllableState<T>({
  value: controlledValue,
  defaultValue,
  onChange,
}: UseControllableStateParams<T>): [T, Dispatch<SetStateAction<T>>] {
  // Determine if component is controlled
  const isControlled = controlledValue !== undefined;
  const isControlledRef = useRef(isControlled);

  // Warn about switching between controlled and uncontrolled
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      if (isControlledRef.current !== isControlled) {
        console.warn(
          "A component is changing from " +
            (isControlledRef.current ? "controlled" : "uncontrolled") +
            " to " +
            (isControlled ? "controlled" : "uncontrolled") +
            ". This is likely caused by the value changing from a defined to undefined, " +
            "which should not happen. Decide between using a controlled or uncontrolled " +
            "component for the lifetime of the component.",
        );
      }
    }
  }, [isControlled]);

  // Internal state for uncontrolled mode
  const [uncontrolledValue, setUncontrolledValue] = useState<T>(() => {
    if (typeof defaultValue === "function") {
      return (defaultValue as () => T)();
    }
    return defaultValue as T;
  });

  // The value to use (controlled or uncontrolled)
  const value = isControlled ? controlledValue : uncontrolledValue;

  // Stable reference to onChange callback
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Setter function that handles both modes
  const setValue = useCallback(
    (nextValue: SetStateAction<T>) => {
      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (prev: T) => T)(value)
          : nextValue;

      // In uncontrolled mode, update internal state
      if (!isControlled) {
        setUncontrolledValue(resolvedValue);
      }

      // Always call onChange if provided
      onChangeRef.current?.(resolvedValue);
    },
    [isControlled, value],
  );

  return [value, setValue];
}

/**
 * Simpler version for boolean state (common for open/close patterns)
 */
export interface UseControllableBooleanParams {
  value?: boolean;
  defaultValue?: boolean;
  onChange?: (value: boolean) => void;
}

/**
 * Specialized hook for boolean controllable state
 *
 * @param params - Configuration parameters
 * @returns Tuple with value, setValue, and convenience methods
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen, { open, close, toggle }] = useControllableBoolean({
 *   defaultValue: false,
 *   onChange: onOpenChange,
 * });
 * ```
 */
export function useControllableBoolean({
  value,
  defaultValue = false,
  onChange,
}: UseControllableBooleanParams): [
  boolean,
  Dispatch<SetStateAction<boolean>>,
  { open: () => void; close: () => void; toggle: () => void },
] {
  const [isOpen, setIsOpen] = useControllableState({
    value,
    defaultValue,
    onChange,
  });

  const open = useCallback(() => setIsOpen(true), [setIsOpen]);
  const close = useCallback(() => setIsOpen(false), [setIsOpen]);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [setIsOpen]);

  return [isOpen, setIsOpen, { open, close, toggle }];
}

export default useControllableState;
