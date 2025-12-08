"use client";

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  motion,
  AnimatePresence,
  MotionConfig,
  Transition,
  Variant,
} from "motion/react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";
import { springPresets } from "@/lib/motion";
import { useShouldDisableAnimation } from "@/components/MotionProvider";

// =============================================================================
// TYPES
// =============================================================================

export type AlertDialogContextType = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  uniqueId: string;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  disableAnimation: boolean;
  /** Called when dialog open state changes */
  onOpenChange?: (open: boolean) => void;
};

// =============================================================================
// CONTEXT
// =============================================================================

const AlertDialogContext = React.createContext<AlertDialogContextType | null>(
  null
);

function useAlertDialog() {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error("useAlertDialog must be used within an AlertDialog");
  }
  return context;
}

// Counter for generating stable IDs
let idCounter = 0;

/**
 * Generate a stable ID that works in SSR
 * Uses a counter approach to ensure consistent IDs between server and client
 */
function useStableId(prefix: string = "dialog"): string {
  const idRef = useRef<string | null>(null);

  if (idRef.current === null) {
    // Only generate ID once per component instance
    idRef.current = `${prefix}-${++idCounter}`;
  }

  return idRef.current;
}

// =============================================================================
// ALERT DIALOG ROOT
// =============================================================================

export type AlertDialogProps = {
  children: React.ReactNode;
  /** Custom transition for animations */
  transition?: Transition;
  /** Controlled open state */
  open?: boolean;
  /** Default open state for uncontrolled usage */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Disable all animations */
  disableAnimation?: boolean;
};

/**
 * AlertDialog - A modal dialog that interrupts the user with important content
 * and expects a response.
 *
 * Features smooth morphing animations via layoutId when used with AlertDialogContainer.
 * All animations are designed to prevent layout shifts.
 *
 * @example
 * Basic usage with convenient layout components:
 * ```tsx
 * <AlertDialog>
 *   <AlertDialogTrigger asChild>
 *     <Button variant="destructive">Delete</Button>
 *   </AlertDialogTrigger>
 *   <AlertDialogContainer>
 *     <AlertDialogContent>
 *       <AlertDialogBody>
 *         <AlertDialogHeader>
 *           <AlertDialogTitle>Delete Account?</AlertDialogTitle>
 *           <AlertDialogDescription>
 *             This action cannot be undone.
 *           </AlertDialogDescription>
 *         </AlertDialogHeader>
 *         <AlertDialogFooter>
 *           <AlertDialogAction destructive>Delete</AlertDialogAction>
 *           <AlertDialogCancel>Cancel</AlertDialogCancel>
 *         </AlertDialogFooter>
 *       </AlertDialogBody>
 *     </AlertDialogContent>
 *   </AlertDialogContainer>
 * </AlertDialog>
 * ```
 *
 * @example
 * With icon:
 * ```tsx
 * <AlertDialog>
 *   <AlertDialogTrigger asChild>
 *     <Button>Show Alert</Button>
 *   </AlertDialogTrigger>
 *   <AlertDialogContainer>
 *     <AlertDialogContent>
 *       <AlertDialogBody>
 *         <AlertDialogHeader icon={<TrashIcon className="w-8 h-8 text-destructive" />}>
 *           <AlertDialogTitle>Permanent Action</AlertDialogTitle>
 *           <AlertDialogDescription>
 *             Are you absolutely sure?
 *           </AlertDialogDescription>
 *         </AlertDialogHeader>
 *         <AlertDialogFooter>
 *           <AlertDialogAction destructive>Confirm</AlertDialogAction>
 *           <AlertDialogCancel>Cancel</AlertDialogCancel>
 *         </AlertDialogFooter>
 *       </AlertDialogBody>
 *     </AlertDialogContent>
 *   </AlertDialogContainer>
 * </AlertDialog>
 * ```
 */
function AlertDialog({
  children,
  transition,
  open,
  defaultOpen = false,
  onOpenChange,
  disableAnimation: disableAnimationProp,
}: AlertDialogProps) {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? open : internalOpen;

  const uniqueId = useStableId("alert-dialog");
  const triggerRef = useRef<HTMLElement>(null!);
  const contentRef = useRef<HTMLDivElement>(null!);
  const shouldDisableAnimation =
    useShouldDisableAnimation(disableAnimationProp);

  const setIsOpen = useCallback(
    (value: React.SetStateAction<boolean>) => {
      const newValue = typeof value === "function" ? value(isOpen) : value;

      if (!isControlled) {
        setInternalOpen(newValue);
      }
      onOpenChange?.(newValue);
    },
    [isControlled, isOpen, onOpenChange]
  );

  const contextValue = useMemo<AlertDialogContextType>(
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

// =============================================================================
// ALERT DIALOG TRIGGER
// =============================================================================

export type AlertDialogTriggerProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Use asChild pattern to render as child element */
  asChild?: boolean;
};

/**
 * AlertDialogTrigger - Button that opens the alert dialog
 *
 * Supports morphing animations via layoutId when used with AlertDialogContainer.
 * Use `asChild` to compose with your own button component.
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
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setIsOpen(!isOpen);
      }
    },
    [isOpen, setIsOpen]
  );

  const commonProps = {
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    "aria-haspopup": "dialog" as const,
    "aria-expanded": isOpen,
    "aria-controls": `alert-dialog-content-${uniqueId}`,
    "data-slot": "alert-dialog-trigger",
  };

  // asChild pattern - render children with props
  if (asChild && React.isValidElement(children)) {
    const childElement = children as React.ReactElement<
      Record<string, unknown>
    >;
    return React.cloneElement(childElement, {
      ...commonProps,
      ref: (node: HTMLButtonElement | null) => {
        // Update the ref object
        (triggerRef as React.RefObject<HTMLButtonElement | null>).current =
          node;
      },
    });
  }

  // Morphing animation trigger - use div to avoid nested button issues
  if (!disableAnimation) {
    return (
      <motion.div
        ref={triggerRef as React.RefObject<HTMLDivElement>}
        layoutId={`dialog-${uniqueId}`}
        className={cn("relative cursor-pointer inline-flex", className)}
        style={style}
        role="button"
        tabIndex={0}
        {...commonProps}
      >
        {children}
      </motion.div>
    );
  }

  // Non-animated trigger - use div to avoid nested button issues
  return (
    <div
      ref={triggerRef as React.RefObject<HTMLDivElement>}
      className={cn("relative cursor-pointer inline-flex", className)}
      style={style}
      role="button"
      tabIndex={0}
      {...commonProps}
    >
      {children}
    </div>
  );
}

// =============================================================================
// ALERT DIALOG CONTAINER (for morphing animations)
// =============================================================================

export type AlertDialogContainerProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * AlertDialogContainer - Container for morphing animations
 *
 * Renders the dialog content in a portal with a backdrop overlay.
 * The dialog morphs smoothly from the trigger element using layoutId.
 */
// Hydration-safe mounting using useSyncExternalStore
const subscribeNoop = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsMounted() {
  return React.useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot
  );
}

function AlertDialogContainer({ children }: AlertDialogContainerProps) {
  const { isOpen, uniqueId, disableAnimation } = useAlertDialog();
  const mounted = useIsMounted();

  if (!mounted) return null;

  // Smoother spring transition for morph-back animation
  const morphTransition: Transition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 1,
  };

  return createPortal(
    <AnimatePresence initial={false} mode="sync">
      {isOpen && (
        <MotionConfig transition={morphTransition}>
          {disableAnimation ? (
            <div
              key={`backdrop-${uniqueId}`}
              className="fixed inset-0 z-50 bg-white/40 backdrop-blur-xs dark:bg-black/40"
            />
          ) : (
            <motion.div
              key={`backdrop-${uniqueId}`}
              className="fixed inset-0 z-50 bg-white/40 backdrop-blur-xs dark:bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
          )}
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {children}
          </div>
        </MotionConfig>
      )}
    </AnimatePresence>,
    document.body
  );
}

// =============================================================================
// ALERT DIALOG CONTENT
// =============================================================================

export type AlertDialogContentProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Show close button in the top right */
  showCloseButton?: boolean;
  /** Callback when close button is clicked */
  onCloseButtonClick?: () => void;
  /** Prevent closing on escape key */
  preventEscapeClose?: boolean;
  /** Prevent closing when clicking outside */
  preventOutsideClose?: boolean;
};

/**
 * AlertDialogContent - The main content container for the alert dialog
 *
 * Features:
 * - Morphing animations when used with AlertDialogContainer
 * - Focus trap for accessibility
 * - Escape key handling
 * - Optional close button
 * - Prevents layout shifts
 */
function AlertDialogContent({
  children,
  className,
  style,
  showCloseButton = false,
  onCloseButtonClick,
  preventEscapeClose = false,
  preventOutsideClose = true, // Alert dialogs should not close on outside click by default
}: AlertDialogContentProps) {
  const {
    setIsOpen,
    isOpen,
    uniqueId,
    triggerRef,
    contentRef,
    disableAnimation,
  } = useAlertDialog();

  // Focus trap refs
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  // Handle escape key and focus trap
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !preventEscapeClose) {
        setIsOpen(false);
        return;
      }

      // Focus trap
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

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, setIsOpen, preventEscapeClose]);

  // Handle body scroll lock and initial focus
  useEffect(() => {
    if (isOpen) {
      // Capture ref value for cleanup
      const triggerElement = triggerRef.current;
      const contentElement = contentRef.current;

      // Store original styles
      const originalBodyStyles = {
        overflow: document.body.style.overflow,
      };

      // Lock body scroll
      // Note: scrollbar-gutter: stable in CSS prevents layout shift, so no padding compensation needed
      document.body.style.overflow = "hidden";

      // Setup focus trap
      const focusableSelector =
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const focusableElements =
        contentElement?.querySelectorAll(focusableSelector);

      if (focusableElements && focusableElements.length > 0) {
        firstFocusableRef.current = focusableElements[0] as HTMLElement;
        lastFocusableRef.current = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        // Focus first element after a small delay to ensure animations have started
        requestAnimationFrame(() => {
          (focusableElements[0] as HTMLElement).focus();
        });
      }

      return () => {
        // Restore body styles
        document.body.style.overflow = originalBodyStyles.overflow;

        triggerElement?.focus();
      };
    }
  }, [isOpen, triggerRef, contentRef]);

  // Handle outside click
  // Note: This useEffect is difficult to test in jsdom due to portal rendering
  // and setTimeout. It is verified through manual and e2e testing.
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

    // Delay to prevent immediate closing from trigger click
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen, preventOutsideClose, contentRef]);

  // Content classes - designed to prevent layout shifts with Modern design
  const contentClasses = cn(
    "overflow-hidden",
    // design - clean, minimal
    "rounded-2xl sm:rounded-3xl",
    "border border-border/30",
    "bg-background/98 backdrop-blur-2xl backdrop-saturate-150",
    // Shadows - subtle but effective
    "shadow-2xl shadow-black/20",
    // Dark mode - slightly different treatment
    "dark:bg-background/95 dark:border-white/10 dark:shadow-black/50",
    // Focus styling
    "outline-none focus:outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    // Responsive sizing - full width on mobile, constrained on larger screens
    "w-[calc(100%-2rem)] sm:w-full",
    "max-w-[calc(100vw-2rem)] sm:max-w-md",
    // Safe area for notched devices
    "pb-safe",
    className
  );

  // Morphing animation with layoutId
  if (!disableAnimation) {
    return (
      <motion.div
        ref={contentRef}
        layoutId={`dialog-${uniqueId}`}
        className={contentClasses}
        style={style}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`alert-dialog-title-${uniqueId}`}
        aria-describedby={`alert-dialog-description-${uniqueId}`}
        id={`alert-dialog-content-${uniqueId}`}
        data-slot="alert-dialog-content"
      >
        {showCloseButton && <AlertDialogClose onClick={onCloseButtonClick} />}
        {children}
      </motion.div>
    );
  }

  // Non-animated content
  return (
    <div
      ref={contentRef}
      className={contentClasses}
      style={style}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={`alert-dialog-title-${uniqueId}`}
      aria-describedby={`alert-dialog-description-${uniqueId}`}
      id={`alert-dialog-content-${uniqueId}`}
      data-slot="alert-dialog-content"
    >
      {showCloseButton && <AlertDialogClose onClick={onCloseButtonClick} />}
      {children}
    </div>
  );
}

// =============================================================================
// ALERT DIALOG HEADER
// =============================================================================

export type AlertDialogHeaderProps = {
  children: React.ReactNode;
  className?: string;
  /** Optional icon element to display above content */
  icon?: React.ReactNode;
  /** Icon background color classes */
  iconClassName?: string;
};

/**
 * AlertDialogHeader - Wrapper for title, subtitle, and optional icon
 *
 * Provides centered layout with consistent spacing.
 * Use this to get defaults without manual div wrappers.
 */
function AlertDialogHeader({
  children,
  className,
  icon,
  iconClassName,
}: AlertDialogHeaderProps) {
  const headerClasses = cn(
    "flex flex-col items-center text-center gap-4 sm:gap-5",
    className
  );

  const iconWrapperClasses = cn(
    "w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center",
    "bg-primary/10 dark:bg-primary/20",
    iconClassName
  );

  return (
    <div className={headerClasses}>
      {icon && <div className={iconWrapperClasses}>{icon}</div>}
      <div className="space-y-2 sm:space-y-3">{children}</div>
    </div>
  );
}

// =============================================================================
// ALERT DIALOG FOOTER
// =============================================================================

export type AlertDialogFooterProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * AlertDialogFooter - Wrapper for action buttons
 *
 * Provides stacked button layout with consistent spacing.
 * Use this to get defaults without manual div wrappers.
 */
function AlertDialogFooter({ children, className }: AlertDialogFooterProps) {
  const footerClasses = cn(
    "flex flex-col w-full gap-2 sm:gap-3 pt-1 sm:pt-2",
    className
  );

  return <div className={footerClasses}>{children}</div>;
}

// =============================================================================
// ALERT DIALOG BODY
// =============================================================================

export type AlertDialogBodyProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * AlertDialogBody - Main content wrapper with padding
 *
 * Provides consistent padding and spacing for dialog content.
 * Use this as the direct child of AlertDialogContent.
 */
function AlertDialogBody({ children, className }: AlertDialogBodyProps) {
  const bodyClasses = cn(
    "flex flex-col items-center text-center gap-5 sm:gap-6 p-6 sm:p-8",
    className
  );

  return <div className={bodyClasses}>{children}</div>;
}

// =============================================================================
// ALERT DIALOG TITLE
// =============================================================================

export type AlertDialogTitleProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * AlertDialogTitle - The main heading for the alert dialog
 *
 * Fades in smoothly for a clean, professional appearance.
 */
function AlertDialogTitle({
  children,
  className,
  style,
}: AlertDialogTitleProps) {
  const { uniqueId, disableAnimation } = useAlertDialog();

  const titleClasses = cn(
    // Typography - responsive
    "text-lg sm:text-xl font-semibold tracking-tight leading-tight",
    "text-foreground",
    className
  );

  if (!disableAnimation) {
    return (
      <motion.div
        className={titleClasses}
        style={style}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
        id={`alert-dialog-title-${uniqueId}`}
        data-slot="alert-dialog-title"
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={titleClasses}
      style={style}
      id={`alert-dialog-title-${uniqueId}`}
      data-slot="alert-dialog-title"
    >
      {children}
    </div>
  );
}

// =============================================================================
// ALERT DIALOG SUBTITLE (for morphing dialogs)
// =============================================================================

export type AlertDialogSubtitleProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * AlertDialogSubtitle - Secondary heading for dialogs
 */
function AlertDialogSubtitle({
  children,
  className,
  style,
}: AlertDialogSubtitleProps) {
  const { disableAnimation } = useAlertDialog();

  const subtitleClasses = cn("text-sm text-muted-foreground", className);

  if (!disableAnimation) {
    return (
      <motion.div
        className={subtitleClasses}
        style={style}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
        data-slot="alert-dialog-subtitle"
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={subtitleClasses}
      style={style}
      data-slot="alert-dialog-subtitle"
    >
      {children}
    </div>
  );
}

// =============================================================================
// ALERT DIALOG DESCRIPTION
// =============================================================================

export type AlertDialogDescriptionProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Disable layout animation for this element */
  disableLayoutAnimation?: boolean;
  /** Custom animation variants */
  variants?: {
    initial: Variant;
    animate: Variant;
    exit: Variant;
  };
};

// Default fade-in variants for content
const fadeInVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * AlertDialogDescription - Supplementary text explaining the alert
 */
function AlertDialogDescription({
  children,
  className,
  style,
  variants,
  disableLayoutAnimation: _disableLayoutAnimation = true, // Kept for API compatibility
}: AlertDialogDescriptionProps) {
  const { uniqueId, disableAnimation } = useAlertDialog();

  const descriptionClasses = cn(
    // Typography - responsive sizing
    "text-sm sm:text-[13px] text-muted-foreground leading-relaxed",
    // Responsive max-width
    "max-w-full sm:max-w-[280px] mx-auto",
    className
  );

  // Use provided variants or default fade-in
  const animationVariants = variants || fadeInVariants;

  if (!disableAnimation) {
    return (
      <motion.div
        key={`dialog-description-${uniqueId}`}
        className={descriptionClasses}
        style={style}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={animationVariants}
        transition={{ duration: 0.35, delay: 0.15, ease: "easeOut" }}
        id={`alert-dialog-description-${uniqueId}`}
        data-slot="alert-dialog-description"
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={descriptionClasses}
      style={style}
      id={`alert-dialog-description-${uniqueId}`}
      data-slot="alert-dialog-description"
    >
      {children}
    </div>
  );
}

// =============================================================================
// ALERT DIALOG IMAGE (for morphing dialogs)
// =============================================================================

export type AlertDialogImageProps = {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * AlertDialogImage - Image with smooth fade-in animation
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
        transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
        data-slot="alert-dialog-image"
      />
    );
  }

  // Using standard img element for morphing animation compatibility
  // Next.js Image component doesn't work well with motion layoutId
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

// =============================================================================
// ALERT DIALOG ACTION
// =============================================================================

export type AlertDialogActionProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Show as destructive action (red text) */
  destructive?: boolean;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Disable the button */
  disabled?: boolean;
};

/**
 * AlertDialogAction - The primary action button that confirms the alert
 *
 * Features:
 * - Bold text for emphasis (Modern)
 * - Destructive variant for dangerous actions
 * - Closes dialog on click by default
 */
function AlertDialogAction({
  children,
  className,
  style,
  destructive = false,
  onClick,
  disabled = false,
}: AlertDialogActionProps) {
  const { setIsOpen, disableAnimation } = useAlertDialog();

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        setIsOpen(false);
      }
    },
    [onClick, setIsOpen]
  );

  // action button - prominent, full-width, rounded
  const actionClasses = cn(
    // Base styling
    "inline-flex items-center justify-center",
    "rounded-xl sm:rounded-2xl px-5 py-3 sm:py-3.5",
    "text-sm sm:text-base font-semibold",
    // Color based on destructive prop - filled buttons for primary actions
    destructive
      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80"
      : "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
    // Active state feedback
    "active:scale-[0.98]",
    // Transition
    !disableAnimation && "transition-all duration-150",
    // Focus styling
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    // Touch feedback
    "touch-manipulation",
    // Disabled state
    disabled && "opacity-50 cursor-not-allowed pointer-events-none",
    className
  );

  return (
    <button
      type="button"
      className={actionClasses}
      style={style}
      onClick={handleClick}
      disabled={disabled}
      data-slot="alert-dialog-action"
    >
      {children}
    </button>
  );
}

// =============================================================================
// ALERT DIALOG CANCEL
// =============================================================================

export type AlertDialogCancelProps = {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Disable the button */
  disabled?: boolean;
};

/**
 * AlertDialogCancel - The cancel button that dismisses the alert
 *
 * Features:
 * - Regular weight text (lighter than Action for hierarchy)
 * - Closes dialog on click
 */
function AlertDialogCancel({
  children,
  className,
  style,
  onClick,
  disabled = false,
}: AlertDialogCancelProps) {
  const { setIsOpen, disableAnimation } = useAlertDialog();

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        setIsOpen(false);
      }
    },
    [onClick, setIsOpen]
  );

  // cancel button - subtle, clearly secondary
  const cancelClasses = cn(
    // Base styling
    "inline-flex items-center justify-center",
    "rounded-xl sm:rounded-2xl px-5 py-3 sm:py-3.5",
    "text-sm sm:text-base font-medium",
    // Subtle styling - light background that works in both themes
    "bg-secondary/80 text-secondary-foreground",
    "hover:bg-secondary active:bg-secondary/60",
    // Dark mode adjustments
    "dark:bg-secondary/50 dark:hover:bg-secondary/70",
    // Active state feedback
    "active:scale-[0.98]",
    // Transition
    !disableAnimation && "transition-all duration-150",
    // Focus styling
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    // Touch feedback
    "touch-manipulation",
    // Disabled state
    disabled && "opacity-50 cursor-not-allowed pointer-events-none",
    className
  );

  return (
    <button
      type="button"
      className={cancelClasses}
      style={style}
      onClick={handleClick}
      disabled={disabled}
      data-slot="alert-dialog-cancel"
    >
      {children || "Cancel"}
    </button>
  );
}

// =============================================================================
// ALERT DIALOG CLOSE (for morphing dialogs)
// =============================================================================

export type AlertDialogCloseProps = {
  children?: React.ReactNode;
  className?: string;
  /** Custom animation variants */
  variants?: {
    initial: Variant;
    animate: Variant;
    exit: Variant;
  };
  /** Click handler */
  onClick?: () => void;
};

/**
 * AlertDialogClose - Close button for morphing dialogs
 *
 * Renders an X button in the top right corner.
 */
function AlertDialogClose({
  children,
  className,
  variants,
  onClick,
}: AlertDialogCloseProps) {
  const { setIsOpen, uniqueId, disableAnimation } = useAlertDialog();

  const handleClose = useCallback(() => {
    onClick?.();
    setIsOpen(false);
  }, [setIsOpen, onClick]);

  // close button - big, clear, prominent, always visible
  const closeClasses = cn(
    "absolute top-3 right-3 sm:top-4 sm:right-4 z-10",
    // Big and clear - 44x44 touch target (WCAG guidelines minimum)
    "w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center",
    "rounded-full",
    // Clear visible background - works on all backgrounds
    "bg-black/5 dark:bg-white/10",
    "backdrop-blur-sm",
    "text-foreground/60 hover:text-foreground",
    "hover:bg-black/10 dark:hover:bg-white/20",
    // Smooth transitions
    "transition-all duration-200",
    "active:scale-95 active:bg-black/15 dark:active:bg-white/25",
    // Focus styling
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    // Subtle border for definition
    "border border-black/5 dark:border-white/10",
    // Touch feedback
    "touch-manipulation",
    className
  );

  if (!disableAnimation) {
    return (
      <motion.button
        onClick={handleClose}
        type="button"
        aria-label="Close dialog"
        key={`dialog-close-${uniqueId}`}
        className={closeClasses}
        initial={variants ? "initial" : { opacity: 0, scale: 0.8 }}
        animate={variants ? "animate" : { opacity: 1, scale: 1 }}
        exit={variants ? "exit" : { opacity: 0, scale: 0.8 }}
        variants={variants}
        transition={springPresets.snappy}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-slot="alert-dialog-close"
      >
        {children || <XIcon size={20} strokeWidth={2.5} />}
      </motion.button>
    );
  }

  return (
    <button
      onClick={handleClose}
      type="button"
      aria-label="Close dialog"
      className={closeClasses}
      data-slot="alert-dialog-close"
    >
      {children || <XIcon size={20} strokeWidth={2.5} />}
    </button>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContainer,
  AlertDialogContent,
  AlertDialogBody,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogSubtitle,
  AlertDialogDescription,
  AlertDialogImage,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogClose,
  useAlertDialog,
};
