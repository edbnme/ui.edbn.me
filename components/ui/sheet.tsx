/**
 * Sheet Component
 *
 * A slide-out panel component that appears from any edge of the screen.
 * Features drag-to-dismiss, smooth animations, and proper focus management.
 *
 * Built on Radix UI Dialog primitive.
 *
 * @packageDocumentation
 */

"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { DragHandle, CloseButton } from "@/lib/icons";
import { useShouldDisableAnimation } from "@/components/motion-provider";

// =============================================================================
// SHEET VARIANTS (CVA)
// side panels
// =============================================================================

const sheetVariants = cva(
  [
    "fixed z-[101] flex flex-col",
    "bg-background/98 backdrop-blur-2xl backdrop-saturate-150",
    "shadow-2xl shadow-black/30",
    // Dark mode
    "dark:bg-background/95 dark:shadow-black/50",
  ].join(" "),
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b border-border/40 rounded-b-2xl max-h-[85vh]",
        right:
          "inset-y-0 right-0 h-full w-[85vw] border-l border-border/40 sm:max-w-md rounded-l-2xl",
        bottom:
          "inset-x-0 bottom-0 border-t border-border/40 rounded-t-2xl max-h-[85vh]",
        left: "inset-y-0 left-0 h-full w-[85vw] border-r border-border/40 sm:max-w-md rounded-r-2xl",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

// =============================================================================
// SHEET CONTEXT
// =============================================================================

type SheetContextValue = {
  disableAnimation: boolean;
  side: "top" | "right" | "bottom" | "left";
  enableDrag: boolean;
};

const SheetContext = React.createContext<SheetContextValue>({
  disableAnimation: false,
  side: "right",
  enableDrag: true,
});

// =============================================================================
// SHEET ROOT
// =============================================================================

export type SheetProps = {
  /** Disable animations for this sheet */
  disableAnimation?: boolean;
  /** Enable swipe-to-dismiss gesture (default: true) */
  enableDrag?: boolean;
} & React.ComponentProps<typeof SheetPrimitive.Root>;

function Sheet({
  disableAnimation,
  enableDrag = true,
  onOpenChange,
  ...props
}: SheetProps) {
  const shouldDisable = useShouldDisableAnimation(disableAnimation);

  return (
    <SheetContext.Provider
      value={{
        disableAnimation: shouldDisable,
        side: "right",
        enableDrag,
      }}
    >
      <SheetPrimitive.Root
        data-slot="sheet"
        onOpenChange={onOpenChange}
        {...props}
      />
    </SheetContext.Provider>
  );
}

// =============================================================================
// SHEET TRIGGER
// =============================================================================

const SheetTrigger = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Trigger>,
  React.ComponentProps<typeof SheetPrimitive.Trigger>
>(({ ...props }, ref) => (
  <SheetPrimitive.Trigger ref={ref} data-slot="sheet-trigger" {...props} />
));

SheetTrigger.displayName = SheetPrimitive.Trigger.displayName;

// =============================================================================
// SHEET CLOSE
// =============================================================================

const SheetClose = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Close>,
  React.ComponentProps<typeof SheetPrimitive.Close>
>(({ ...props }, ref) => (
  <SheetPrimitive.Close ref={ref} data-slot="sheet-close" {...props} />
));

SheetClose.displayName = SheetPrimitive.Close.displayName;

// =============================================================================
// SHEET PORTAL
// =============================================================================

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

// =============================================================================
// SHEET OVERLAY
// backdrop with blur
// =============================================================================

const SheetOverlay = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Overlay>,
  React.ComponentProps<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  const { disableAnimation } = React.useContext(SheetContext);

  return (
    <SheetPrimitive.Overlay
      ref={ref}
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-100",
        "bg-black/50 backdrop-blur-xl backdrop-saturate-150",
        disableAnimation
          ? "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          : "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-300",
        className,
      )}
      {...props}
    />
  );
});

SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

// =============================================================================
// SHEET CONTENT
// Main sheet panel with drag-to-dismiss
// =============================================================================

export type SheetContentProps = {
  /** Show the Modern drag handle indicator */
  showDragHandle?: boolean;
  /** Show close button */
  showCloseButton?: boolean;
} & VariantProps<typeof sheetVariants> &
  React.ComponentProps<typeof SheetPrimitive.Content>;

const SheetContent = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(
  (
    {
      className,
      children,
      side: sideProp = "right",
      showDragHandle = true,
      showCloseButton = true,
      ...props
    },
    ref,
  ) => {
    // Ensure side is never null/undefined
    const side = sideProp ?? "right";

    return (
      <SheetPortal>
        <SheetOverlay />
        <SheetPrimitive.Content
          ref={ref}
          data-slot="sheet-content"
          className={cn(
            sheetVariants({ side }),
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            side === "right" &&
              "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
            side === "left" &&
              "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
            side === "top" &&
              "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
            side === "bottom" &&
              "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
            "duration-300 ease-out",
            className,
          )}
          {...props}
        >
          {/* Drag Handle for bottom/top sheets */}
          {(side === "bottom" || side === "top") && showDragHandle && (
            <DragHandle
              className={cn(side === "bottom" ? "mt-3 mb-1" : "mb-3 mt-1")}
            />
          )}

          {/* Close Button */}
          {showCloseButton && (
            <SheetPrimitive.Close asChild>
              <CloseButton
                className="absolute top-4 right-4 z-10"
                aria-label="Close sheet"
              />
            </SheetPrimitive.Close>
          )}

          {children}
        </SheetPrimitive.Content>
      </SheetPortal>
    );
  },
);

SheetContent.displayName = SheetPrimitive.Content.displayName;

// =============================================================================
// SHEET HEADER
// header with border separator
// =============================================================================

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        "flex flex-col gap-1 px-5 pt-5 pb-4",
        "border-b border-border/40",
        className,
      )}
      {...props}
    />
  );
}

// =============================================================================
// SHEET FOOTER
// footer with action buttons
// =============================================================================

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "mt-auto flex flex-col gap-2 px-5 py-4",
        "border-t border-border/40",
        "bg-muted/30",
        className,
      )}
      {...props}
    />
  );
}

// =============================================================================
// SHEET TITLE
// title
// =============================================================================

const SheetTitle = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Title>,
  React.ComponentProps<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    data-slot="sheet-title"
    className={cn(
      "text-base font-semibold tracking-tight leading-none",
      "text-foreground",
      className,
    )}
    {...props}
  />
));

SheetTitle.displayName = SheetPrimitive.Title.displayName;

// =============================================================================
// SHEET DESCRIPTION
// description
// =============================================================================

const SheetDescription = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Description>,
  React.ComponentProps<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    data-slot="sheet-description"
    className={cn(
      "text-[13px] text-muted-foreground leading-relaxed",
      className,
    )}
    {...props}
  />
));

SheetDescription.displayName = SheetPrimitive.Description.displayName;

// =============================================================================
// SHEET BODY
// Scrollable content area with padding
// =============================================================================

function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-body"
      className={cn(
        "flex-1 overflow-y-auto px-5 py-4",
        // Modern overscroll behavior
        "overscroll-contain",
        className,
      )}
      {...props}
    />
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetBody,
  sheetVariants,
};
