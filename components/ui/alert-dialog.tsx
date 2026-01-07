/**
 * Alert Dialog Component
 *
 * A modal dialog for important interactions that require acknowledgement.
 * Features morphing animations, focus management, and full accessibility.
 *
 * Based on WAI-ARIA Alert Dialog pattern.
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/
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
  useSyncExternalStore,
  type ReactNode,
} from "react";

// 2. External library imports
import {
  motion,
  AnimatePresence,
  MotionConfig,
  type Transition,
} from "motion/react";
import { createPortal } from "react-dom";
import { XIcon } from "@phosphor-icons/react";

// 3. Internal imports
import { cn } from "@/lib/utils";
import { springPresets } from "@/lib/animations";
import { useShouldDisableAnimation } from "@/components/motion-provider";
import { useStableId } from "@/hooks/use-stable-id";
import { useControllableBoolean } from "@/hooks/use-controllable-state";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Context value for AlertDialog state management
 */
interface AlertDialogContextValue {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Set the open state */
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  /** Unique ID for ARIA attributes */
  uniqueId: string;
  /** Ref to the trigger element for focus return */
  triggerRef: React.RefObject<HTMLElement | null>;
  /** Ref to the content element */
  contentRef: React.RefObject<HTMLDivElement | null>;
  /** Whether animations are disabled */
  disableAnimation: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
}

// =============================================================================
// CONTEXT
// =============================================================================

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);

/**
 * Hook to access AlertDialog context
 * @throws Error if used outside AlertDialog
 */
function useAlertDialog(): AlertDialogContextValue {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error(
      "useAlertDialog must be used within <AlertDialog>. " +
        "Wrap your component tree with <AlertDialog>"
    );
  }
  return context;
}

// =============================================================================
// SPRING PRESETS FOR DIALOG
// =============================================================================

const dialogSprings = {
  /** Morphing animation between trigger and content */
  morph: {
    type: "spring" as const,
    bounce: 0,
    duration: 0.5,
  },
  /** Content fade in after morph */
  content: {
    duration: 0.25,
    delay: 0.15,
    ease: [0.32, 0.72, 0, 1] as const,
  },
  /** Backdrop fade */
  backdrop: {
    duration: 0.25,
    ease: "easeOut" as const,
  },
  /** Delay for content fade effects */
  contentFadeDelay: 0.15,
} as const;

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * SSR-safe check for client-side rendering
 * Uses useSyncExternalStore for React 19 compliance
 */
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );
}

// =============================================================================
// ALERT DIALOG ROOT
// =============================================================================

/**
 * AlertDialogRoot props
 */
export interface AlertDialogRootProps {
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
}

/**
 * AlertDialog - Container component that manages dialog state
 *
 * Provides context for all child components and handles
 * controlled/uncontrolled state management.
 *
 * @example
 * ```tsx
 * <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
 *   <AlertDialogTrigger>Open</AlertDialogTrigger>
 *   <AlertDialogContent>...</AlertDialogContent>
 * </AlertDialog>
 * ```
 */
function AlertDialogRoot({
  children,
  transition = springPresets.smooth,
  open,
  defaultOpen = false,
  onOpenChange,
  disableAnimation: disableAnimationProp,
}: AlertDialogRootProps) {
  // Controlled/uncontrolled state
  const [isOpen, setIsOpen] = useControllableBoolean({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  // Generate stable IDs
  const uniqueId = useStableId("alert-dialog");

  // Refs for focus management
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Animation preference
  const shouldDisableAnimation =
    useShouldDisableAnimation(disableAnimationProp);

  // Memoized context value
  const contextValue = useMemo<AlertDialogContextValue>(
    () => ({
      isOpen,
      setIsOpen,
      uniqueId,
      triggerRef,
      contentRef,
      disableAnimation: shouldDisableAnimation,
      onOpenChange,
    }),
    [isOpen, setIsOpen, uniqueId, shouldDisableAnimation, onOpenChange]
  );

  return (
    <AlertDialogContext.Provider value={contextValue}>
      <MotionConfig transition={transition}>{children}</MotionConfig>
    </AlertDialogContext.Provider>
  );
}

AlertDialogRoot.displayName = "AlertDialogRoot";

// =============================================================================
// ALERT DIALOG TRIGGER
// =============================================================================

/**
 * AlertDialogTrigger props
 */
export interface AlertDialogTriggerProps {
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
 * AlertDialogTrigger - Button that opens the dialog
 *
 * Uses layoutId for smooth morphing animation into the dialog.
 * The trigger hides when dialog opens to prevent "button behind dialog" effect.
 */
function AlertDialogTrigger({
  children,
  className,
  style,
  asChild = false,
}: AlertDialogTriggerProps) {
  const { setIsOpen, isOpen, uniqueId, triggerRef, disableAnimation } =
    useAlertDialog();

  const handleClick = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setIsOpen(true);
      }
    },
    [setIsOpen]
  );

  // Common ARIA and data attributes
  const commonProps = {
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    "aria-haspopup": "dialog" as const,
    "aria-expanded": isOpen,
    "aria-controls": `${uniqueId}-content`,
    "data-slot": "alert-dialog-trigger",
    "data-state": isOpen ? "open" : "closed",
  };

  // asChild pattern - merge props with child
  if (asChild && React.isValidElement(children)) {
    const childElement = children as React.ReactElement<
      Record<string, unknown>
    >;

    if (!disableAnimation) {
      return (
        <div
          ref={triggerRef as React.RefObject<HTMLDivElement>}
          className={cn("relative inline-flex", className)}
          style={{
            ...style,
            pointerEvents: isOpen ? "none" : "auto",
          }}
        >
          {/* Morphing background layer - transparent, explicitly no border */}
          <motion.div
            layoutId={`dialog-${uniqueId}`}
            className="absolute inset-0 -z-10 rounded-lg border-0"
            initial={false}
            animate={{
              opacity: isOpen ? 0 : 1,
              borderWidth: 0,
            }}
            transition={dialogSprings.morph}
            style={{
              borderRadius: "inherit",
              backgroundColor: "transparent",
              borderWidth: 0,
              borderStyle: "none",
              boxShadow: "none",
              outline: "none",
            }}
          />
          {/* Child with fade */}
          <motion.div
            className="relative z-10"
            animate={{ opacity: isOpen ? 0 : 1 }}
            transition={{ duration: 0.15 }}
          >
            {React.cloneElement(childElement, commonProps)}
          </motion.div>
        </div>
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
      <div
        ref={triggerRef as React.RefObject<HTMLDivElement>}
        className={cn("relative inline-flex cursor-pointer", className)}
        style={{
          ...style,
          pointerEvents: isOpen ? "none" : "auto",
        }}
        role="button"
        tabIndex={isOpen ? -1 : 0}
        {...commonProps}
      >
        {/* Morphing background layer - transparent, explicitly no border */}
        <motion.div
          layoutId={`dialog-${uniqueId}`}
          className="absolute inset-0 -z-10 rounded-lg border-0"
          initial={false}
          animate={{
            opacity: isOpen ? 0 : 1,
            borderWidth: 0,
          }}
          transition={dialogSprings.morph}
          style={{
            backgroundColor: "transparent",
            borderWidth: 0,
            borderStyle: "none",
            boxShadow: "none",
            outline: "none",
          }}
        />
        {/* Static content with fade */}
        <motion.span
          className="relative z-10 inline-flex items-center gap-2"
          animate={{ opacity: isOpen ? 0 : 1 }}
          transition={{ duration: 0.15 }}
        >
          {children}
        </motion.span>
      </div>
    );
  }

  // Non-animated trigger
  return (
    <div
      ref={triggerRef as React.RefObject<HTMLDivElement>}
      className={cn("relative inline-flex cursor-pointer", className)}
      style={style}
      role="button"
      tabIndex={0}
      {...commonProps}
    >
      {children}
    </div>
  );
}

AlertDialogTrigger.displayName = "AlertDialogTrigger";

// =============================================================================
// ALERT DIALOG CONTAINER (PORTAL)
// =============================================================================

/**
 * AlertDialogContainer props
 */
export interface AlertDialogContainerProps {
  /** Child content (typically AlertDialogContent) */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * AlertDialogContainer - Portal wrapper with backdrop
 *
 * Renders content in a portal with backdrop and center positioning.
 * Handles AnimatePresence for enter/exit animations.
 */
function AlertDialogContainer({ children }: AlertDialogContainerProps) {
  const { isOpen, uniqueId, disableAnimation } = useAlertDialog();
  const mounted = useIsMounted();

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence initial={false} mode="wait">
      {isOpen && (
        <MotionConfig transition={dialogSprings.morph}>
          {/* Backdrop with blur - z-[100] to be above all UI elements */}
          {disableAnimation ? (
            <div
              key={`backdrop-${uniqueId}`}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-lg"
              data-slot="alert-dialog-backdrop"
            />
          ) : (
            <motion.div
              key={`backdrop-${uniqueId}`}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-lg"
              data-slot="alert-dialog-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={dialogSprings.backdrop}
            />
          )}

          {/* Centered container - z-[101] above backdrop, pointer-events-none to allow clicks through */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            {children}
          </div>
        </MotionConfig>
      )}
    </AnimatePresence>,
    document.body
  );
}

AlertDialogContainer.displayName = "AlertDialogContainer";

// =============================================================================
// ALERT DIALOG CONTENT
// =============================================================================

/**
 * AlertDialogContent props
 */
export interface AlertDialogContentProps {
  /** Child content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Show close button in corner */
  showCloseButton?: boolean;
  /** Callback when close button clicked */
  onCloseButtonClick?: () => void;
  /** Prevent Escape key from closing (default: false for Radix compatibility) */
  preventEscapeClose?: boolean;
  /** Prevent clicking outside from closing (default: true) */
  preventOutsideClose?: boolean;
  /**
   * When true, only renders the content panel (legacy mode for use with explicit Container).
   * When false (default), includes portal and overlay automatically (shadcn mode).
   */
  standalone?: boolean;
}

/**
 * AlertDialogContent - Main dialog panel with integrated portal and overlay
 *
 * Contains the dialog content with morphing animation.
 * Handles focus trapping and keyboard interactions.
 *
 * In shadcn mode (default), this component includes:
 * - Portal rendering to document.body
 * - Animated backdrop overlay
 * - Centered positioning
 *
 * In standalone mode, it only renders the content panel.
 */
function AlertDialogContent({
  children,
  className,
  style,
  showCloseButton = false,
  onCloseButtonClick,
  preventEscapeClose = false, // Changed to false for Radix/shadcn compatibility
  preventOutsideClose = true,
  standalone = false,
}: AlertDialogContentProps) {
  const {
    setIsOpen,
    isOpen,
    uniqueId,
    triggerRef,
    contentRef,
    disableAnimation,
  } = useAlertDialog();

  const mounted = useIsMounted();

  // Focus trap refs
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  // Handle escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key handling
      if (event.key === "Escape" && !preventEscapeClose) {
        setIsOpen(false);
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
  }, [isOpen, setIsOpen, preventEscapeClose]);

  // Body scroll lock and initial focus
  useEffect(() => {
    if (!isOpen) return;

    const triggerElement = triggerRef.current;
    const contentElement = contentRef.current;

    // Save original body overflow
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Find focusable elements
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements =
      contentElement?.querySelectorAll(focusableSelector);

    if (focusableElements && focusableElements.length > 0) {
      firstFocusableRef.current = focusableElements[0] as HTMLElement;
      lastFocusableRef.current = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      // Focus first element after animation
      requestAnimationFrame(() => {
        (focusableElements[0] as HTMLElement).focus();
      });
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      triggerElement?.focus();
    };
  }, [isOpen, triggerRef, contentRef]);

  // Handle outside click
  useEffect(() => {
    if (!isOpen || preventOutsideClose) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    // Delay to prevent immediate closing
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen, preventOutsideClose, contentRef]);

  // Content styles
  const contentClasses = cn(
    "relative z-10 pointer-events-auto",
    "overflow-hidden",
    "rounded-2xl sm:rounded-3xl",
    "border border-border",
    "bg-background",
    "shadow-2xl shadow-black/50 dark:shadow-black/80",
    "outline-none focus:outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "w-full max-w-[calc(100vw-2rem)] sm:max-w-md",
    className
  );

  // Content panel component
  const ContentPanel = disableAnimation ? (
    <div
      ref={contentRef}
      className={contentClasses}
      style={style}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={`${uniqueId}-title`}
      aria-describedby={`${uniqueId}-description`}
      id={`${uniqueId}-content`}
      data-slot="alert-dialog-content"
      data-state="open"
    >
      {showCloseButton && <AlertDialogClose onClick={onCloseButtonClick} />}
      {children}
    </div>
  ) : (
    <motion.div
      ref={contentRef}
      layoutId={`dialog-${uniqueId}`}
      className={contentClasses}
      style={{ ...style, borderRadius: 24 }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={`${uniqueId}-title`}
      aria-describedby={`${uniqueId}-description`}
      id={`${uniqueId}-content`}
      data-slot="alert-dialog-content"
      data-state="open"
      initial={false}
      transition={dialogSprings.morph}
    >
      {showCloseButton && <AlertDialogClose onClick={onCloseButtonClick} />}
      {children}
    </motion.div>
  );

  // Standalone mode: just return the content panel (for use with explicit Container)
  if (standalone) {
    return ContentPanel;
  }

  // shadcn mode: include portal and overlay
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence initial={false} mode="wait">
      {isOpen && (
        <MotionConfig transition={dialogSprings.morph}>
          {/* Backdrop with blur - z-[100] to be above all UI elements */}
          {disableAnimation ? (
            <div
              key={`backdrop-${uniqueId}`}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-lg"
              data-slot="alert-dialog-overlay"
            />
          ) : (
            <motion.div
              key={`backdrop-${uniqueId}`}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-lg"
              data-slot="alert-dialog-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={dialogSprings.backdrop}
            />
          )}

          {/* Centered container - z-[101] above backdrop, pointer-events-none to allow clicks through */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            {ContentPanel}
          </div>
        </MotionConfig>
      )}
    </AnimatePresence>,
    document.body
  );
}

AlertDialogContent.displayName = "AlertDialogContent";

// =============================================================================
// ALERT DIALOG HEADER
// =============================================================================

/**
 * AlertDialogHeader props
 */
export interface AlertDialogHeaderProps {
  /** Child content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Optional icon to display */
  icon?: ReactNode;
  /** Icon wrapper class */
  iconClassName?: string;
}

/**
 * AlertDialogHeader - Header section with optional icon
 */
function AlertDialogHeader({
  children,
  className,
  icon,
  iconClassName,
}: AlertDialogHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center gap-4 sm:gap-5",
        className
      )}
      data-slot="alert-dialog-header"
    >
      {icon && (
        <div
          className={cn(
            "size-14 sm:size-16 rounded-full flex items-center justify-center",
            "bg-primary/10 dark:bg-primary/20",
            iconClassName
          )}
        >
          {icon}
        </div>
      )}
      <div className="space-y-2 sm:space-y-3">{children}</div>
    </div>
  );
}

AlertDialogHeader.displayName = "AlertDialogHeader";

// =============================================================================
// ALERT DIALOG BODY
// =============================================================================

/**
 * AlertDialogBody props
 */
export interface AlertDialogBodyProps {
  /** Child content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * AlertDialogBody - Main content area with fade animation
 */
function AlertDialogBody({ children, className }: AlertDialogBodyProps) {
  const { disableAnimation } = useAlertDialog();

  const bodyClasses = cn(
    "flex flex-col items-center text-center gap-5 sm:gap-6 p-6 sm:p-8",
    className
  );

  if (!disableAnimation) {
    return (
      <motion.div
        className={bodyClasses}
        data-slot="alert-dialog-body"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={dialogSprings.content}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={bodyClasses} data-slot="alert-dialog-body">
      {children}
    </div>
  );
}

AlertDialogBody.displayName = "AlertDialogBody";

// =============================================================================
// ALERT DIALOG FOOTER
// =============================================================================

/**
 * AlertDialogFooter props
 */
export interface AlertDialogFooterProps {
  /** Child content (action buttons) */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * AlertDialogFooter - Footer section for action buttons
 */
function AlertDialogFooter({ children, className }: AlertDialogFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-col w-full gap-2 sm:gap-3 pt-1 sm:pt-2",
        className
      )}
      data-slot="alert-dialog-footer"
    >
      {children}
    </div>
  );
}

AlertDialogFooter.displayName = "AlertDialogFooter";

// =============================================================================
// ALERT DIALOG TITLE
// =============================================================================

/**
 * AlertDialogTitle props
 */
export interface AlertDialogTitleProps {
  /** Title text */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * AlertDialogTitle - Dialog title for aria-labelledby
 */
function AlertDialogTitle({
  children,
  className,
  style,
}: AlertDialogTitleProps) {
  const { uniqueId } = useAlertDialog();

  return (
    <div
      className={cn(
        "text-lg sm:text-xl font-semibold tracking-tight leading-tight",
        "text-foreground",
        className
      )}
      style={style}
      id={`${uniqueId}-title`}
      data-slot="alert-dialog-title"
    >
      {children}
    </div>
  );
}

AlertDialogTitle.displayName = "AlertDialogTitle";

// =============================================================================
// ALERT DIALOG SUBTITLE
// =============================================================================

/**
 * AlertDialogSubtitle props
 */
export interface AlertDialogSubtitleProps {
  /** Subtitle text */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * AlertDialogSubtitle - Optional subtitle below the title
 */
function AlertDialogSubtitle({
  children,
  className,
  style,
}: AlertDialogSubtitleProps) {
  const { disableAnimation } = useAlertDialog();

  if (disableAnimation) {
    return (
      <div
        className={cn("text-sm text-muted-foreground font-medium", className)}
        style={style}
        data-slot="alert-dialog-subtitle"
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={cn("text-sm text-muted-foreground font-medium", className)}
      style={style}
      data-slot="alert-dialog-subtitle"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        ...dialogSprings.content,
        delay: dialogSprings.contentFadeDelay + 0.02,
      }}
    >
      {children}
    </motion.div>
  );
}

AlertDialogSubtitle.displayName = "AlertDialogSubtitle";

// =============================================================================
// ALERT DIALOG DESCRIPTION
// =============================================================================

/**
 * AlertDialogDescription props
 */
export interface AlertDialogDescriptionProps {
  /** Description text */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * AlertDialogDescription - Dialog description for aria-describedby
 */
function AlertDialogDescription({
  children,
  className,
  style,
}: AlertDialogDescriptionProps) {
  const { uniqueId } = useAlertDialog();

  return (
    <div
      className={cn(
        "text-sm sm:text-[13px] text-muted-foreground leading-relaxed",
        "max-w-full sm:max-w-[280px] mx-auto",
        className
      )}
      style={style}
      id={`${uniqueId}-description`}
      data-slot="alert-dialog-description"
    >
      {children}
    </div>
  );
}

AlertDialogDescription.displayName = "AlertDialogDescription";

// =============================================================================
// ALERT DIALOG ACTION BUTTON
// =============================================================================

/**
 * AlertDialogAction props
 */
export interface AlertDialogActionProps {
  /** Button label */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Button variant - use "destructive" for dangerous actions */
  variant?: "default" | "destructive";
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Disable the button */
  disabled?: boolean;
}

/**
 * AlertDialogAction - Primary action button that closes the dialog
 *
 * @example
 * ```tsx
 * <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
 * <AlertDialogAction>Confirm</AlertDialogAction>
 * ```
 */
function AlertDialogAction({
  children,
  className,
  style,
  variant = "default",
  onClick,
  disabled = false,
}: AlertDialogActionProps) {
  const { setIsOpen } = useAlertDialog();

  const isDestructive = variant === "destructive";

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        setIsOpen(false);
      }
    },
    [onClick, setIsOpen]
  );

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center",
        "rounded-xl sm:rounded-2xl px-5 py-3 sm:py-3.5",
        "text-sm sm:text-base font-semibold",
        "shadow-sm",
        isDestructive
          ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80"
          : "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
        "transition-all duration-150",
        "active:scale-[0.98]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "touch-manipulation select-none",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
      style={style}
      onClick={handleClick}
      disabled={disabled}
      data-slot="alert-dialog-action"
    >
      {children}
    </button>
  );
}

AlertDialogAction.displayName = "AlertDialogAction";

// =============================================================================
// ALERT DIALOG CANCEL BUTTON
// =============================================================================

/**
 * AlertDialogCancel props
 */
export interface AlertDialogCancelProps {
  /** Button label (defaults to "Cancel") */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Disable the button */
  disabled?: boolean;
}

/**
 * AlertDialogCancel - Secondary button that closes the dialog
 */
function AlertDialogCancel({
  children = "Cancel",
  className,
  style,
  onClick,
  disabled = false,
}: AlertDialogCancelProps) {
  const { setIsOpen } = useAlertDialog();

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        setIsOpen(false);
      }
    },
    [onClick, setIsOpen]
  );

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center",
        "rounded-xl sm:rounded-2xl px-5 py-3 sm:py-3.5",
        "text-sm sm:text-base font-medium",
        "bg-secondary text-secondary-foreground shadow-sm",
        "hover:bg-secondary/90 active:bg-secondary/80",
        "dark:bg-secondary/80 dark:hover:bg-secondary/70",
        "transition-all duration-150",
        "active:scale-[0.98]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "touch-manipulation select-none",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
      style={style}
      onClick={handleClick}
      disabled={disabled}
      data-slot="alert-dialog-cancel"
    >
      {children}
    </button>
  );
}

AlertDialogCancel.displayName = "AlertDialogCancel";

// =============================================================================
// ALERT DIALOG CLOSE BUTTON (X ICON)
// =============================================================================

/**
 * AlertDialogClose props
 */
export interface AlertDialogCloseProps {
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * AlertDialogClose - Close button with X icon (optional)
 */
function AlertDialogClose({ className, onClick }: AlertDialogCloseProps) {
  const { setIsOpen } = useAlertDialog();

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        setIsOpen(false);
      }
    },
    [onClick, setIsOpen]
  );

  return (
    <button
      type="button"
      className={cn(
        "absolute top-4 right-4",
        "p-1.5 rounded-full",
        "text-muted-foreground hover:text-foreground",
        "hover:bg-muted/80",
        "transition-colors duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      onClick={handleClick}
      aria-label="Close dialog"
      data-slot="alert-dialog-close"
    >
      <XIcon className="size-4" aria-hidden="true" />
    </button>
  );
}

AlertDialogClose.displayName = "AlertDialogClose";

// =============================================================================
// ALERT DIALOG IMAGE
// =============================================================================

/**
 * AlertDialogImage props
 */
export interface AlertDialogImageProps {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * AlertDialogImage - Image with fade animation
 */
function AlertDialogImage({
  src,
  alt,
  className,
  style,
}: AlertDialogImageProps) {
  const { disableAnimation } = useAlertDialog();

  if (!disableAnimation) {
    return (
      <motion.img
        src={src}
        alt={alt}
        className={cn(className)}
        style={style}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, delay: 0.05, ease: "easeOut" }}
        data-slot="alert-dialog-image"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn(className)}
      style={style}
      data-slot="alert-dialog-image"
    />
  );
}

AlertDialogImage.displayName = "AlertDialogImage";

// =============================================================================
// COMPONENT EXPORT
// =============================================================================

/**
 * AlertDialog - Container component that manages dialog state.
 *
 * Use with named exports for sub-components.
 *
 * @example
 * ```tsx
 * <AlertDialog>
 *   <AlertDialogTrigger asChild>
 *     <Button>Delete</Button>
 *   </AlertDialogTrigger>
 *   <AlertDialogContent>
 *     <AlertDialogTitle>Delete Item?</AlertDialogTitle>
 *     <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
 *     <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
 *     <AlertDialogCancel />
 *   </AlertDialogContent>
 * </AlertDialog>
 * ```
 */
const AlertDialog = AlertDialogRoot;

// =============================================================================
// EXPORTS
// =============================================================================

// Primary export
export { AlertDialog };

// Named exports for direct imports
export {
  AlertDialogRoot,
  AlertDialogTrigger,
  AlertDialogContainer,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogSubtitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogClose,
  AlertDialogImage,
};
