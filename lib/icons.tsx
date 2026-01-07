"use client";

import * as React from "react";
import {
  motion,
  AnimatePresence,
  type Variants,
  type TargetAndTransition,
  type VariantLabels,
} from "motion/react";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { springPresets } from "@/lib/motion";

// =============================================================================
// ANIMATED ICON WRAPPER
// Wraps Phosphor icons with Motion for smooth transitions
// =============================================================================

type AnimationTarget = boolean | TargetAndTransition | VariantLabels;

export type AnimatedIconProps = {
  /** The Phosphor icon component to render */
  icon: Icon;
  /** Optional className for styling */
  className?: string;
  /** Size of the icon (inherits from parent if not specified) */
  size?: number | string;
  /** Stroke width */
  strokeWidth?: number;
  /** Animation variants */
  variants?: Variants;
  /** Initial animation state */
  initial?: AnimationTarget;
  /** Animate to this state */
  animate?: AnimationTarget;
  /** Exit animation state */
  exit?: TargetAndTransition | VariantLabels;
  /** Layout ID for shared element transitions */
  layoutId?: string;
  /** Whether to disable animations */
  disableAnimation?: boolean;
} & Omit<React.SVGProps<SVGSVGElement>, "ref">;

/**
 * AnimatedIcon - Wraps Lucide icons with Motion for animations
 *
 * @example
 * ```tsx
 * <AnimatedIcon
 *   icon={CheckIcon}
 *   animate={{ scale: 1, opacity: 1 }}
 *   initial={{ scale: 0, opacity: 0 }}
 * />
 * ```
 */
export function AnimatedIcon({
  icon: Icon,
  className,
  size,
  strokeWidth = 2,
  variants,
  initial = "initial" as VariantLabels,
  animate = "animate" as VariantLabels,
  exit = "exit" as VariantLabels,
  layoutId,
  disableAnimation = false,
  ...props
}: AnimatedIconProps) {
  // Filter out motion-specific props that conflict with SVG
  const {
    onAnimationStart: _onAnimationStart,
    onDrag: _onDrag,
    onDragStart: _onDragStart,
    onDragEnd: _onDragEnd,
    ...iconProps
  } = props as Record<string, unknown>;

  if (disableAnimation) {
    return (
      <Icon
        className={className}
        size={size}
        strokeWidth={strokeWidth}
        {...(iconProps as React.SVGProps<SVGSVGElement>)}
      />
    );
  }

  // Use motion.div wrapper instead of motion.create to avoid ESLint static-components error
  return (
    <motion.span
      className={cn("inline-flex shrink-0", className)}
      variants={variants}
      initial={initial}
      animate={animate}
      exit={exit}
      layoutId={layoutId}
      transition={springPresets.snappy}
    >
      <Icon
        size={size}
        strokeWidth={strokeWidth}
        {...(iconProps as React.SVGProps<SVGSVGElement>)}
      />
    </motion.span>
  );
}

// =============================================================================
// ICON MORPH - Morphs between two icons
// =============================================================================

export type IconMorphProps = {
  /** First icon (shown when isActive is false) */
  iconA: Icon;
  /** Second icon (shown when isActive is true) */
  iconB: Icon;
  /** Current state */
  isActive: boolean;
  /** Unique ID for layout animations */
  layoutId?: string;
  /** Icon size */
  size?: number | string;
  /** Stroke width */
  strokeWidth?: number;
  /** Additional className */
  className?: string;
  /** Whether to disable animations */
  disableAnimation?: boolean;
};

const morphVariants: Variants = {
  initial: { scale: 0, rotate: -90, opacity: 0 },
  animate: { scale: 1, rotate: 0, opacity: 1 },
  exit: { scale: 0, rotate: 90, opacity: 0 },
};

/**
 * IconMorph - Smoothly transitions between two icons
 *
 * @example
 * ```tsx
 * <IconMorph
 *   iconA={MenuIcon}
 *   iconB={XIcon}
 *   isActive={isMenuOpen}
 * />
 * ```
 */
export function IconMorph({
  iconA: IconA,
  iconB: IconB,
  isActive,
  layoutId,
  size = 24,
  strokeWidth = 2,
  className,
  disableAnimation = false,
}: IconMorphProps) {
  const CurrentIcon = isActive ? IconB : IconA;

  if (disableAnimation) {
    return (
      <CurrentIcon
        className={className}
        size={size}
        strokeWidth={strokeWidth}
      />
    );
  }

  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <AnimatedIcon
          key={isActive ? "active" : "inactive"}
          icon={CurrentIcon}
          size={size}
          strokeWidth={strokeWidth}
          variants={morphVariants}
          layoutId={layoutId}
          className="absolute inset-0"
        />
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// LOADING SPINNER
// Animated spinning loader
// =============================================================================

export type LoadingSpinnerProps = {
  /** Size of the spinner */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Additional className */
  className?: string;
  /** Whether to show the spinner */
  show?: boolean;
};

/**
 * LoadingSpinner - Animated loading indicator
 */
export function LoadingSpinner({
  size = 16,
  strokeWidth = 2,
  className,
  show = true,
}: LoadingSpinnerProps) {
  if (!show) return null;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("animate-spin", className)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={springPresets.snappy}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeOpacity={0.25}
        fill="none"
      />
      <path
        d="M12 2C6.477 2 2 6.477 2 12"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </motion.svg>
  );
}

// =============================================================================
// CHECKMARK ICON
// Animated check mark for success states
// =============================================================================

export type AnimatedCheckProps = {
  /** Size of the checkmark */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Additional className */
  className?: string;
  /** Whether to show the checkmark */
  show?: boolean;
  /** Delay before animation starts */
  delay?: number;
};

/**
 * AnimatedCheck - Draw-on checkmark animation
 */
export function AnimatedCheck({
  size = 24,
  strokeWidth = 2,
  className,
  show = true,
  delay = 0,
}: AnimatedCheckProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ ...springPresets.bouncy, delay }}
        >
          <motion.path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: delay + 0.1, ease: "easeOut" }}
          />
        </motion.svg>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// CLOSE BUTTON
// Circular close button with animation
// =============================================================================

export type CloseButtonProps = {
  /** Click handler */
  onClick?: () => void;
  /** Size of the button */
  size?: "sm" | "md" | "lg";
  /** Whether to disable animations */
  disableAnimation?: boolean;
  /** Additional className */
  className?: string;
  /** ARIA label */
  "aria-label"?: string;
};

const sizeMap = {
  sm: { button: 24, icon: 14 },
  md: { button: 32, icon: 18 },
  lg: { button: 40, icon: 22 },
};

/**
 * CloseButton - Circular close button with smooth animation
 */
export function CloseButton({
  onClick,
  size = "md",
  disableAnimation = false,
  className,
  "aria-label": ariaLabel = "Close",
}: CloseButtonProps) {
  const dimensions = sizeMap[size];

  const ButtonComponent = disableAnimation ? "button" : motion.button;
  const motionProps = disableAnimation
    ? {}
    : {
        whileHover: { scale: 1.1, backgroundColor: "var(--muted)" },
        whileTap: { scale: 0.95 },
        transition: springPresets.snappy,
      };

  return (
    <ButtonComponent
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      style={{
        width: dimensions.button,
        height: dimensions.button,
      }}
      aria-label={ariaLabel}
      {...motionProps}
    >
      <svg
        width={dimensions.icon}
        height={dimensions.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 6L6 18" />
        <path d="M6 6l12 12" />
      </svg>
    </ButtonComponent>
  );
}

// =============================================================================
// CHEVRON ICON
// Rotatable chevron for expandable sections
// =============================================================================

export type AnimatedChevronProps = {
  /** Direction/rotation state */
  direction: "up" | "down" | "left" | "right";
  /** Size of the chevron */
  size?: number;
  /** Additional className */
  className?: string;
  /** Whether to disable animations */
  disableAnimation?: boolean;
};

const rotationMap = {
  up: -90,
  down: 90,
  left: 180,
  right: 0,
};

/**
 * AnimatedChevron - Smoothly rotates between directions
 */
export function AnimatedChevron({
  direction,
  size = 16,
  className,
  disableAnimation = false,
}: AnimatedChevronProps) {
  const rotation = rotationMap[direction];

  const SvgComponent = disableAnimation ? "svg" : motion.svg;
  const motionProps = disableAnimation
    ? { style: { transform: `rotate(${rotation}deg)` } }
    : {
        animate: { rotate: rotation },
        transition: springPresets.snappy,
      };

  return (
    <SvgComponent
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...motionProps}
    >
      <path d="M9 18l6-6-6-6" />
    </SvgComponent>
  );
}

// =============================================================================
// DRAG HANDLE
// Pill indicator for draggable sheets
// =============================================================================

export type DragHandleProps = {
  /** Additional className */
  className?: string;
};

/**
 * DragHandle - Drag indicator pill for sheets
 */
export function DragHandle({ className }: DragHandleProps) {
  return (
    <div
      className={cn(
        "mx-auto w-10 h-1.5 rounded-full bg-muted-foreground/30",
        "shrink-0",
        className,
      )}
      aria-hidden="true"
    />
  );
}
