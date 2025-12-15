/**
 * Dropdown Menu Component
 *
 * A comprehensive dropdown menu system with animations, keyboard navigation,
 * and full accessibility support.
 *
 * Built on Radix UI primitives with custom motion animations.
 *
 * @packageDocumentation
 */

"use client";

// =============================================================================
// IMPORTS
// =============================================================================

// 1. React imports
import * as React from "react";
import { createContext, useContext, forwardRef, useMemo } from "react";

// 2. External library imports
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { motion, type Variants } from "motion/react";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

// 3. Internal imports
import { cn } from "@/lib/utils";
import { springPresets, easings } from "@/lib/animations";
import { useShouldDisableAnimation } from "@/components/MotionProvider";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Context value for DropdownMenu animation state
 */
interface DropdownMenuContextValue {
  /** Whether animations are disabled */
  disableAnimation: boolean;
}

// =============================================================================
// CONTEXT
// =============================================================================

const DropdownMenuContext = createContext<DropdownMenuContextValue>({
  disableAnimation: false,
});

/**
 * Hook to access DropdownMenu context
 */
function useDropdownMenu(): DropdownMenuContextValue {
  return useContext(DropdownMenuContext);
}

// =============================================================================
// SPRING PRESETS FOR DROPDOWN
// =============================================================================

const menuSpring = {
  ...springPresets.smooth,
  stiffness: 260,
  damping: 32,
  mass: 1.02,
};

const itemSpring = {
  ...springPresets.smooth,
  stiffness: 360,
  damping: 34,
  mass: 0.9,
};

const indicatorSpring = {
  ...springPresets.bouncy,
  stiffness: 460,
  damping: 28,
  mass: 0.9,
};

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const menuVariants: Variants = {
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
      ...menuSpring,
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

const itemVariants: Variants = {
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

const checkVariants: Variants = {
  initial: {
    scale: 0.6,
    opacity: 0,
    rotate: -8,
  },
  animate: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: indicatorSpring,
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

// =============================================================================
// DROPDOWN MENU ROOT
// =============================================================================

/**
 * DropdownMenuRoot props
 */
export interface DropdownMenuRootProps
  extends React.ComponentProps<typeof DropdownMenuPrimitive.Root> {
  /** Disable animations for this dropdown */
  disableAnimation?: boolean;
}

/**
 * DropdownMenu.Root - Container component that manages dropdown state
 *
 * @example
 * ```tsx
 * <DropdownMenu.Root>
 *   <DropdownMenu.Trigger>Open</DropdownMenu.Trigger>
 *   <DropdownMenu.Content>
 *     <DropdownMenu.Item>Item 1</DropdownMenu.Item>
 *   </DropdownMenu.Content>
 * </DropdownMenu.Root>
 * ```
 */
function DropdownMenuRoot({
  disableAnimation,
  modal = false,
  ...props
}: DropdownMenuRootProps) {
  const shouldDisable = useShouldDisableAnimation(disableAnimation);

  const contextValue = useMemo<DropdownMenuContextValue>(
    () => ({ disableAnimation: shouldDisable }),
    [shouldDisable]
  );

  return (
    <DropdownMenuContext.Provider value={contextValue}>
      <DropdownMenuPrimitive.Root
        data-slot="dropdown-menu"
        modal={modal}
        {...props}
      />
    </DropdownMenuContext.Provider>
  );
}

DropdownMenuRoot.displayName = "DropdownMenu.Root";

// =============================================================================
// DROPDOWN MENU PORTAL
// =============================================================================

/**
 * DropdownMenuPortal props
 */
export type DropdownMenuPortalProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.Portal
>;

/**
 * DropdownMenu.Portal - Renders content in a portal
 */
function DropdownMenuPortal(props: DropdownMenuPortalProps) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  );
}

DropdownMenuPortal.displayName = "DropdownMenu.Portal";

// =============================================================================
// DROPDOWN MENU TRIGGER
// =============================================================================

/**
 * DropdownMenuTrigger props
 */
export type DropdownMenuTriggerProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.Trigger
>;

/**
 * DropdownMenu.Trigger - Button that opens the dropdown
 */
const DropdownMenuTrigger = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Trigger>,
  DropdownMenuTriggerProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Trigger
    ref={ref}
    data-slot="dropdown-menu-trigger"
    className={cn("outline-none", className)}
    {...props}
  />
));

DropdownMenuTrigger.displayName = "DropdownMenu.Trigger";

// =============================================================================
// DROPDOWN MENU CONTENT
// =============================================================================

/**
 * DropdownMenuContent props
 */
export interface DropdownMenuContentProps
  extends React.ComponentProps<typeof DropdownMenuPrimitive.Content> {
  /** Offset from the trigger */
  sideOffset?: number;
}

/**
 * DropdownMenu.Content - Main dropdown panel with animations
 */
const DropdownMenuContent = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  DropdownMenuContentProps
>(({ className, sideOffset = 6, children, ...props }, ref) => {
  const { disableAnimation } = useDropdownMenu();

  // Base classes for dropdown content
  const baseClasses = cn(
    "z-50 min-w-32 overflow-hidden rounded-2xl border p-2",
    "bg-popover text-popover-foreground",
    "shadow-lg",
    "max-h-[var(--radix-dropdown-menu-content-available-height)]",
    "origin-[var(--radix-dropdown-menu-content-transform-origin)]",
    "overflow-y-auto",
    className
  );

  // Non-animated version
  if (disableAnimation) {
    return (
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          ref={ref}
          data-slot="dropdown-menu-content"
          sideOffset={sideOffset}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className={cn(
            baseClasses,
            "border-border",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2",
            "data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2",
            "data-[side=top]:slide-in-from-bottom-2"
          )}
          {...props}
        >
          {children}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    );
  }

  // Animated version
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        onCloseAutoFocus={(e) => e.preventDefault()}
        asChild
        {...props}
      >
        <motion.div
          layout
          layoutRoot
          data-slot="dropdown-menu-content"
          className={cn(
            baseClasses,
            "border-border/40",
            "bg-popover/95",
            "shadow-[0px_20px_45px_-22px_rgba(0,0,0,0.55)]",
            "supports-backdrop-filter:bg-popover/80",
            "supports-backdrop-filter:backdrop-blur-2xl",
            "supports-backdrop-filter:backdrop-saturate-200",
            "dark:border-white/10",
            "dark:shadow-[0px_24px_50px_-28px_rgba(0,0,0,0.9)]"
          )}
          variants={menuVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ willChange: "transform, opacity, filter" }}
        >
          {children}
        </motion.div>
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
});

DropdownMenuContent.displayName = "DropdownMenu.Content";

// =============================================================================
// DROPDOWN MENU GROUP
// =============================================================================

/**
 * DropdownMenuGroup props
 */
export type DropdownMenuGroupProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.Group
>;

/**
 * DropdownMenu.Group - Groups related items together
 */
function DropdownMenuGroup(props: DropdownMenuGroupProps) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  );
}

DropdownMenuGroup.displayName = "DropdownMenu.Group";

// =============================================================================
// DROPDOWN MENU ITEM
// =============================================================================

/**
 * DropdownMenuItem props
 */
export interface DropdownMenuItemProps
  extends React.ComponentProps<typeof DropdownMenuPrimitive.Item> {
  /** Add left padding for alignment with checkbox/radio items */
  inset?: boolean;
  /** Visual variant */
  variant?: "default" | "destructive";
}

/**
 * DropdownMenu.Item - Interactive menu item
 */
const DropdownMenuItem = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
  DropdownMenuItemProps
>(({ className, inset, variant = "default", children, ...props }, ref) => {
  const { disableAnimation } = useDropdownMenu();

  const itemClass = cn(
    "relative flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm",
    "outline-none select-none",
    "transition-colors duration-75",
    "focus:bg-accent focus:text-accent-foreground",
    "data-[variant=destructive]:text-destructive",
    "data-[variant=destructive]:focus:bg-destructive/10",
    "dark:data-[variant=destructive]:focus:bg-destructive/20",
    "data-[variant=destructive]:focus:text-destructive",
    "data-[variant=destructive]:*:[svg]:!text-destructive",
    "[&_svg:not([class*='text-'])]:text-muted-foreground",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    inset && "pl-8",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    className
  );

  if (disableAnimation) {
    return (
      <DropdownMenuPrimitive.Item
        ref={ref}
        data-slot="dropdown-menu-item"
        data-inset={inset ? "true" : undefined}
        data-variant={variant}
        className={itemClass}
        {...props}
      >
        {children}
      </DropdownMenuPrimitive.Item>
    );
  }

  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      data-slot="dropdown-menu-item"
      data-inset={inset ? "true" : undefined}
      data-variant={variant}
      asChild
      {...props}
    >
      <motion.div
        layout
        className={itemClass}
        variants={itemVariants}
        transition={itemSpring}
        style={{ willChange: "transform, opacity, filter" }}
      >
        {children}
      </motion.div>
    </DropdownMenuPrimitive.Item>
  );
});

DropdownMenuItem.displayName = "DropdownMenu.Item";

// =============================================================================
// DROPDOWN MENU CHECKBOX ITEM
// =============================================================================

/**
 * DropdownMenuCheckboxItem props
 */
export type DropdownMenuCheckboxItemProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.CheckboxItem
>;

/**
 * DropdownMenu.CheckboxItem - Toggleable checkbox item
 */
const DropdownMenuCheckboxItem = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  DropdownMenuCheckboxItemProps
>(({ className, children, checked, ...props }, ref) => {
  const { disableAnimation } = useDropdownMenu();

  const itemClass = cn(
    "relative flex cursor-default items-center gap-2 rounded-lg py-2 pr-2.5 pl-9 text-sm",
    "outline-none select-none",
    "transition-colors duration-75",
    "focus:bg-accent focus:text-accent-foreground",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    className
  );

  const indicatorContent = (
    <span className="pointer-events-none absolute left-2.5 flex size-4 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator asChild>
        {disableAnimation ? (
          <CheckIcon className="size-4" />
        ) : (
          <motion.div
            variants={checkVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <CheckIcon className="size-4" />
          </motion.div>
        )}
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
  );

  if (disableAnimation) {
    return (
      <DropdownMenuPrimitive.CheckboxItem
        ref={ref}
        data-slot="dropdown-menu-checkbox-item"
        className={itemClass}
        checked={checked}
        {...props}
      >
        {indicatorContent}
        {children}
      </DropdownMenuPrimitive.CheckboxItem>
    );
  }

  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      data-slot="dropdown-menu-checkbox-item"
      checked={checked}
      asChild
      {...props}
    >
      <motion.div
        layout
        className={itemClass}
        variants={itemVariants}
        transition={itemSpring}
        style={{ willChange: "transform, opacity, filter" }}
      >
        {indicatorContent}
        {children}
      </motion.div>
    </DropdownMenuPrimitive.CheckboxItem>
  );
});

DropdownMenuCheckboxItem.displayName = "DropdownMenu.CheckboxItem";

// =============================================================================
// DROPDOWN MENU RADIO GROUP
// =============================================================================

/**
 * DropdownMenuRadioGroup props
 */
export type DropdownMenuRadioGroupProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.RadioGroup
>;

/**
 * DropdownMenu.RadioGroup - Groups radio items together
 */
function DropdownMenuRadioGroup(props: DropdownMenuRadioGroupProps) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

DropdownMenuRadioGroup.displayName = "DropdownMenu.RadioGroup";

// =============================================================================
// DROPDOWN MENU RADIO ITEM
// =============================================================================

/**
 * DropdownMenuRadioItem props
 */
export type DropdownMenuRadioItemProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.RadioItem
>;

/**
 * DropdownMenu.RadioItem - Selectable radio item
 */
const DropdownMenuRadioItem = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.RadioItem>,
  DropdownMenuRadioItemProps
>(({ className, children, ...props }, ref) => {
  const { disableAnimation } = useDropdownMenu();

  const itemClass = cn(
    "relative flex cursor-default items-center gap-2 rounded-lg py-2 pr-2.5 pl-9 text-sm",
    "outline-none select-none",
    "transition-colors duration-75",
    "focus:bg-accent focus:text-accent-foreground",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    className
  );

  const indicatorContent = (
    <span className="pointer-events-none absolute left-2.5 flex size-4 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator asChild>
        {disableAnimation ? (
          <CircleIcon className="size-2.5 fill-current" />
        ) : (
          <motion.div
            variants={checkVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <CircleIcon className="size-2.5 fill-current" />
          </motion.div>
        )}
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
  );

  if (disableAnimation) {
    return (
      <DropdownMenuPrimitive.RadioItem
        ref={ref}
        data-slot="dropdown-menu-radio-item"
        className={itemClass}
        {...props}
      >
        {indicatorContent}
        {children}
      </DropdownMenuPrimitive.RadioItem>
    );
  }

  return (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      data-slot="dropdown-menu-radio-item"
      asChild
      {...props}
    >
      <motion.div
        layout
        className={itemClass}
        variants={itemVariants}
        transition={itemSpring}
        style={{ willChange: "transform, opacity, filter" }}
      >
        {indicatorContent}
        {children}
      </motion.div>
    </DropdownMenuPrimitive.RadioItem>
  );
});

DropdownMenuRadioItem.displayName = "DropdownMenu.RadioItem";

// =============================================================================
// DROPDOWN MENU LABEL
// =============================================================================

/**
 * DropdownMenuLabel props
 */
export interface DropdownMenuLabelProps
  extends React.ComponentProps<typeof DropdownMenuPrimitive.Label> {
  /** Add left padding for alignment */
  inset?: boolean;
}

/**
 * DropdownMenu.Label - Non-interactive label for a group
 */
const DropdownMenuLabel = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Label>,
  DropdownMenuLabelProps
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    data-slot="dropdown-menu-label"
    data-inset={inset ? "true" : undefined}
    className={cn(
      "px-2.5 py-2 text-xs font-semibold",
      "text-foreground/80",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));

DropdownMenuLabel.displayName = "DropdownMenu.Label";

// =============================================================================
// DROPDOWN MENU SEPARATOR
// =============================================================================

/**
 * DropdownMenuSeparator props
 */
export type DropdownMenuSeparatorProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.Separator
>;

/**
 * DropdownMenu.Separator - Visual divider between items
 */
const DropdownMenuSeparator = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Separator>,
  DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    data-slot="dropdown-menu-separator"
    className={cn("bg-border/40 -mx-1 my-1 h-px", className)}
    {...props}
  />
));

DropdownMenuSeparator.displayName = "DropdownMenu.Separator";

// =============================================================================
// DROPDOWN MENU SHORTCUT
// =============================================================================

/**
 * DropdownMenuShortcut props
 */
export type DropdownMenuShortcutProps = React.ComponentProps<"kbd">;

/**
 * DropdownMenu.Shortcut - Keyboard shortcut indicator
 */
function DropdownMenuShortcut({
  className,
  ...props
}: DropdownMenuShortcutProps) {
  return (
    <kbd
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-[10px] tracking-widest",
        "text-muted-foreground/60",
        className
      )}
      {...props}
    />
  );
}

DropdownMenuShortcut.displayName = "DropdownMenu.Shortcut";

// =============================================================================
// DROPDOWN MENU SUB
// =============================================================================

/**
 * DropdownMenuSub props
 */
export type DropdownMenuSubProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.Sub
>;

/**
 * DropdownMenu.Sub - Nested submenu container
 */
function DropdownMenuSub(props: DropdownMenuSubProps) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

DropdownMenuSub.displayName = "DropdownMenu.Sub";

// =============================================================================
// DROPDOWN MENU SUB TRIGGER
// =============================================================================

/**
 * DropdownMenuSubTrigger props
 */
export interface DropdownMenuSubTriggerProps
  extends React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> {
  /** Add left padding for alignment */
  inset?: boolean;
}

/**
 * DropdownMenu.SubTrigger - Opens a nested submenu
 */
const DropdownMenuSubTrigger = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubTrigger>,
  DropdownMenuSubTriggerProps
>(({ className, inset, children, ...props }, ref) => {
  const { disableAnimation } = useDropdownMenu();

  const triggerClass = cn(
    "flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm",
    "outline-none select-none",
    "transition-colors duration-75",
    "focus:bg-accent focus:text-accent-foreground",
    "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
    "[&_svg:not([class*='text-'])]:text-muted-foreground",
    inset && "pl-8",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    className
  );

  if (disableAnimation) {
    return (
      <DropdownMenuPrimitive.SubTrigger
        ref={ref}
        data-slot="dropdown-menu-sub-trigger"
        data-inset={inset ? "true" : undefined}
        className={triggerClass}
        {...props}
      >
        {children}
        <ChevronRightIcon className="ml-auto size-4" />
      </DropdownMenuPrimitive.SubTrigger>
    );
  }

  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset ? "true" : undefined}
      asChild
      {...props}
    >
      <motion.div
        layout
        className={triggerClass}
        variants={itemVariants}
        transition={itemSpring}
        style={{ willChange: "transform, opacity, filter" }}
      >
        {children}
        <ChevronRightIcon className="ml-auto size-4" />
      </motion.div>
    </DropdownMenuPrimitive.SubTrigger>
  );
});

DropdownMenuSubTrigger.displayName = "DropdownMenu.SubTrigger";

// =============================================================================
// DROPDOWN MENU SUB CONTENT
// =============================================================================

/**
 * DropdownMenuSubContent props
 */
export type DropdownMenuSubContentProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.SubContent
>;

/**
 * DropdownMenu.SubContent - Content panel for a submenu
 */
const DropdownMenuSubContent = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubContent>,
  DropdownMenuSubContentProps
>(({ className, ...props }, ref) => {
  const { disableAnimation } = useDropdownMenu();

  const baseClasses = cn(
    "z-50 min-w-32 overflow-hidden rounded-2xl border p-2",
    "bg-popover text-popover-foreground shadow-lg",
    "origin-[var(--radix-dropdown-menu-content-transform-origin)]",
    className
  );

  if (disableAnimation) {
    return (
      <DropdownMenuPrimitive.SubContent
        ref={ref}
        data-slot="dropdown-menu-sub-content"
        className={cn(
          baseClasses,
          "border-border",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2",
          "data-[side=top]:slide-in-from-bottom-2"
        )}
        {...props}
      />
    );
  }

  return (
    <DropdownMenuPrimitive.SubContent ref={ref} asChild {...props}>
      <motion.div
        layout
        data-slot="dropdown-menu-sub-content"
        className={cn(
          baseClasses,
          "border-border/40",
          "bg-popover/95",
          "shadow-[0px_18px_42px_-24px_rgba(0,0,0,0.55)]",
          "supports-backdrop-filter:bg-popover/80",
          "supports-backdrop-filter:backdrop-blur-2xl",
          "supports-backdrop-filter:backdrop-saturate-200",
          "dark:border-white/10",
          "dark:shadow-[0px_22px_46px_-28px_rgba(0,0,0,0.9)]"
        )}
        variants={menuVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ willChange: "transform, opacity, filter" }}
      />
    </DropdownMenuPrimitive.SubContent>
  );
});

DropdownMenuSubContent.displayName = "DropdownMenu.SubContent";

// =============================================================================
// COMPOUND COMPONENT EXPORT
// =============================================================================

/**
 * DropdownMenu compound component with sub-components attached.
 *
 * Can be used as either:
 * 1. Direct component: `<DropdownMenu>` (equivalent to `<DropdownMenu.Root>`)
 * 2. Namespace pattern: `<DropdownMenu.Root>`, `<DropdownMenu.Trigger>`, etc.
 *
 * @example Direct usage (recommended for tests and simple cases)
 * ```tsx
 * <DropdownMenu>
 *   <DropdownMenuTrigger asChild>
 *     <Button>Open</Button>
 *   </DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuItem>Edit</DropdownMenuItem>
 *     <DropdownMenuItem>Duplicate</DropdownMenuItem>
 *     <DropdownMenuSeparator />
 *     <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 * ```
 *
 * @example Namespace pattern (recommended for documentation)
 * ```tsx
 * <DropdownMenu.Root>
 *   <DropdownMenu.Trigger asChild>
 *     <Button>Open</Button>
 *   </DropdownMenu.Trigger>
 *   <DropdownMenu.Content>
 *     <DropdownMenu.Item>Edit</DropdownMenu.Item>
 *     <DropdownMenu.Item>Duplicate</DropdownMenu.Item>
 *     <DropdownMenu.Separator />
 *     <DropdownMenu.Item variant="destructive">Delete</DropdownMenu.Item>
 *   </DropdownMenu.Content>
 * </DropdownMenu.Root>
 * ```
 */
const DropdownMenu = Object.assign(DropdownMenuRoot, {
  Root: DropdownMenuRoot,
  Portal: DropdownMenuPortal,
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Group: DropdownMenuGroup,
  Item: DropdownMenuItem,
  CheckboxItem: DropdownMenuCheckboxItem,
  RadioGroup: DropdownMenuRadioGroup,
  RadioItem: DropdownMenuRadioItem,
  Label: DropdownMenuLabel,
  Separator: DropdownMenuSeparator,
  Shortcut: DropdownMenuShortcut,
  Sub: DropdownMenuSub,
  SubTrigger: DropdownMenuSubTrigger,
  SubContent: DropdownMenuSubContent,
});

// =============================================================================
// EXPORTS
// =============================================================================

// Primary export: Compound component with namespace
export { DropdownMenu };

// Named exports for direct imports
export {
  DropdownMenuRoot,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
