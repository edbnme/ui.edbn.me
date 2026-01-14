/**
 * Avatar Component
 *
 * A composable avatar component with multiple sizes, status indicators,
 * and group stacking support. Handles image loading states gracefully.
 *
 * Built on Radix UI Avatar primitive.
 *
 * @packageDocumentation
 */

"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// =============================================================================
// AVATAR VARIANTS
// =============================================================================

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        xs: "size-6 text-[10px]",
        sm: "size-8 text-xs",
        md: "size-10 text-sm",
        lg: "size-12 text-base",
        xl: "size-14 text-lg",
        "2xl": "size-16 text-xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const statusVariants = cva(
  "absolute bottom-0 right-0 rounded-full border-background",
  {
    variants: {
      status: {
        online: "bg-green-500",
        offline: "bg-gray-400",
        away: "bg-yellow-500",
        busy: "bg-red-500",
      },
      size: {
        xs: "size-1.5 border",
        sm: "size-2 border",
        md: "size-2.5 border-2",
        lg: "size-3 border-2",
        xl: "size-3.5 border-2",
        "2xl": "size-4 border-2",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

// =============================================================================
// TYPES
// =============================================================================

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type AvatarStatus = "online" | "offline" | "away" | "busy";

export interface AvatarProps
  extends
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  /** Status indicator */
  status?: AvatarStatus;
}

export type AvatarImageProps = React.ComponentPropsWithoutRef<
  typeof AvatarPrimitive.Image
>;

export type AvatarFallbackProps = React.ComponentPropsWithoutRef<
  typeof AvatarPrimitive.Fallback
>;

// =============================================================================
// AVATAR ROOT
// =============================================================================

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, status, children, ...props }, ref) => (
  <div className="relative inline-flex shrink-0" data-slot="avatar">
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(avatarVariants({ size }), className)}
      {...props}
    >
      {children}
    </AvatarPrimitive.Root>
    {status && (
      <span
        className={cn(statusVariants({ status, size }))}
        aria-label={`Status: ${status}`}
      />
    )}
  </div>
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

// =============================================================================
// AVATAR IMAGE
// =============================================================================

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

// =============================================================================
// AVATAR FALLBACK
// =============================================================================

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted font-medium text-muted-foreground",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

// =============================================================================
// AVATAR GROUP
// =============================================================================

export interface AvatarGroupProps {
  children: React.ReactNode;
  /** Maximum visible avatars before showing +N */
  max?: number;
  /** Size for the overflow indicator */
  size?: AvatarSize;
  /** Additional className */
  className?: string;
}

function AvatarGroup({
  children,
  max = 4,
  size = "md",
  className,
}: AvatarGroupProps) {
  const avatars = React.Children.toArray(children);
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div
      className={cn(
        "flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        className,
      )}
    >
      {visible.map((child, i) => (
        <div key={i} style={{ zIndex: visible.length - i }}>
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            "relative flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground ring-2 ring-background",
            avatarVariants({ size }),
          )}
          style={{ zIndex: 0 }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

AvatarGroup.displayName = "AvatarGroup";

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup };
