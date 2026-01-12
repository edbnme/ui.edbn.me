import type { Transition, Variants } from "motion/react";

// =============================================================================
// SPRING PRESETS
// Spring physics configurations for animations
// =============================================================================

/**
 * Spring presets for consistent animations
 */
export const springPresets = {
  /**
   * Snappy - Quick, responsive interactions (buttons, toggles)
   * High stiffness, high damping = fast and controlled
   */
  snappy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
    mass: 1,
  },

  /**
   * Bouncy - Playful, attention-grabbing (notifications, toasts)
   * Medium stiffness, lower damping = visible bounce
   */
  bouncy: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
    mass: 1,
  },

  /**
   * Smooth - Slow transitions (modals, sheets)
   * Lower stiffness, higher damping = graceful movement
   */
  smooth: {
    type: "spring" as const,
    stiffness: 200,
    damping: 25,
    mass: 1,
  },

  /**
   * Gentle - Subtle, background animations (fade, scale)
   * Very low stiffness, high damping = barely perceptible
   */
  gentle: {
    type: "spring" as const,
    stiffness: 150,
    damping: 30,
    mass: 1,
  },

  /**
   * Interactive - Drag and gesture responses
   * Balanced for real-time responsiveness
   */
  interactive: {
    type: "spring" as const,
    stiffness: 500,
    damping: 35,
    mass: 0.8,
  },
} as const;

// =============================================================================
// TRANSITION PRESETS
// Pre-configured transitions for common use cases
// =============================================================================

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

  /** Fast fade for overlays */
  fade: {
    type: "tween" as const,
    duration: 0.15,
    ease: "easeOut",
  } as Transition,

  /** Reduced motion fallback - instant transitions */
  reduced: {
    type: "tween" as const,
    duration: 0,
  } as Transition,
} as const;

// =============================================================================
// VARIANT FACTORIES
// Create animation variants for common patterns
// =============================================================================

/**
 * Creates scale variants for press/tap interactions
 */
export function createPressVariants(scale: number = 0.97): Variants {
  return {
    idle: { scale: 1 },
    pressed: { scale },
  };
}

/**
 * Creates hover scale variants
 */
export function createHoverVariants(scale: number = 1.02): Variants {
  return {
    idle: { scale: 1 },
    hovered: { scale },
  };
}

/**
 * Creates fade + scale variants for modal-like components
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
 * Scales from the origin point (where it appears from)
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

// =============================================================================
// GESTURE PRESETS
// Common gesture configurations
// =============================================================================

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
// EASING FUNCTIONS
// Cubic-bezier curves for animations
// =============================================================================

export const easings = {
  /** Standard curve */
  standard: [0.25, 0.1, 0.25, 1],
  /** Ease-in */
  easeIn: [0.42, 0, 1, 1],
  /** Ease-out */
  easeOut: [0, 0, 0.58, 1],
  /** Emphasized */
  emphasis: [0.33, 1, 0.68, 1],
  /** Linear */
  linear: [0, 0, 1, 1],
} as const;

// =============================================================================
// DURATION PRESETS
// Consistent timing values
// =============================================================================

export const durations = {
  instant: 0,
  fast: 0.1,
  normal: 0.2,
  slow: 0.3,
  slower: 0.5,
  slowest: 0.8,
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Combines multiple variant objects
 */
export function mergeVariants(...variants: Variants[]): Variants {
  return variants.reduce((acc, variant) => ({ ...acc, ...variant }), {});
}

/**
 * Creates a transition that respects reduced motion
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
 */
export function createLayoutId(prefix: string, id: string | number): string {
  return `${prefix}-${id}`;
}
