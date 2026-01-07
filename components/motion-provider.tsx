"use client";

import * as React from "react";
import { createContext, useContext, useMemo } from "react";
import { MotionConfig, type Transition } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useLowPowerDevice } from "@/hooks/use-low-power-device";
import { transitions } from "@/lib/motion";

// =============================================================================
// TYPES
// =============================================================================

export type ReducedMotionSetting = "user" | "always" | "never";

export type MotionContextValue = {
  /** Current reduced motion setting */
  reducedMotion: ReducedMotionSetting;
  /** Whether animations are effectively disabled */
  isAnimationDisabled: boolean;
  /** Whether low-power mode auto-disable is enabled */
  lowPowerAutoDisable: boolean;
  /** Low power device state */
  lowPowerState: {
    isLowPower: boolean;
    batteryLevel: number | null;
    isCharging: boolean | null;
  };
  /** Default transition based on current settings */
  defaultTransition: Transition;
};

export type MotionProviderProps = {
  children: React.ReactNode;
  /** How to handle reduced motion: 'user' (system preference), 'always' (force reduced), 'never' (force animations) */
  reducedMotion?: ReducedMotionSetting;
  /** Automatically disable animations on low-power devices */
  lowPowerAutoDisable?: boolean;
  /** Default transition for all Motion components */
  defaultTransition?: Transition;
  /** Additional className for the provider wrapper */
  className?: string;
};

// =============================================================================
// CONTEXT
// =============================================================================

const MotionContext = createContext<MotionContextValue | null>(null);

/**
 * Hook to access motion configuration
 *
 * @returns Motion context value with animation settings
 * @throws Error if used outside of MotionProvider
 *
 * @example
 * ```tsx
 * function AnimatedButton() {
 *   const { isAnimationDisabled } = useMotionConfig();
 *
 *   return (
 *     <motion.button
 *       whileTap={isAnimationDisabled ? undefined : { scale: 0.95 }}
 *     />
 *   );
 * }
 * ```
 */
export function useMotionConfig(): MotionContextValue {
  const context = useContext(MotionContext);

  if (!context) {
    throw new Error("useMotionConfig must be used within a MotionProvider");
  }

  return context;
}

/**
 * Hook to check if animations should be disabled for a component
 *
 * @param disableAnimation - Optional local override to disable animation
 * @returns Whether animations should be disabled
 *
 * @example
 * ```tsx
 * function Button({ disableAnimation }) {
 *   const shouldDisable = useShouldDisableAnimation(disableAnimation);
 *
 *   if (shouldDisable) {
 *     return <button>Click me</button>;
 *   }
 *
 *   return <motion.button whileTap={{ scale: 0.95 }}>Click me</motion.button>;
 * }
 * ```
 */
export function useShouldDisableAnimation(disableAnimation?: boolean): boolean {
  const context = useContext(MotionContext);
  const prefersReducedMotion = useReducedMotion();

  // Local override takes precedence
  if (disableAnimation !== undefined) {
    return disableAnimation;
  }

  // If no provider, check system preference directly
  if (!context) {
    return prefersReducedMotion;
  }

  return context.isAnimationDisabled;
}

/**
 * Hook to get the appropriate transition based on animation settings
 *
 * @param transition - Desired transition when animations are enabled
 * @param disableAnimation - Optional local override
 * @returns The transition to use (reduced if animations disabled)
 */
export function useAnimationTransition(
  transition: Transition = transitions.default,
  disableAnimation?: boolean,
): Transition {
  const shouldDisable = useShouldDisableAnimation(disableAnimation);

  if (shouldDisable) {
    return transitions.reduced;
  }

  return transition;
}

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

/**
 * MotionProvider - Global animation configuration provider
 *
 * Wraps Motion's MotionConfig with additional context for:
 * - Reduced motion preferences (system or manual)
 * - Low-power device detection
 * - Global transition defaults
 *
 * @example
 * ```tsx
 * // In your app layout
 * <MotionProvider
 *   reducedMotion="user"
 *   lowPowerAutoDisable
 * >
 *   <App />
 * </MotionProvider>
 * ```
 */
export function MotionProvider({
  children,
  reducedMotion = "user",
  lowPowerAutoDisable = true,
  defaultTransition = transitions.default,
}: MotionProviderProps) {
  // System preference for reduced motion
  const prefersReducedMotion = useReducedMotion();

  // Low-power device detection
  const lowPowerState = useLowPowerDevice();

  // Determine if animations should be disabled
  const isAnimationDisabled = useMemo(() => {
    // 'always' forces reduced motion
    if (reducedMotion === "always") {
      return true;
    }

    // 'never' forces animations (ignores preferences)
    if (reducedMotion === "never") {
      return false;
    }

    // 'user' respects system preference
    if (prefersReducedMotion) {
      return true;
    }

    // Check low-power mode if auto-disable is enabled
    if (lowPowerAutoDisable && lowPowerState.shouldReduceAnimations) {
      return true;
    }

    return false;
  }, [
    reducedMotion,
    prefersReducedMotion,
    lowPowerAutoDisable,
    lowPowerState.shouldReduceAnimations,
  ]);

  // Get effective transition
  const effectiveTransition = useMemo(() => {
    if (isAnimationDisabled) {
      return transitions.reduced;
    }
    return defaultTransition;
  }, [isAnimationDisabled, defaultTransition]);

  // Context value
  const contextValue = useMemo<MotionContextValue>(
    () => ({
      reducedMotion,
      isAnimationDisabled,
      lowPowerAutoDisable,
      lowPowerState: {
        isLowPower: lowPowerState.isLowPower,
        batteryLevel: lowPowerState.batteryLevel,
        isCharging: lowPowerState.isCharging,
      },
      defaultTransition: effectiveTransition,
    }),
    [
      reducedMotion,
      isAnimationDisabled,
      lowPowerAutoDisable,
      lowPowerState.isLowPower,
      lowPowerState.batteryLevel,
      lowPowerState.isCharging,
      effectiveTransition,
    ],
  );

  return (
    <MotionContext.Provider value={contextValue}>
      <MotionConfig
        transition={effectiveTransition}
        reducedMotion={isAnimationDisabled ? "always" : "user"}
      >
        {children}
      </MotionConfig>
    </MotionContext.Provider>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export { MotionContext };
