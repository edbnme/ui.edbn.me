/**
 * Popover Component
 *
 * A styled, reusable UI component for displaying rich content in a portal-like layer.
 * Features morphing animations, focus management, and full accessibility.
 *
 * Based on WAI-ARIA Disclosure and Dialog patterns.
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
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

// 2. External library imports
import {
  motion,
  AnimatePresence,
  MotionConfig,
  type Transition,
  type Variants,
} from "motion/react";

// 3. Internal imports
import { cn } from "@/lib/utils";
import { createMorphingPopoverVariants } from "@/lib/animations";
import { useShouldDisableAnimation } from "@/components/MotionProvider";
import { useStableId } from "@/hooks/useStableId";
import { useControllableBoolean } from "@/hooks/useControllableState";
import useClickOutside from "@/hooks/useClickOutside";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Context value for Popover state management
 */
interface PopoverContextValue {
  /** Whether the popover is open */
  isOpen: boolean;
  /** Set the open state */
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  /** Open the popover */
  open: () => void;
  /** Close the popover */
  close: () => void;
  /** Toggle the popover */
  toggle: () => void;
  /** Unique ID for ARIA attributes */
  uniqueId: string;
  /** Ref to the trigger element for focus return */
  triggerRef: React.RefObject<HTMLElement | null>;
  /** Ref to the content element */
  contentRef: React.RefObject<HTMLDivElement | null>;
  /** Whether animations are disabled */
  disableAnimation: boolean;
  /** Custom animation variants */
  variants: Variants;
}

// =============================================================================
// CONTEXT
// =============================================================================

const PopoverContext = createContext<PopoverContextValue | null>(null);

/**
 * Hook to access Popover context
 * @param componentName - Name of the component using this hook (for error messages)
 * @throws Error if used outside Popover
 */
function usePopover(componentName = "PopoverTrigger"): PopoverContextValue {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error(`${componentName} must be used within Popover`);
  }
  return context;
}

// =============================================================================
// SPRING PRESETS FOR POPOVER
// =============================================================================

const popoverTransition: Transition = {
  type: "spring" as const,
  bounce: 0.15,
  duration: 0.45,
};

const DEFAULT_VARIANTS: Variants = createMorphingPopoverVariants();

// =============================================================================
// UTILITY HOOKS
// =============================================================================

// Removed unused useIsMounted - using context for mount state

// =============================================================================
// POPOVER ROOT
// =============================================================================

/**
 * PopoverRoot props
 */
export interface PopoverRootProps {
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
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Popover.Root - Container component that manages popover state
 *
 * Provides context for all child components and handles
 * controlled/uncontrolled state management.
 *
 * @example
 * ```tsx
 * <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
 *   <Popover.Trigger>Open</Popover.Trigger>
 *   <Popover.Content>...</Popover.Content>
 * </Popover.Root>
 * ```
 */
function PopoverRoot({
  children,
  transition = popoverTransition,
  open,
  defaultOpen = false,
  onOpenChange,
  disableAnimation: disableAnimationProp,
  variants = DEFAULT_VARIANTS,
  className,
  style,
}: PopoverRootProps) {
  // Controlled/uncontrolled state
  const [isOpen, setIsOpen] = useControllableBoolean({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  // Generate stable IDs
  const uniqueId = useStableId("popover");

  // Refs for focus management
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Animation preference
  const shouldDisableAnimation =
    useShouldDisableAnimation(disableAnimationProp);

  // Convenience methods
  const openPopover = useCallback(() => setIsOpen(true), [setIsOpen]);
  const closePopover = useCallback(() => setIsOpen(false), [setIsOpen]);
  const togglePopover = useCallback(
    () => setIsOpen((prev) => !prev),
    [setIsOpen]
  );

  // Memoized context value
  const contextValue = useMemo<PopoverContextValue>(
    () => ({
      isOpen,
      setIsOpen,
      open: openPopover,
      close: closePopover,
      toggle: togglePopover,
      uniqueId,
      triggerRef,
      contentRef,
      disableAnimation: shouldDisableAnimation,
      variants,
    }),
    [
      isOpen,
      setIsOpen,
      openPopover,
      closePopover,
      togglePopover,
      uniqueId,
      shouldDisableAnimation,
      variants,
    ]
  );

  return (
    <PopoverContext.Provider value={contextValue}>
      <MotionConfig transition={transition}>
        <div
          className={cn("relative flex items-center justify-center", className)}
          style={style}
          data-slot="popover"
          data-state={isOpen ? "open" : "closed"}
        >
          {children}
        </div>
      </MotionConfig>
    </PopoverContext.Provider>
  );
}

PopoverRoot.displayName = "Popover.Root";

// =============================================================================
// POPOVER TRIGGER
// =============================================================================

/**
 * PopoverTrigger props
 */
export interface PopoverTriggerProps {
  /** Child content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Merge props with child element */
  asChild?: boolean;
}

/**
 * Popover.Trigger - Button that opens the popover
 *
 * Uses layoutId for smooth morphing animation into the popover.
 * The trigger hides when popover opens to create seamless morph effect.
 */
function PopoverTrigger({
  children,
  className,
  style,
  asChild = false,
}: PopoverTriggerProps) {
  const { open, isOpen, uniqueId, triggerRef, disableAnimation } =
    usePopover("PopoverTrigger");

  const handleClick = useCallback(() => {
    open();
  }, [open]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    },
    [open]
  );

  // Common ARIA and data attributes
  const commonProps = {
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    "aria-haspopup": "dialog" as const,
    "aria-expanded": isOpen,
    "aria-controls": `popover-content-${uniqueId}`,
    "data-slot": "popover-trigger",
    "data-state": isOpen ? "open" : "closed",
  };

  // asChild pattern - merge props with child
  if (asChild && React.isValidElement(children)) {
    const childElement = children as React.ReactElement<
      Record<string, unknown>
    >;

    if (!disableAnimation) {
      return (
        <motion.div
          layoutId={`popover-trigger-${uniqueId}`}
          className={cn("inline-flex", className)}
          style={{
            ...style,
            opacity: isOpen ? 0 : 1,
            pointerEvents: isOpen ? "none" : "auto",
          }}
        >
          {React.cloneElement(childElement, commonProps)}
        </motion.div>
      );
    }

    // Non-animated asChild - wrap in div for ref capture
    return (
      <div
        ref={triggerRef as React.RefObject<HTMLDivElement>}
        className="contents"
      >
        {React.cloneElement(childElement, commonProps)}
      </div>
    );
  }

  // Default button trigger with morphing
  if (!disableAnimation) {
    return (
      <motion.button
        ref={triggerRef as React.RefObject<HTMLButtonElement>}
        layoutId={`popover-trigger-${uniqueId}`}
        className={cn("inline-flex items-center justify-center", className)}
        style={{
          ...style,
          opacity: isOpen ? 0 : 1,
          pointerEvents: isOpen ? "none" : "auto",
        }}
        type="button"
        {...commonProps}
      >
        {children}
      </motion.button>
    );
  }

  // Non-animated trigger
  return (
    <button
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
      className={cn("inline-flex items-center justify-center", className)}
      style={style}
      type="button"
      {...commonProps}
    >
      {children}
    </button>
  );
}

PopoverTrigger.displayName = "Popover.Trigger";

// =============================================================================
// POPOVER LABEL
// =============================================================================

/**
 * PopoverLabel props
 */
export interface PopoverLabelProps {
  /** Label content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Popover.Label - Morphing label that transitions with the popover
 */
function PopoverLabel({ children, className, style }: PopoverLabelProps) {
  const { uniqueId, disableAnimation } = usePopover("PopoverLabel");

  if (!disableAnimation) {
    return (
      <motion.span
        layoutId={`popover-label-${uniqueId}`}
        className={cn("inline-flex items-center gap-2", className)}
        style={style}
        data-slot="popover-label"
      >
        {children}
      </motion.span>
    );
  }

  return (
    <span
      className={cn("inline-flex items-center gap-2", className)}
      style={style}
      data-slot="popover-label"
    >
      {children}
    </span>
  );
}

PopoverLabel.displayName = "Popover.Label";

// =============================================================================
// POPOVER CONTENT
// =============================================================================

/**
 * PopoverContent props
 */
export interface PopoverContentProps {
  /** Child content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Close on Escape key (default: true) */
  closeOnEscape?: boolean;
  /** Close on click outside (default: true) */
  closeOnClickOutside?: boolean;
}

/**
 * Popover.Content - Main popover panel
 *
 * Contains the popover content with morphing animation.
 * Handles focus trapping and keyboard interactions.
 */
function PopoverContent({
  children,
  className,
  style,
  closeOnEscape = true,
  closeOnClickOutside = true,
}: PopoverContentProps) {
  const { isOpen, close, uniqueId, contentRef, disableAnimation, variants } =
    usePopover("PopoverContent");

  // Focus trap refs
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  // Handle click outside
  useClickOutside(contentRef, () => {
    if (closeOnClickOutside) {
      close();
    }
  });

  // Handle escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key handling
      if (event.key === "Escape" && closeOnEscape) {
        close();
        event.preventDefault();
        return;
      }

      // Focus trap with Tab key
      if (event.key === "Tab") {
        const first = firstFocusableRef.current;
        const last = lastFocusableRef.current;

        if (!first || !last) return;

        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close, closeOnEscape]);

  // Initial focus management
  useEffect(() => {
    if (!isOpen) return;

    const contentElement = contentRef.current;
    if (!contentElement) return;

    // Find focusable elements
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements =
      contentElement.querySelectorAll(focusableSelector);

    if (focusableElements.length > 0) {
      firstFocusableRef.current = focusableElements[0] as HTMLElement;
      lastFocusableRef.current = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      // Focus first element after animation
      requestAnimationFrame(() => {
        (focusableElements[0] as HTMLElement).focus();
      });
    }
  }, [isOpen, contentRef]);

  // Content styles
  const contentClasses = cn(
    "absolute z-50",
    "min-w-[300px] max-w-[95vw]",
    "overflow-hidden rounded-2xl",
    "border border-border",
    "bg-background",
    "shadow-2xl shadow-black/20 dark:shadow-black/50",
    "outline-none focus:outline-none",
    className
  );

  // Animated version with morphing
  return (
    <AnimatePresence mode="wait">
      {isOpen &&
        (disableAnimation ? (
          <div
            ref={contentRef}
            className={contentClasses}
            style={{
              ...style,
              isolation: "isolate",
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`popover-title-${uniqueId}`}
            aria-describedby={`popover-description-${uniqueId}`}
            id={`popover-content-${uniqueId}`}
            data-slot="popover-content"
            data-state="open"
          >
            {children}
          </div>
        ) : (
          <motion.div
            ref={contentRef}
            layoutId={`popover-trigger-${uniqueId}`}
            className={contentClasses}
            style={{
              ...style,
              isolation: "isolate",
              willChange: "transform, opacity",
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`popover-title-${uniqueId}`}
            aria-describedby={`popover-description-${uniqueId}`}
            id={`popover-content-${uniqueId}`}
            data-slot="popover-content"
            data-state="open"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
          >
            {children}
          </motion.div>
        ))}
    </AnimatePresence>
  );
}

PopoverContent.displayName = "Popover.Content";

// =============================================================================
// POPOVER HEADER
// =============================================================================

/**
 * PopoverHeader props
 */
export interface PopoverHeaderProps {
  /** Header content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Popover.Header - Header section for title and description
 */
function PopoverHeader({ children, className, style }: PopoverHeaderProps) {
  const { disableAnimation } = usePopover("PopoverHeader");

  const headerClasses = cn(
    "flex flex-col items-start gap-2",
    "border-b border-border",
    "px-5 py-4",
    "bg-background",
    className
  );

  if (!disableAnimation) {
    return (
      <motion.div
        className={headerClasses}
        style={{
          ...style,
          isolation: "isolate",
          position: "relative",
          zIndex: 2,
        }}
        data-slot="popover-header"
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={headerClasses}
      style={{
        ...style,
        isolation: "isolate",
        position: "relative",
        zIndex: 2,
      }}
      data-slot="popover-header"
    >
      {children}
    </div>
  );
}

PopoverHeader.displayName = "Popover.Header";

// =============================================================================
// POPOVER TITLE
// =============================================================================

/**
 * PopoverTitle props
 */
export interface PopoverTitleProps {
  /** Title content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Popover.Title - Title with morphing animation from trigger label
 */
function PopoverTitle({ children, className, style }: PopoverTitleProps) {
  const { uniqueId, disableAnimation } = usePopover("PopoverTitle");

  const titleClasses = cn(
    "flex items-center gap-2",
    "text-sm font-semibold leading-none",
    "text-foreground",
    className
  );

  if (!disableAnimation) {
    return (
      <motion.h2
        id={`popover-title-${uniqueId}`}
        layoutId={`popover-label-${uniqueId}`}
        className={titleClasses}
        style={style}
        data-slot="popover-title"
      >
        {children}
      </motion.h2>
    );
  }

  return (
    <h2
      id={`popover-title-${uniqueId}`}
      className={titleClasses}
      style={style}
      data-slot="popover-title"
    >
      {children}
    </h2>
  );
}

PopoverTitle.displayName = "Popover.Title";

// =============================================================================
// POPOVER DESCRIPTION
// =============================================================================

/**
 * PopoverDescription props
 */
export interface PopoverDescriptionProps {
  /** Description content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Popover.Description - Description text with fade animation
 */
function PopoverDescription({
  children,
  className,
  style,
}: PopoverDescriptionProps) {
  const { uniqueId, disableAnimation } = usePopover("PopoverDescription");

  const descriptionClasses = cn("text-sm text-muted-foreground", className);

  if (!disableAnimation) {
    return (
      <motion.p
        id={`popover-description-${uniqueId}`}
        className={descriptionClasses}
        style={style}
        variants={{
          initial: { opacity: 0, y: 5 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 5 },
        }}
        data-slot="popover-description"
      >
        {children}
      </motion.p>
    );
  }

  return (
    <p
      id={`popover-description-${uniqueId}`}
      className={descriptionClasses}
      style={style}
      data-slot="popover-description"
    >
      {children}
    </p>
  );
}

PopoverDescription.displayName = "Popover.Description";

// =============================================================================
// POPOVER BODY
// =============================================================================

/**
 * PopoverBody props
 */
export interface PopoverBodyProps {
  /** Body content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Popover.Body - Main content area with fade animation
 */
function PopoverBody({ children, className, style }: PopoverBodyProps) {
  const { disableAnimation } = usePopover("PopoverBody");

  const bodyClasses = cn("p-5 bg-background", className);

  if (!disableAnimation) {
    return (
      <motion.div
        className={bodyClasses}
        style={{
          ...style,
          isolation: "isolate",
          position: "relative",
          zIndex: 1,
        }}
        variants={{
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 10 },
        }}
        data-slot="popover-body"
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={bodyClasses}
      style={{
        ...style,
        isolation: "isolate",
        position: "relative",
        zIndex: 1,
      }}
      data-slot="popover-body"
    >
      {children}
    </div>
  );
}

PopoverBody.displayName = "Popover.Body";

// =============================================================================
// POPOVER FOOTER
// =============================================================================

/**
 * PopoverFooter props
 */
export interface PopoverFooterProps {
  /** Footer content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Popover.Footer - Footer section for action buttons
 */
function PopoverFooter({ children, className, style }: PopoverFooterProps) {
  const { disableAnimation } = usePopover("PopoverFooter");

  const footerClasses = cn(
    "flex items-center justify-end gap-2",
    "border-t border-border",
    "px-5 py-3.5",
    "bg-background",
    className
  );

  if (!disableAnimation) {
    return (
      <motion.div
        className={footerClasses}
        style={{
          ...style,
          isolation: "isolate",
          position: "relative",
          zIndex: 2,
        }}
        variants={{
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 10 },
        }}
        data-slot="popover-footer"
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={footerClasses}
      style={{
        ...style,
        isolation: "isolate",
        position: "relative",
        zIndex: 2,
      }}
      data-slot="popover-footer"
    >
      {children}
    </div>
  );
}

PopoverFooter.displayName = "Popover.Footer";

// =============================================================================
// POPOVER CLOSE
// =============================================================================

/**
 * PopoverClose props
 */
export interface PopoverCloseProps {
  /** Close button content or custom child */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Use custom child as button */
  asChild?: boolean;
}

/**
 * Popover.Close - Button that closes the popover
 */
function PopoverClose({
  children = "Close",
  className,
  style,
  asChild = false,
}: PopoverCloseProps) {
  const { close } = usePopover("PopoverClose");

  const handleClick = useCallback(() => {
    close();
  }, [close]);

  // asChild pattern
  if (asChild && React.isValidElement(children)) {
    const childElement = children as React.ReactElement<
      Record<string, unknown>
    >;
    return React.cloneElement(childElement, {
      onClick: handleClick,
      "data-slot": "popover-close",
    });
  }

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center",
        "px-4 py-2 rounded-lg",
        "text-sm font-medium",
        "bg-secondary text-secondary-foreground",
        "hover:bg-secondary/80",
        "transition-colors duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      style={style}
      onClick={handleClick}
      data-slot="popover-close"
    >
      {children}
    </button>
  );
}

PopoverClose.displayName = "Popover.Close";

// =============================================================================
// COMPOUND COMPONENT EXPORT
// =============================================================================

/**
 * Popover compound component with sub-components attached.
 *
 * Can be used as either:
 * 1. Direct component: `<Popover>` (equivalent to `<Popover.Root>`)
 * 2. Namespace pattern: `<Popover.Root>`, `<Popover.Trigger>`, etc.
 *
 * @example Direct usage (recommended for tests and simple cases)
 * ```tsx
 * <Popover>
 *   <PopoverTrigger asChild>
 *     <Button>Open</Button>
 *   </PopoverTrigger>
 *   <PopoverContent>
 *     <PopoverTitle>Settings</PopoverTitle>
 *     <PopoverDescription>Configure options</PopoverDescription>
 *   </PopoverContent>
 * </Popover>
 * ```
 *
 * @example Namespace pattern (recommended for documentation)
 * ```tsx
 * <Popover.Root>
 *   <Popover.Trigger asChild>
 *     <Button>Open</Button>
 *   </Popover.Trigger>
 *   <Popover.Content>
 *     <Popover.Title>Settings</Popover.Title>
 *     <Popover.Description>Configure options</Popover.Description>
 *   </Popover.Content>
 * </Popover.Root>
 * ```
 */
const Popover = Object.assign(PopoverRoot, {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Label: PopoverLabel,
  Content: PopoverContent,
  Header: PopoverHeader,
  Title: PopoverTitle,
  Description: PopoverDescription,
  Body: PopoverBody,
  Footer: PopoverFooter,
  Close: PopoverClose,
});

// =============================================================================
// EXPORTS
// =============================================================================

// Primary export: Compound component with namespace
export { Popover };

// Named exports for direct imports
export {
  PopoverRoot,
  PopoverTrigger,
  PopoverLabel,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverBody,
  PopoverFooter,
  PopoverClose,
};
