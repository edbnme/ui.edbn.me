/**
 * Button Component
 *
 * A production-grade button with animations, loading states, and full accessibility.
 * Follows the component philosophy: open (full source), reliable (battle-tested),
 * comprehensive (rich API), and customizable.
 *
 * @packageDocumentation
 */

"use client";

// =============================================================================
// IMPORTS
// =============================================================================

// 1. React imports
import * as React from "react";
import {
  forwardRef,
  useCallback,
  useState,
  useEffect,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from "react";

// 2. External library imports
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "motion/react";
import type { Icon } from "@phosphor-icons/react";

// 3. Internal imports
import { cn } from "@/lib/utils";
import { springPresets, gestures } from "@/lib/animations";
import { LoadingSpinner, AnimatedCheck } from "@/lib/icons";
import { useShouldDisableAnimation } from "@/components/motion-provider";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Ripple effect data structure
 */
interface Ripple {
  x: number;
  y: number;
  size: number;
  key: number;
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to manage ripple effects on button click
 *
 * Creates expanding circular ripples from the click point,
 * automatically cleaning up after animation completes.
 */
function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const createRipple = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const newRipple: Ripple = { x, y, size, key: Date.now() };
      setRipples((prev) => [...prev, newRipple]);
    },
    [],
  );

  // Auto-cleanup ripples after animation
  useEffect(() => {
    if (ripples.length > 0) {
      const lastRipple = ripples[ripples.length - 1];
      const timeout = setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.key !== lastRipple.key));
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [ripples]);

  return { ripples, createRipple };
}

// =============================================================================
// VARIANTS (CVA)
// Defined outside component for performance
// =============================================================================

/**
 * Button variants using class-variance-authority
 *
 * Includes all standard variants plus refinements for shadows,
 * focus states, and accessibility.
 */
const buttonVariants = cva(
  // Base styles - always applied
  [
    // Layout
    "inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0",
    // Typography
    "text-sm font-medium",
    // Shape
    "rounded-lg",
    // Transitions
    "transition-colors duration-150",
    // Disabled state
    "disabled:pointer-events-none disabled:opacity-50",
    // Icon sizing
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
    // Focus ring
    "outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    // Error state (aria-invalid)
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    // Usability
    "select-none",
  ].join(" "),
  {
    variants: {
      /**
       * Visual style variants
       */
      variant: {
        default: [
          "bg-primary text-primary-foreground",
          "shadow-sm shadow-primary/20",
          "hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25",
          "active:shadow-sm",
        ].join(" "),

        destructive: [
          "bg-destructive text-white",
          "shadow-sm shadow-destructive/20",
          "hover:bg-destructive/90 hover:shadow-md hover:shadow-destructive/25",
          "focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
          "dark:bg-destructive/80",
        ].join(" "),

        outline: [
          "border border-input bg-background",
          "shadow-xs",
          "hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20",
          "dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        ].join(" "),

        secondary: [
          "bg-secondary text-secondary-foreground",
          "shadow-xs",
          "hover:bg-secondary/80 hover:shadow-sm",
        ].join(" "),

        ghost: [
          "hover:bg-accent hover:text-accent-foreground",
          "dark:hover:bg-accent/50",
        ].join(" "),

        link: ["text-primary underline-offset-4", "hover:underline"].join(" "),
      },

      /**
       * Size variants
       */
      size: {
        default: "h-10 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-9 rounded-md gap-1.5 px-4 text-xs has-[>svg]:px-3",
        lg: "h-11 rounded-lg px-7 text-base has-[>svg]:px-5",
        xl: "h-12 rounded-xl px-8 text-base has-[>svg]:px-6",
        icon: "size-10",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// =============================================================================
// COMPONENT PROPS
// =============================================================================

/**
 * Button component props
 */
export interface ButtonProps
  extends
    Omit<ComponentPropsWithoutRef<"button">, "ref">,
    VariantProps<typeof buttonVariants> {
  /**
   * Render as a different element using Radix Slot pattern.
   * When true, button merges props with its child element.
   *
   * @example
   * ```tsx
   * <Button asChild>
   *   <a href="/home">Go Home</a>
   * </Button>
   * ```
   */
  asChild?: boolean;

  /**
   * Show loading spinner and disable interactions.
   * Replaces iconStart with a spinner.
   */
  loading?: boolean;

  /**
   * Show success state with animated checkmark.
   * Replaces iconStart with a check icon.
   */
  success?: boolean;

  /**
   * Icon to display at the start (left side).
   * Hidden during loading/success states.
   */
  iconStart?: Icon;

  /**
   * Icon to display at the end (right side).
   * Hidden during loading/success states.
   */
  iconEnd?: Icon;

  /**
   * Disable all animations for this button.
   * Overrides global motion provider settings.
   */
  disableAnimation?: boolean;
}

// =============================================================================
// BUTTON COMPONENT
// =============================================================================

/**
 * Button - Unified button component with animations and rich features.
 *
 * Features:
 * - All standard variants (default, destructive, outline, secondary, ghost, link)
 * - Motion press feedback (scale on tap)
 * - Ripple effect on click
 * - Loading state with animated spinner
 * - Success state with checkmark
 * - Icon support with proper positioning
 * - Respects reduced motion preferences
 * - Full ARIA compliance
 * - Polymorphic with asChild pattern
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Button variant="default" size="lg">
 *   Submit
 * </Button>
 *
 * // With loading state
 * <Button loading={isSubmitting}>
 *   Save Changes
 * </Button>
 *
 * // With icons
 * <Button variant="outline" iconStart={PlusIcon}>
 *   Add Item
 * </Button>
 *
 * // As a link
 * <Button asChild>
 *   <a href="/dashboard">Dashboard</a>
 * </Button>
 * ```
 */
const Button = forwardRef<ElementRef<"button">, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      success = false,
      iconStart: IconStart,
      iconEnd: IconEnd,
      disableAnimation,
      disabled,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    // Animation preference
    const shouldDisableAnimation = useShouldDisableAnimation(disableAnimation);
    const isDisabled = disabled || loading;

    // Ripple effect management
    const { ripples, createRipple } = useRipple();

    // Determine if ripple should show (not on ghost/link variants)
    const showRipple = variant !== "ghost" && variant !== "link";

    /**
     * Handle click with ripple creation
     */
    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!loading && !success && showRipple) {
          createRipple(event);
        }
        onClick?.(event);
      },
      [loading, success, showRipple, createRipple, onClick],
    );

    // =========================================================================
    // Determine icon sizes based on button size
    // =========================================================================
    const iconSize = size === "sm" || size === "icon-sm" ? 14 : 16;

    // =========================================================================
    // Icon content - stable rendering without AnimatePresence
    // =========================================================================
    const iconStartContent =
      IconStart && !loading && !success ? (
        <IconStart
          key="icon-start"
          className="shrink-0"
          size={iconSize}
          aria-hidden="true"
        />
      ) : null;

    const loadingSpinner = loading ? (
      <LoadingSpinner
        key="loading-spinner"
        size={iconSize}
        aria-hidden="true"
      />
    ) : null;

    const successCheck =
      success && !loading ? (
        <AnimatedCheck
          key="success-check"
          size={iconSize}
          className="shrink-0"
          aria-hidden="true"
        />
      ) : null;

    const iconEndContent =
      IconEnd && !loading && !success ? (
        <IconEnd
          key="icon-end"
          className="shrink-0"
          size={iconSize}
          aria-hidden="true"
        />
      ) : null;

    // =========================================================================
    // Content wrapper with icons and children
    // =========================================================================
    const buttonContent = (
      <>
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loadingSpinner}
          {successCheck}
          {iconStartContent}
          {children}
          {iconEndContent}
        </span>

        {/* Ripple container */}
        {showRipple && (
          <span
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{
              opacity: loading || success ? 0 : 1,
              transition: "opacity 200ms ease-out",
            }}
            aria-hidden="true"
          >
            {ripples.map((ripple) => (
              <span
                className="animate-rippling absolute rounded-full opacity-30"
                key={ripple.key}
                style={{
                  width: `${ripple.size}px`,
                  height: `${ripple.size}px`,
                  top: `${ripple.y}px`,
                  left: `${ripple.x}px`,
                  backgroundColor: "currentColor",
                  transform: "scale(0)",
                }}
              />
            ))}
          </span>
        )}
      </>
    );

    // =========================================================================
    // Common props for all button variations
    // =========================================================================
    const commonProps = {
      "data-slot": "button",
      "data-loading": loading || undefined,
      "data-success": success || undefined,
      className: cn(
        buttonVariants({ variant, size, className }),
        showRipple && "relative overflow-hidden",
      ),
      disabled: isDisabled,
      "aria-busy": loading || undefined,
      "aria-disabled": isDisabled || undefined,
      onClick: handleClick,
      ...props,
    };

    // =========================================================================
    // Render: asChild pattern using Slot
    // =========================================================================
    if (asChild) {
      return (
        <Slot ref={ref} {...commonProps}>
          {children}
        </Slot>
      );
    }

    // =========================================================================
    // Render: Non-animated version
    // =========================================================================
    if (shouldDisableAnimation) {
      return (
        <button ref={ref} {...commonProps}>
          {buttonContent}
        </button>
      );
    }

    // =========================================================================
    // Render: Animated version with motion.button
    // =========================================================================
    // Extract motion-conflicting props
    const {
      onAnimationStart: _onAnimationStart,
      onDrag: _onDrag,
      onDragStart: _onDragStart,
      onDragEnd: _onDragEnd,
      ...restCommonProps
    } = commonProps as typeof commonProps & Partial<HTMLMotionProps<"button">>;

    return (
      <motion.button
        ref={ref}
        {...restCommonProps}
        whileTap={isDisabled ? undefined : gestures.button.whileTap}
        whileHover={isDisabled ? undefined : gestures.button.whileHover}
        transition={springPresets.interactive}
      >
        {buttonContent}
      </motion.button>
    );
  },
);

Button.displayName = "Button";

// =============================================================================
// ICON BUTTON COMPONENT
// Specialized button for icon-only usage
// =============================================================================

/**
 * IconButton component props
 */
export interface IconButtonProps extends Omit<
  ButtonProps,
  "iconStart" | "iconEnd" | "children" | "asChild"
> {
  /**
   * The icon to display (required)
   */
  icon: Icon;

  /**
   * Accessible label (required for icon-only buttons)
   */
  "aria-label": string;
}

/**
 * IconButton - Icon-only button with proper accessibility
 *
 * Forces an aria-label for accessibility since there's no visible text.
 *
 * @example
 * ```tsx
 * <IconButton icon={XIcon} aria-label="Close dialog" variant="ghost" />
 * ```
 */
const IconButton = forwardRef<ElementRef<"button">, IconButtonProps>(
  ({ icon, size = "icon", ...props }, ref) => {
    return <Button ref={ref} size={size} iconStart={icon} {...props} />;
  },
);

IconButton.displayName = "IconButton";

// =============================================================================
// EXPORTS
// =============================================================================

export { Button, IconButton, buttonVariants };
export type { ButtonProps as ButtonRootProps };
