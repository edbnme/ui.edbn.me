"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { motion, type Variants } from "motion/react";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { springPresets, easings } from "@/lib/motion";
import { useShouldDisableAnimation } from "@/components/MotionProvider";

// =============================================================================
// ANIMATION VARIANTS
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
// DROPDOWN MENU CONTEXT
// =============================================================================

type DropdownMenuContextValue = {
  disableAnimation: boolean;
};

const DropdownMenuContext = React.createContext<DropdownMenuContextValue>({
  disableAnimation: false,
});

// =============================================================================
// DROPDOWN MENU ROOT
// =============================================================================

export type DropdownMenuProps = {
  /** Disable animations for this dropdown */
  disableAnimation?: boolean;
} & React.ComponentProps<typeof DropdownMenuPrimitive.Root>;

function DropdownMenu({
  disableAnimation,
  modal = false,
  ...props
}: DropdownMenuProps & { modal?: boolean }) {
  const shouldDisable = useShouldDisableAnimation(disableAnimation);

  return (
    <DropdownMenuContext.Provider value={{ disableAnimation: shouldDisable }}>
      <DropdownMenuPrimitive.Root
        data-slot="dropdown-menu"
        modal={modal}
        {...props}
      />
    </DropdownMenuContext.Provider>
  );
}

// =============================================================================
// DROPDOWN MENU PORTAL
// =============================================================================

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  );
}

// =============================================================================
// DROPDOWN MENU TRIGGER
// =============================================================================

const DropdownMenuTrigger = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Trigger>,
  React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>
>(({ ...props }, ref) => (
  <DropdownMenuPrimitive.Trigger
    ref={ref}
    data-slot="dropdown-menu-trigger"
    {...props}
  />
));

DropdownMenuTrigger.displayName = DropdownMenuPrimitive.Trigger.displayName;

// =============================================================================
// DROPDOWN MENU CONTENT
// Main dropdown panel with animations
// =============================================================================

const DropdownMenuContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentProps<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 6, children, ...props }, ref) => {
  const { disableAnimation } = React.useContext(DropdownMenuContext);

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
            "z-50 min-w-32 overflow-hidden rounded-xl border p-1.5",
            "bg-popover text-popover-foreground shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2",
            "data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2",
            "data-[side=top]:slide-in-from-bottom-2",
            "max-h-(--radix-dropdown-menu-content-available-height)",
            "origin-(--radix-dropdown-menu-content-transform-origin)",
            "overflow-y-auto",
            className
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
            "z-50 min-w-32 overflow-hidden rounded-2xl border border-border/40 p-2",
            // dropdown refinements
            "bg-popover/95 text-popover-foreground",
            "shadow-[0px_20px_45px_-22px_rgba(0,0,0,0.55)]",
            "supports-backdrop-filter:bg-popover/80 supports-backdrop-filter:backdrop-blur-2xl supports-backdrop-filter:backdrop-saturate-200",
            // Dark mode tuning
            "dark:border-white/10 dark:shadow-[0px_24px_50px_-28px_rgba(0,0,0,0.9)]",
            "max-h-(--radix-dropdown-menu-content-available-height)",
            "origin-(--radix-dropdown-menu-content-transform-origin)",
            "overflow-y-auto",
            className
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

DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

// =============================================================================
// DROPDOWN MENU GROUP
// =============================================================================

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  );
}

// =============================================================================
// DROPDOWN MENU ITEM
// =============================================================================

const DropdownMenuItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    variant?: "default" | "destructive";
  }
>(({ className, inset, variant = "default", ...props }, ref) => {
  const { disableAnimation } = React.useContext(DropdownMenuContext);

  const itemClass = cn(
    "relative flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm",
    "outline-none select-none",
    "transition-colors duration-75",
    "focus:bg-accent focus:text-accent-foreground",
    "data-[variant=destructive]:text-destructive",
    "data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20",
    "data-[variant=destructive]:focus:text-destructive",
    "data-[variant=destructive]:*:[svg]:!text-destructive",
    "[&_svg:not([class*='text-'])]:text-muted-foreground",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    "data-inset:pl-8",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    className
  );

  if (disableAnimation) {
    return (
      <DropdownMenuPrimitive.Item
        ref={ref}
        data-slot="dropdown-menu-item"
        data-inset={inset}
        data-variant={variant}
        className={itemClass}
        {...props}
      />
    );
  }

  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      data-slot="dropdown-menu-item"
      data-inset={inset}
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
        {props.children}
      </motion.div>
    </DropdownMenuPrimitive.Item>
  );
});

DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

// =============================================================================
// DROPDOWN MENU CHECKBOX ITEM
// =============================================================================

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => {
  const { disableAnimation } = React.useContext(DropdownMenuContext);

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

DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName;

// =============================================================================
// DROPDOWN MENU RADIO GROUP
// =============================================================================

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

// =============================================================================
// DROPDOWN MENU RADIO ITEM
// =============================================================================

const DropdownMenuRadioItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => {
  const { disableAnimation } = React.useContext(DropdownMenuContext);

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

DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

// =============================================================================
// DROPDOWN MENU LABEL
// header label
// =============================================================================

const DropdownMenuLabel = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    data-slot="dropdown-menu-label"
    data-inset={inset}
    className={cn(
      "px-2.5 py-2 text-xs font-semibold",
      "text-foreground/80",
      "data-inset:pl-8",
      className
    )}
    {...props}
  />
));

DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

// =============================================================================
// DROPDOWN MENU SEPARATOR
// separator
// =============================================================================

const DropdownMenuSeparator = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentProps<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    data-slot="dropdown-menu-separator"
    className={cn("bg-border/40 -mx-1 my-1 h-px", className)}
    {...props}
  />
));

DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

// =============================================================================
// DROPDOWN MENU SHORTCUT
// keyboard shortcut display
// =============================================================================

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"kbd">) {
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

// =============================================================================
// DROPDOWN MENU SUB
// =============================================================================

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

// =============================================================================
// DROPDOWN MENU SUB TRIGGER
// =============================================================================

const DropdownMenuSubTrigger = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => {
  const { disableAnimation } = React.useContext(DropdownMenuContext);

  const triggerClass = cn(
    "flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm",
    "outline-none select-none",
    "transition-colors duration-75",
    "focus:bg-accent focus:text-accent-foreground",
    "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
    "[&_svg:not([class*='text-'])]:text-muted-foreground",
    "data-inset:pl-8",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    className
  );

  if (disableAnimation) {
    return (
      <DropdownMenuPrimitive.SubTrigger
        ref={ref}
        data-slot="dropdown-menu-sub-trigger"
        data-inset={inset}
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
      data-inset={inset}
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

DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName;

// =============================================================================
// DROPDOWN MENU SUB CONTENT
// =============================================================================

const DropdownMenuSubContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => {
  const { disableAnimation } = React.useContext(DropdownMenuContext);

  if (disableAnimation) {
    return (
      <DropdownMenuPrimitive.SubContent
        ref={ref}
        data-slot="dropdown-menu-sub-content"
        className={cn(
          "z-50 min-w-32 overflow-hidden rounded-xl border p-1.5",
          "bg-popover text-popover-foreground shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2",
          "data-[side=top]:slide-in-from-bottom-2",
          "origin-(--radix-dropdown-menu-content-transform-origin)",
          className
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
          "z-50 min-w-32 overflow-hidden rounded-2xl border border-border/40 p-2",
          "bg-popover/95 text-popover-foreground",
          "shadow-[0px_18px_42px_-24px_rgba(0,0,0,0.55)]",
          "supports-backdrop-filter:bg-popover/80 supports-backdrop-filter:backdrop-blur-2xl supports-backdrop-filter:backdrop-saturate-200",
          "dark:border-white/10 dark:shadow-[0px_22px_46px_-28px_rgba(0,0,0,0.9)]",
          "origin-(--radix-dropdown-menu-content-transform-origin)",
          className
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

DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName;

// =============================================================================
// EXPORTS
// =============================================================================

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
