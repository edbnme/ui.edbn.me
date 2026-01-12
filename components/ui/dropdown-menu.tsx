/**
 * Dropdown Menu Component
 *
 * A comprehensive dropdown menu system with morphing animations, keyboard navigation,
 * and full accessibility support.
 *
 * Built on Radix UI primitives with custom motion animations.
 *
 * Based on WAI-ARIA Menu Button pattern.
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/menubutton/
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
  createContext,
  useContext,
  forwardRef,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";

// 2. External library imports
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import {
  motion,
  MotionConfig,
  type Transition,
  type Variants,
} from "motion/react";
import { CheckIcon, CaretRightIcon, CircleIcon } from "@phosphor-icons/react";

// 3. Internal imports
import { cn } from "@/lib/utils";
import { useShouldDisableAnimation } from "@/components/motion-provider";
import { useStableId } from "@/hooks/use-stable-id";
import { usePreventScroll } from "@/hooks/use-prevent-scroll";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Context value for DropdownMenu state management
 */
interface DropdownMenuContextValue {
  /** Whether the dropdown is open */
  isOpen: boolean;
  /** Unique ID for ARIA attributes */
  uniqueId: string;
  /** Whether animations are disabled */
  disableAnimation: boolean;
  /** Custom animation variants */
  variants: Variants;
  /** Spring transition for items */
  itemTransition: Transition;
}

// =============================================================================
// CONTEXT
// =============================================================================

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(
  null
);

/**
 * Hook to access DropdownMenu context
 * @param componentName - Name of the component using this hook (for error messages)
 * @throws Error if used outside DropdownMenu
 */
function useDropdownMenu(
  componentName = "DropdownMenuItem"
): DropdownMenuContextValue {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error(
      `${componentName} must be used within <DropdownMenu>. ` +
        "Wrap your component tree with <DropdownMenu>"
    );
  }
  return context;
}

// =============================================================================
// ANIMATION CONSTANTS & VARIANTS
// =============================================================================

/**
 * PREMIUM ANIMATION SYSTEM
 * - Refined spring physics for natural, premium feel
 * - Smooth ease curves for exits
 * - No jank or stuttering
 */

/** Primary spring transition - natural feel */
const menuTransition: Transition = {
  type: "spring" as const,
  stiffness: 380,
  damping: 30,
  mass: 0.9,
};

/** Item transition - quick and responsive */
const itemTransitionConfig: Transition = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 0.8,
};

/** Indicator pop transition */
const indicatorTransition: Transition = {
  type: "spring" as const,
  stiffness: 500,
  damping: 28,
  mass: 0.6,
};

/** Sub-menu reveal transition */
const subContentTransition: Transition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
  mass: 0.85,
};

/**
 * Premium exit curve - smooth deceleration
 */
const exitEase = [0.32, 0, 0.67, 0] as const;

/**
 * Default variants for dropdown content
 */
const DEFAULT_MENU_VARIANTS: Variants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    y: -6,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      ...menuTransition,
      staggerChildren: 0.025,
      delayChildren: 0.015,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -3,
    transition: {
      type: "tween" as const,
      duration: 0.15,
      ease: exitEase,
    },
  },
};

/**
 * Variants for sub-menu content
 */
const subMenuVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.97,
    x: -6,
  },
  animate: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      ...subContentTransition,
      staggerChildren: 0.02,
      delayChildren: 0.01,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    x: -3,
    transition: {
      type: "tween" as const,
      duration: 0.12,
      ease: exitEase,
    },
  },
};

/**
 * Variants for individual menu items
 */
const itemVariants: Variants = {
  initial: {
    opacity: 0,
    y: -3,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    transition: {
      type: "tween" as const,
      duration: 0.1,
      ease: exitEase,
    },
  },
};

/**
 * Variants for checkbox/radio indicators
 */
const indicatorVariants: Variants = {
  initial: {
    scale: 0.5,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
  },
  exit: {
    scale: 0.5,
    opacity: 0,
    transition: {
      type: "tween" as const,
      duration: 0.08,
      ease: exitEase,
    },
  },
};

// =============================================================================
// DROPDOWN MENU ROOT
// =============================================================================

/**
 * DropdownMenu props
 */
export interface DropdownMenuProps {
  /** Child components */
  children: ReactNode;
  /** Custom transition for animations */
  transition?: Transition;
  /** Controlled open state */
  open?: boolean;
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Disable all animations */
  disableAnimation?: boolean;
  /** Custom animation variants */
  variants?: Variants;
  /** Whether to render as modal */
  modal?: boolean;
  /** Whether to prevent page scroll when open */
  preventScroll?: boolean;
  /** Direction for RTL support */
  dir?: "ltr" | "rtl";
}

/**
 * DropdownMenu - Container component that manages dropdown state
 *
 * Provides context for all child components and handles
 * controlled/uncontrolled state management.
 *
 * @example
 * ```tsx
 * <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
 *   <DropdownMenuTrigger>Open</DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuItem>Item 1</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 * ```
 */
function DropdownMenu({
  children,
  transition = menuTransition,
  open,
  defaultOpen = false,
  onOpenChange,
  disableAnimation: disableAnimationProp,
  variants = DEFAULT_MENU_VARIANTS,
  modal = false,
  preventScroll = false,
  dir,
}: DropdownMenuProps) {
  // Track open state for context
  const [isOpen, setIsOpen] = React.useState(open ?? defaultOpen);

  // Sync with controlled open prop
  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  // Handle open changes
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setIsOpen(newOpen);
      onOpenChange?.(newOpen);
    },
    [onOpenChange]
  );

  // Generate stable IDs
  const uniqueId = useStableId("dropdown-menu");

  // Animation preference
  const shouldDisableAnimation =
    useShouldDisableAnimation(disableAnimationProp);

  // Prevent body scroll when open
  usePreventScroll(preventScroll && isOpen);

  // Memoized context value
  const contextValue = useMemo<DropdownMenuContextValue>(
    () => ({
      isOpen,
      uniqueId,
      disableAnimation: shouldDisableAnimation,
      variants,
      itemTransition: itemTransitionConfig,
    }),
    [isOpen, uniqueId, shouldDisableAnimation, variants]
  );

  return (
    <DropdownMenuContext.Provider value={contextValue}>
      <MotionConfig transition={transition}>
        <DropdownMenuPrimitive.Root
          open={open}
          defaultOpen={defaultOpen}
          onOpenChange={handleOpenChange}
          modal={modal}
          dir={dir}
          data-slot="dropdown-menu"
        >
          {children}
        </DropdownMenuPrimitive.Root>
      </MotionConfig>
    </DropdownMenuContext.Provider>
  );
}

DropdownMenu.displayName = "DropdownMenu";

// =============================================================================
// DROPDOWN MENU PORTAL
// =============================================================================

/**
 * DropdownMenuPortal props
 */
export interface DropdownMenuPortalProps {
  /** Child content */
  children: ReactNode;
  /** Container element for the portal */
  container?: HTMLElement | null;
  /** Force mounting for animation control */
  forceMount?: true;
}

/**
 * DropdownMenuPortal - Renders content in a portal
 */
function DropdownMenuPortal({
  children,
  container,
  forceMount,
}: DropdownMenuPortalProps) {
  return (
    <DropdownMenuPrimitive.Portal
      container={container}
      forceMount={forceMount}
      data-slot="dropdown-menu-portal"
    >
      {children}
    </DropdownMenuPrimitive.Portal>
  );
}

DropdownMenuPortal.displayName = "DropdownMenuPortal";

// =============================================================================
// DROPDOWN MENU TRIGGER
// =============================================================================

/**
 * DropdownMenuTrigger props
 */
export interface DropdownMenuTriggerProps
  extends React.ComponentProps<typeof DropdownMenuPrimitive.Trigger> {
  /** Merge props with child element */
  asChild?: boolean;
}

/**
 * DropdownMenuTrigger - Button that opens the dropdown
 */
const DropdownMenuTrigger = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Trigger>,
  DropdownMenuTriggerProps
>(({ className, asChild = false, ...props }, ref) => {
  const { uniqueId, isOpen } = useDropdownMenu("DropdownMenuTrigger");

  return (
    <DropdownMenuPrimitive.Trigger
      ref={ref}
      asChild={asChild}
      aria-controls={`${uniqueId}-content`}
      data-slot="dropdown-menu-trigger"
      data-state={isOpen ? "open" : "closed"}
      className={cn(
        "outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    />
  );
});

DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

// =============================================================================
// DROPDOWN MENU CONTENT
// =============================================================================

/**
 * DropdownMenuContent props
 */
export interface DropdownMenuContentProps
  extends Omit<
    React.ComponentProps<typeof DropdownMenuPrimitive.Content>,
    "asChild"
  > {
  /** Offset from the trigger */
  sideOffset?: number;
  /** Alignment relative to trigger */
  align?: "start" | "center" | "end";
  /** Side to render on */
  side?: "top" | "right" | "bottom" | "left";
  /** Enable loop navigation */
  loop?: boolean;
  /** Force mounting for animation control */
  forceMount?: true;
}

/**
 * DropdownMenuContent - Main dropdown panel with animations
 */
const DropdownMenuContent = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  DropdownMenuContentProps
>(
  (
    {
      className,
      sideOffset = 6,
      align = "start",
      side = "bottom",
      loop = true,
      forceMount,
      children,
      ...props
    },
    ref
  ) => {
    const { disableAnimation, uniqueId, variants } = useDropdownMenu(
      "DropdownMenuContent"
    );

    // Base classes for dropdown content
    const contentClasses = cn(
      // Layout
      "z-[100] min-w-32 overflow-hidden rounded-2xl border p-2",
      // Colors
      "bg-popover text-popover-foreground",
      // Shadow
      "shadow-lg",
      // Sizing
      "max-h-[var(--radix-dropdown-menu-content-available-height)]",
      // Transform origin for animations
      "origin-[var(--radix-dropdown-menu-content-transform-origin)]",
      // Scroll
      "overflow-y-auto",
      className
    );

    // Non-animated version
    if (disableAnimation) {
      return (
        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            ref={ref}
            id={`${uniqueId}-content`}
            data-slot="dropdown-menu-content"
            data-state="open"
            sideOffset={sideOffset}
            align={align}
            side={side}
            loop={loop}
            forceMount={forceMount}
            onCloseAutoFocus={(e) => e.preventDefault()}
            className={cn(
              contentClasses,
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

    // Animated version with motion
    return (
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          ref={ref}
          id={`${uniqueId}-content`}
          sideOffset={sideOffset}
          align={align}
          side={side}
          loop={loop}
          forceMount={forceMount}
          onCloseAutoFocus={(e) => e.preventDefault()}
          asChild
          {...props}
        >
          <motion.div
            data-slot="dropdown-menu-content"
            className={cn(
              contentClasses,
              // Enhanced styling for animated version
              "border-border/60",
              "bg-popover/98",
              "shadow-lg shadow-black/15",
              // Subtle glassmorphism - static blur (NOT animated)
              "supports-backdrop-filter:bg-popover/90",
              "supports-backdrop-filter:backdrop-blur-xl",
              // Dark mode enhancements
              "dark:border-white/15",
              "dark:shadow-xl dark:shadow-black/30"
            )}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {children}
          </motion.div>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    );
  }
);

DropdownMenuContent.displayName = "DropdownMenuContent";

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
 * DropdownMenuGroup - Groups related items together
 */
function DropdownMenuGroup({ className, ...props }: DropdownMenuGroupProps) {
  return (
    <DropdownMenuPrimitive.Group
      data-slot="dropdown-menu-group"
      className={cn(className)}
      {...props}
    />
  );
}

DropdownMenuGroup.displayName = "DropdownMenuGroup";

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
 * DropdownMenuItem - Interactive menu item
 */
const DropdownMenuItem = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
  DropdownMenuItemProps
>(({ className, inset, variant = "default", children, ...props }, ref) => {
  const { disableAnimation, itemTransition } =
    useDropdownMenu("DropdownMenuItem");

  const itemClass = cn(
    // Layout
    "relative flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm",
    // Focus & interaction
    "outline-none select-none",
    "transition-colors duration-75",
    "focus:bg-accent focus:text-accent-foreground",
    // Destructive variant
    "data-[variant=destructive]:text-destructive",
    "data-[variant=destructive]:focus:bg-destructive/10",
    "dark:data-[variant=destructive]:focus:bg-destructive/20",
    "data-[variant=destructive]:focus:text-destructive",
    "data-[variant=destructive]:*:[svg]:!text-destructive",
    // Icon styling
    "[&_svg:not([class*='text-'])]:text-muted-foreground",
    // Disabled state
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    // Inset padding
    inset && "pl-8",
    // SVG sizing
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
        className={itemClass}
        variants={itemVariants}
        transition={itemTransition}
      >
        {children}
      </motion.div>
    </DropdownMenuPrimitive.Item>
  );
});

DropdownMenuItem.displayName = "DropdownMenuItem";

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
 * DropdownMenuCheckboxItem - Toggleable checkbox item
 */
const DropdownMenuCheckboxItem = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  DropdownMenuCheckboxItemProps
>(({ className, children, checked, ...props }, ref) => {
  const { disableAnimation, itemTransition } = useDropdownMenu(
    "DropdownMenuCheckboxItem"
  );

  const itemClass = cn(
    // Layout
    "relative flex cursor-default items-center gap-2 rounded-lg py-2 pr-2.5 pl-9 text-sm",
    // Focus & interaction
    "outline-none select-none",
    "transition-colors duration-75",
    "focus:bg-accent focus:text-accent-foreground",
    // Disabled state
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    // SVG sizing
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    className
  );

  const indicatorContent = (
    <span className="pointer-events-none absolute left-2.5 flex size-4 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator asChild>
        {disableAnimation ? (
          <CheckIcon className="size-4" aria-hidden="true" />
        ) : (
          <motion.div
            variants={indicatorVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={indicatorTransition}
          >
            <CheckIcon className="size-4" aria-hidden="true" />
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
        className={itemClass}
        variants={itemVariants}
        transition={itemTransition}
      >
        {indicatorContent}
        {children}
      </motion.div>
    </DropdownMenuPrimitive.CheckboxItem>
  );
});

DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

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
 * DropdownMenuRadioGroup - Groups radio items together
 */
function DropdownMenuRadioGroup({
  className,
  ...props
}: DropdownMenuRadioGroupProps) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      className={cn(className)}
      {...props}
    />
  );
}

DropdownMenuRadioGroup.displayName = "DropdownMenuRadioGroup";

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
 * DropdownMenuRadioItem - Selectable radio item
 */
const DropdownMenuRadioItem = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.RadioItem>,
  DropdownMenuRadioItemProps
>(({ className, children, ...props }, ref) => {
  const { disableAnimation, itemTransition } = useDropdownMenu(
    "DropdownMenuRadioItem"
  );

  const itemClass = cn(
    // Layout
    "relative flex cursor-default items-center gap-2 rounded-lg py-2 pr-2.5 pl-9 text-sm",
    // Focus & interaction
    "outline-none select-none",
    "transition-colors duration-75",
    "focus:bg-accent focus:text-accent-foreground",
    // Disabled state
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    // SVG sizing
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    className
  );

  const indicatorContent = (
    <span className="pointer-events-none absolute left-2.5 flex size-4 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator asChild>
        {disableAnimation ? (
          <CircleIcon
            className="size-2.5 fill-current"
            aria-hidden="true"
            weight="fill"
          />
        ) : (
          <motion.div
            variants={indicatorVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={indicatorTransition}
          >
            <CircleIcon
              className="size-2.5 fill-current"
              aria-hidden="true"
              weight="fill"
            />
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
        className={itemClass}
        variants={itemVariants}
        transition={itemTransition}
      >
        {indicatorContent}
        {children}
      </motion.div>
    </DropdownMenuPrimitive.RadioItem>
  );
});

DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

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
 * DropdownMenuLabel - Non-interactive label for a group
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

DropdownMenuLabel.displayName = "DropdownMenuLabel";

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
 * DropdownMenuSeparator - Visual divider between items
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

DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

// =============================================================================
// DROPDOWN MENU SHORTCUT
// =============================================================================

/**
 * DropdownMenuShortcut props
 */
export type DropdownMenuShortcutProps = React.ComponentProps<"kbd">;

/**
 * DropdownMenuShortcut - Keyboard shortcut indicator
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

DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

// =============================================================================
// DROPDOWN MENU SUB
// =============================================================================

/**
 * DropdownMenuSub props
 */
export interface DropdownMenuSubProps {
  /** Child components */
  children: ReactNode;
  /** Controlled open state */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
}

/**
 * DropdownMenuSub - Nested submenu container
 */
function DropdownMenuSub({
  children,
  open,
  defaultOpen,
  onOpenChange,
}: DropdownMenuSubProps) {
  return (
    <DropdownMenuPrimitive.Sub
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      data-slot="dropdown-menu-sub"
    >
      {children}
    </DropdownMenuPrimitive.Sub>
  );
}

DropdownMenuSub.displayName = "DropdownMenuSub";

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
 * DropdownMenuSubTrigger - Opens a nested submenu
 */
const DropdownMenuSubTrigger = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubTrigger>,
  DropdownMenuSubTriggerProps
>(({ className, inset, children, ...props }, ref) => {
  const { disableAnimation, itemTransition } = useDropdownMenu(
    "DropdownMenuSubTrigger"
  );

  const triggerClass = cn(
    // Layout
    "flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm",
    // Focus & interaction
    "outline-none select-none",
    "transition-colors duration-75",
    "focus:bg-accent focus:text-accent-foreground",
    // Open state
    "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
    // Icon styling
    "[&_svg:not([class*='text-'])]:text-muted-foreground",
    // Inset padding
    inset && "pl-8",
    // SVG sizing
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
        <CaretRightIcon className="ml-auto size-4" aria-hidden="true" />
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
        className={triggerClass}
        variants={itemVariants}
        transition={itemTransition}
      >
        {children}
        <CaretRightIcon className="ml-auto size-4" aria-hidden="true" />
      </motion.div>
    </DropdownMenuPrimitive.SubTrigger>
  );
});

DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

// =============================================================================
// DROPDOWN MENU SUB CONTENT
// =============================================================================

/**
 * DropdownMenuSubContent props
 */
export interface DropdownMenuSubContentProps
  extends React.ComponentProps<typeof DropdownMenuPrimitive.SubContent> {
  /** Offset from the trigger */
  sideOffset?: number;
  /** Alignment relative to trigger */
  alignOffset?: number;
}

/**
 * DropdownMenuSubContent - Content panel for a submenu
 */
const DropdownMenuSubContent = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubContent>,
  DropdownMenuSubContentProps
>(({ className, sideOffset = 2, alignOffset = -4, ...props }, ref) => {
  const { disableAnimation } = useDropdownMenu("DropdownMenuSubContent");

  const contentClasses = cn(
    // Layout
    "z-[100] min-w-32 overflow-hidden rounded-2xl border p-2",
    // Colors
    "bg-popover text-popover-foreground",
    // Shadow
    "shadow-lg",
    // Transform origin
    "origin-[var(--radix-dropdown-menu-content-transform-origin)]",
    className
  );

  if (disableAnimation) {
    return (
      <DropdownMenuPrimitive.SubContent
        ref={ref}
        data-slot="dropdown-menu-sub-content"
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className={cn(
          contentClasses,
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
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      asChild
      {...props}
    >
      <motion.div
        data-slot="dropdown-menu-sub-content"
        className={cn(
          contentClasses,
          // Enhanced styling
          "border-border/60",
          "bg-popover/98",
          "shadow-lg shadow-black/15",
          // Subtle glassmorphism - static blur
          "supports-backdrop-filter:bg-popover/90",
          "supports-backdrop-filter:backdrop-blur-xl",
          // Dark mode
          "dark:border-white/15",
          "dark:shadow-xl dark:shadow-black/30"
        )}
        variants={subMenuVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      />
    </DropdownMenuPrimitive.SubContent>
  );
});

DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * DropdownMenu components following shadcn/ui export pattern.
 *
 * @example
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
 */
export {
  DropdownMenu,
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
