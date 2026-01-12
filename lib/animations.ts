/**
 * Animation System - Motion constants, utilities, and presets
 *
 * This module provides all animation-related utilities for the component library.
 * It integrates with the design tokens and respects user's reduced motion preferences.
 *
 * @packageDocumentation
 */

import type { Transition, Variants } from "motion/react";
import { durations } from "./tokens";

// =============================================================================
// SPRING PRESETS
// Physics-based spring configurations for natural animations
// =============================================================================

/**
 * Spring presets for consistent animations across the library.
 * Each preset is tuned for specific interaction types.
 *
 * @example
 * ```tsx
 * import { springPresets } from '@/lib/animations';
 *
 * <motion.button transition={springPresets.snappy} />
 * ```
 */
export const springPresets = {
  /**
   * Snappy - Quick, responsive (buttons, toggles, small interactions)
   * High stiffness + high damping = fast and controlled
   */
  snappy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
    mass: 1,
  },

  /**
   * Bouncy - Playful, attention-grabbing (notifications, toasts)
   * Medium stiffness + lower damping = visible bounce
   */
  bouncy: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
    mass: 1,
  },

  /**
   * Smooth - Slow, graceful transitions (modals, sheets)
   * Lower stiffness + higher damping = elegant movement
   */
  smooth: {
    type: "spring" as const,
    stiffness: 200,
    damping: 25,
    mass: 1,
  },

  /**
   * Gentle - Subtle, background animations (fades, micro-interactions)
   * Very low stiffness + high damping = barely perceptible
   */
  gentle: {
    type: "spring" as const,
    stiffness: 150,
    damping: 30,
    mass: 1,
  },

  /**
   * Interactive - Drag and gesture responses
   * Balanced for real-time input tracking
   */
  interactive: {
    type: "spring" as const,
    stiffness: 500,
    damping: 35,
    mass: 0.8,
  },

  /**
   * Morphing - For layoutId shared element transitions
   * Zero bounce for clean morphing
   */
  morphing: {
    type: "spring" as const,
    bounce: 0,
    duration: 0.5,
  },
} as const;

// =============================================================================
// TRANSITION PRESETS
// Pre-configured transitions for common use cases
// =============================================================================

/**
 * Transition presets for various component types.
 *
 * @example
 * ```tsx
 * <motion.div transition={transitions.modal} />
 * ```
 */
export const transitions = {
  /** Standard transition using snappy spring */
  default: springPresets.snappy as Transition,

  /** For modal/dialog opening animations */
  modal: springPresets.smooth as Transition,

  /** For dropdown/popover appearance */
  popover: {
    ...springPresets.snappy,
    duration: 0.2,
  } as Transition,

  /** For morphing popover with layoutId */
  morphingPopover: {
    type: "spring" as const,
    bounce: 0.05,
    duration: 0.3,
  } as Transition,

  /** For sheet slide-in animations */
  sheet: {
    ...springPresets.smooth,
    damping: 28,
  } as Transition,

  /** For button press feedback */
  button: {
    ...springPresets.interactive,
    duration: 0.1,
  } as Transition,

  /** For icon state changes */
  icon: {
    ...springPresets.bouncy,
    duration: 0.3,
  } as Transition,

  /** For staggered list items */
  stagger: {
    staggerChildren: 0.03,
    delayChildren: 0.05,
  } as Transition,

  /** Fast fade for overlays/backdrops */
  fade: {
    type: "tween" as const,
    duration: 0.15,
    ease: "easeOut",
  } as Transition,

  /** Reduced motion fallback - instant */
  reduced: {
    type: "tween" as const,
    duration: 0,
  } as Transition,

  /** Content fade in after morph */
  contentFade: {
    duration: 0.25,
    delay: 0.15,
    ease: [0.32, 0.72, 0, 1] as const,
  } as Transition,

  /** Backdrop fade */
  backdrop: {
    duration: 0.25,
    ease: "easeOut" as const,
  } as Transition,
} as const;

// =============================================================================
// EASING FUNCTIONS
// Cubic-bezier curves for tween animations
// =============================================================================

/**
 * Easing curves for tween animations.
 * Use these when spring physics isn't appropriate.
 */
export const easings = {
  /** Standard ease curve */
  standard: [0.25, 0.1, 0.25, 1] as const,
  /** Acceleration curve */
  easeIn: [0.42, 0, 1, 1] as const,
  /** Deceleration curve */
  easeOut: [0, 0, 0.58, 1] as const,
  /** Emphasized movement */
  emphasis: [0.33, 1, 0.68, 1] as const,
  /** Linear - no easing */
  linear: [0, 0, 1, 1] as const,
  /** Overshoot - slight bounce at end */
  overshoot: [0.34, 1.56, 0.64, 1] as const,
} as const;

// =============================================================================
// DURATION CONSTANTS
// Consistent timing values (mirrors tokens.durations)
// =============================================================================

export { durations };

// =============================================================================
// VARIANT FACTORIES
// Create animation variants for common patterns
// =============================================================================

/**
 * Creates scale variants for press/tap interactions
 *
 * @param scale - The scale to apply when pressed (default: 0.97)
 * @returns Variants object for motion components
 *
 * @example
 * ```tsx
 * const pressVariants = createPressVariants(0.95);
 * <motion.button variants={pressVariants} whileTap="pressed" />
 * ```
 */
export function createPressVariants(scale = 0.97): Variants {
  return {
    idle: { scale: 1 },
    pressed: { scale },
  };
}

/**
 * Creates hover scale variants
 *
 * @param scale - The scale to apply when hovered (default: 1.02)
 * @returns Variants object for motion components
 */
export function createHoverVariants(scale = 1.02): Variants {
  return {
    idle: { scale: 1 },
    hovered: { scale },
  };
}

/**
 * Creates fade + scale variants for modal-like components
 *
 * @param options - Configuration for initial and exit scales
 * @returns Variants for enter/exit animations
 *
 * @example
 * ```tsx
 * const modalVariants = createModalVariants({ initialScale: 0.9 });
 * <motion.div variants={modalVariants} initial="initial" animate="animate" exit="exit" />
 * ```
 */
export function createModalVariants(options?: {
  initialScale?: number;
  exitScale?: number;
}): Variants {
  const { initialScale = 0.95, exitScale = 0.95 } = options ?? {};

  return {
    initial: {
      opacity: 0,
      scale: initialScale,
    },
    animate: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: exitScale,
    },
  };
}

/**
 * Creates slide variants for sheets/drawers
 *
 * @param side - The side the sheet slides from
 * @returns Variants for enter/exit animations
 */
export function createSlideVariants(
  side: "top" | "right" | "bottom" | "left",
): Variants {
  const transforms: Record<
    string,
    { x?: string | number; y?: string | number }
  > = {
    top: { y: "-100%" },
    right: { x: "100%" },
    bottom: { y: "100%" },
    left: { x: "-100%" },
  };

  return {
    initial: { ...transforms[side], opacity: 0 },
    animate: { x: 0, y: 0, opacity: 1 },
    exit: { ...transforms[side], opacity: 0 },
  };
}

/**
 * Creates staggered children variants for lists
 *
 * @param options - Configuration for stagger timing
 * @returns Variants for parent container
 */
export function createStaggerVariants(options?: {
  staggerChildren?: number;
  delayChildren?: number;
}): Variants {
  const { staggerChildren = 0.03, delayChildren = 0.05 } = options ?? {};

  return {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: staggerChildren / 2,
        staggerDirection: -1,
      },
    },
  };
}

/**
 * Creates item variants for staggered lists
 *
 * @param options - Configuration for item animation
 * @returns Variants for list items
 */
export function createStaggerItemVariants(options?: {
  y?: number;
  scale?: number;
}): Variants {
  const { y = 10, scale = 0.95 } = options ?? {};

  return {
    initial: { opacity: 0, y, scale },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: y / 2, scale },
  };
}

/**
 * Creates morphing popover variants with blur
 *
 * @param options - Configuration for morph animation
 * @returns Variants for morphing components
 */
export function createMorphingPopoverVariants(options?: {
  initialScale?: number;
  exitScale?: number;
  initialBlur?: number;
  exitBlur?: number;
}): Variants {
  const {
    initialScale = 0.9,
    exitScale = 0.95,
    initialBlur = 10,
    exitBlur = 10,
  } = options ?? {};

  return {
    initial: {
      opacity: 0,
      scale: initialScale,
      filter: `blur(${initialBlur}px)`,
    },
    animate: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        bounce: 0,
        duration: 0.3,
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      scale: exitScale,
      filter: `blur(${exitBlur}px)`,
      transition: {
        duration: 0.2,
      },
    },
  };
}

/**
 * Creates backdrop/overlay variants
 *
 * @returns Variants for backdrop elements
 */
export function createBackdropVariants(): Variants {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };
}

/**
 * Creates origin-aware scale variants for popovers/dropdowns
 *
 * @param options - Configuration for popover animation
 * @returns Variants for popover components
 */
export function createPopoverVariants(options?: {
  initialScale?: number;
  originX?: number;
  originY?: number;
}): Variants {
  const { initialScale = 0.95, originX = 0.5, originY = 0 } = options ?? {};

  return {
    initial: {
      opacity: 0,
      scale: initialScale,
      originX,
      originY,
    },
    animate: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: initialScale,
    },
  };
}

/**
 * Creates dropdown menu variants with blur and stagger
 *
 * @returns Variants for dropdown menus
 */
export function createDropdownVariants(): Variants {
  return {
    initial: {
      opacity: 0,
      scale: 0.92,
      y: -12,
      filter: "blur(12px)",
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        ...springPresets.smooth,
        stiffness: 260,
        damping: 32,
        mass: 1.02,
        delayChildren: 0.08,
        staggerChildren: 0.035,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      y: -6,
      filter: "blur(6px)",
      transition: {
        type: "tween",
        duration: 0.18,
        ease: easings.easeIn,
      },
    },
  };
}

/**
 * Creates dropdown item variants with blur
 *
 * @returns Variants for dropdown menu items
 */
export function createDropdownItemVariants(): Variants {
  return {
    initial: {
      opacity: 0,
      y: -6,
      scale: 0.98,
      filter: "blur(6px)",
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
    },
    exit: {
      opacity: 0,
      y: -4,
      scale: 0.98,
      filter: "blur(4px)",
      transition: {
        duration: 0.14,
        ease: easings.easeIn,
      },
    },
  };
}

/**
 * Creates check/indicator variants with bounce
 *
 * @returns Variants for checkbox/radio indicators
 */
export function createIndicatorVariants(): Variants {
  return {
    initial: {
      scale: 0.6,
      opacity: 0,
      rotate: -8,
    },
    animate: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        ...springPresets.bouncy,
        stiffness: 460,
        damping: 28,
        mass: 0.9,
      },
    },
    exit: {
      scale: 0.6,
      opacity: 0,
      rotate: 8,
      transition: {
        duration: 0.16,
        ease: easings.easeIn,
      },
    },
  };
}

// =============================================================================
// GESTURE PRESETS
// Common gesture configurations
// =============================================================================

/**
 * Gesture presets for interactive elements.
 *
 * @example
 * ```tsx
 * <motion.button {...gestures.button} />
 * ```
 */
export const gestures = {
  /** Standard button tap feedback */
  button: {
    whileTap: { scale: 0.97 },
    whileHover: { scale: 1.02 },
  },

  /** Subtle press for secondary actions */
  subtle: {
    whileTap: { scale: 0.99 },
  },

  /** Icon button feedback */
  iconButton: {
    whileTap: { scale: 0.9 },
    whileHover: { scale: 1.1 },
  },

  /** Card hover effect */
  card: {
    whileHover: { scale: 1.02, y: -4 },
    transition: springPresets.smooth,
  },

  /** List item hover */
  listItem: {
    whileHover: { x: 4 },
    transition: springPresets.snappy,
  },
} as const;

// =============================================================================
// DRAG CONFIGURATION
// For swipeable/draggable components
// =============================================================================

/**
 * Drag configurations for swipeable components.
 */
export const dragConfig = {
  /** Sheet swipe-to-dismiss threshold */
  sheet: {
    dismissThreshold: 100,
    velocityThreshold: 500,
  },

  /** Drag constraints for bounded elements */
  bounded: {
    elastic: 0.1,
    power: 0.8,
  },
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Combines multiple variant objects into one
 *
 * @param variants - Variants to merge
 * @returns Combined variants object
 */
export function mergeVariants(...variants: Variants[]): Variants {
  return variants.reduce((acc, variant) => ({ ...acc, ...variant }), {});
}

/**
 * Returns appropriate transition based on reduced motion preference
 *
 * @param transition - The desired transition
 * @param prefersReducedMotion - Whether user prefers reduced motion
 * @returns The appropriate transition
 */
export function getTransition(
  transition: Transition,
  prefersReducedMotion: boolean,
): Transition {
  if (prefersReducedMotion) {
    return transitions.reduced;
  }
  return transition;
}

/**
 * Generates a layoutId for shared element transitions
 *
 * @param prefix - Component type prefix
 * @param id - Unique identifier
 * @returns A stable layoutId string
 */
export function createLayoutId(prefix: string, id: string | number): string {
  return `${prefix}-${id}`;
}

/**
 * Gets variants that respect reduced motion preference
 *
 * @param variants - Original variants
 * @param prefersReducedMotion - Whether user prefers reduced motion
 * @returns Modified variants with instant transitions if needed
 */
export function getReducedMotionVariants(
  variants: Variants,
  prefersReducedMotion: boolean,
): Variants {
  if (!prefersReducedMotion) {
    return variants;
  }

  // Return variants with instant state changes, no animation properties
  const reducedVariants: Variants = {};

  for (const [key, value] of Object.entries(variants)) {
    if (typeof value === "object" && value !== null) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { transition, ...visualProps } = value as Record<string, unknown>;
      // Cast to Variant since we're just removing the transition property
      reducedVariants[key] = visualProps as Variants[string];
    } else {
      reducedVariants[key] = value;
    }
  }

  return reducedVariants;
}
