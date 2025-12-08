"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { springPresets } from "@/lib/motion";
import { LoadingSpinner, AnimatedCheck } from "@/lib/icons";
import { useShouldDisableAnimation } from "@/components/MotionProvider";

// =============================================================================
// RIPPLE HOOK
// =============================================================================

type Ripple = { x: number; y: number; size: number; key: number };

const useRipple = () => {
  const [ripples, setRipples] = React.useState<Ripple[]>([]);

  const createRipple = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const newRipple = { x, y, size, key: Date.now() };
      setRipples((prev) => [...prev, newRipple]);
    },
    []
  );

  React.useEffect(() => {
    if (ripples.length > 0) {
      const lastRipple = ripples[ripples.length - 1];
      const timeout = setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.key !== lastRipple.key));
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [ripples]);

  return { ripples, createRipple };
};

// =============================================================================
// BUTTON VARIANTS (CVA)
// Extends shadcn variants with refinements
// =============================================================================

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-lg text-sm font-medium",
    "transition-colors duration-150",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
    "shrink-0 [&_svg]:shrink-0",
    "outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    // refinements
    "select-none",
  ].join(" "),
  {
    variants: {
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
  }
);

// =============================================================================
// BUTTON TYPES
// =============================================================================

export type ButtonProps = {
  /** Render as a different element using Radix Slot */
  asChild?: boolean;
  /** Show loading spinner and disable button */
  loading?: boolean;
  /** Show success state with checkmark */
  success?: boolean;
  /** Icon to display at the start (left side) */
  iconStart?: LucideIcon;
  /** Icon to display at the end (right side) */
  iconEnd?: LucideIcon;
  /** Disable all animations */
  disableAnimation?: boolean;
} & VariantProps<typeof buttonVariants> &
  Omit<React.ComponentProps<"button">, "ref">;

// =============================================================================
// BUTTON COMPONENT
// =============================================================================

/**
 * Button - Unified button component with animations
 *
 * Features:
 * - All shadcn variants (default, destructive, outline, secondary, ghost, link)
 * - Motion press feedback (scale on tap)
 * - Loading state with animated spinner
 * - Icon support with enter/exit animations
 * - Respects reduced motion preferences
 * - Full ARIA compliance
 *
 * @example
 * ```tsx
 * <Button variant="default" size="lg" loading={isSubmitting}>
 *   Submit
 * </Button>
 *
 * <Button variant="outline" iconStart={PlusIcon}>
 *   Add Item
 * </Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
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
    ref
  ) => {
    const shouldDisableAnimation = useShouldDisableAnimation(disableAnimation);
    const isDisabled = disabled || loading;
    const { ripples, createRipple } = useRipple();

    // Only show ripple for certain variants (not ghost or link)
    const showRipple = variant !== "ghost" && variant !== "link";

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!loading && !success && showRipple) {
        createRipple(event);
      }
      onClick?.(event);
    };

    // Common props for both animated and non-animated versions
    const commonProps = {
      "data-slot": "button",
      className: cn(
        buttonVariants({ variant, size, className }),
        showRipple && "relative overflow-hidden"
      ),
      disabled: isDisabled,
      "aria-busy": loading,
      "aria-disabled": isDisabled,
      onClick: handleClick,
      ...props,
    };

    // Icon content - use stable rendering without AnimatePresence to prevent flickering
    // When success: show checkmark (replaces iconStart position)
    // When loading: show spinner (replaces iconStart position, or standalone if no iconStart)
    // When not loading/success: show iconStart if provided
    const iconStartContent =
      IconStart && !loading && !success ? (
        <IconStart
          key="icon-start"
          className="shrink-0"
          size={size === "sm" || size === "icon-sm" ? 14 : 16}
        />
      ) : null;

    // Single loading spinner - only one spinner ever shown
    const loadingSpinner = loading ? (
      <LoadingSpinner
        key="loading-spinner"
        size={size === "sm" || size === "icon-sm" ? 14 : 16}
      />
    ) : null;

    // Success checkmark
    const successCheck =
      success && !loading ? (
        <AnimatedCheck
          key="success-check"
          size={size === "sm" || size === "icon-sm" ? 14 : 16}
          className="shrink-0"
        />
      ) : null;

    const iconEndContent =
      IconEnd && !loading && !success ? (
        <IconEnd
          key="icon-end"
          className="shrink-0"
          size={size === "sm" || size === "icon-sm" ? 14 : 16}
        />
      ) : null;

    // Content wrapper
    const buttonContent = (
      <>
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loadingSpinner}
          {successCheck}
          {iconStartContent}
          {children}
          {iconEndContent}
        </span>
        {showRipple && (
          <span
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: loading || success ? 0 : 1,
              transition: "opacity 200ms ease-out",
            }}
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
                  transform: `scale(0)`,
                }}
              />
            ))}
          </span>
        )}
      </>
    );

    // Use Slot for asChild
    if (asChild) {
      return (
        <Slot ref={ref} {...commonProps}>
          {children}
        </Slot>
      );
    }

    // Non-animated version
    if (shouldDisableAnimation) {
      return (
        <button ref={ref} {...commonProps}>
          {buttonContent}
        </button>
      );
    }

    // Animated version with motion.button
    // Extract motion-conflicting props from commonProps
    const {
      onAnimationStart: _onAnimationStart,
      onDrag: _onDrag,
      onDragStart: _onDragStart,
      onDragEnd: _onDragEnd,
      ...restCommonProps
    } = commonProps;

    return (
      <motion.button
        ref={ref}
        {...restCommonProps}
        whileTap={isDisabled ? undefined : { scale: 0.97 }}
        whileHover={isDisabled ? undefined : { scale: 1.01 }}
        transition={springPresets.interactive}
      >
        {buttonContent}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

// =============================================================================
// ICON BUTTON
// Specialized button for icon-only usage
// =============================================================================

export type IconButtonProps = {
  /** The icon to display */
  icon: LucideIcon;
  /** Accessible label (required for icon-only buttons) */
  "aria-label": string;
  /** Show loading spinner */
  loading?: boolean;
  /** Disable animations */
  disableAnimation?: boolean;
} & Omit<ButtonProps, "iconStart" | "iconEnd" | "children" | "asChild">;

/**
 * IconButton - Icon-only button with proper accessibility
 *
 * @example
 * ```tsx
 * <IconButton icon={XIcon} aria-label="Close" variant="ghost" />
 * ```
 */
const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = "icon", ...props }, ref) => {
    return <Button ref={ref} size={size} iconStart={icon} {...props} />;
  }
);

IconButton.displayName = "IconButton";

// =============================================================================
// EXPORTS
// =============================================================================

export { Button, IconButton, buttonVariants };
