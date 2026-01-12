/**
 * Pull Down Menu Component
 *
 * A pull down menu with morphing animations. The trigger morphs
 * into the menu container, creating a fluid, native-feeling interaction.
 *
 * Features spring physics and blur transitions for smooth, organic motion.
 *
 * ---
 * Inspired by and adapted from **bloom-menu** by Josh Puckett.
 * Original project: https://github.com/joshpuckett/bloom
 * Licensed under MIT License.
 * ---
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
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  type ReactNode,
  type CSSProperties,
  type MouseEvent,
  type KeyboardEvent,
  type RefObject,
  type MutableRefObject,
} from "react";

// 2. External library imports
import { createPortal } from "react-dom";
import {
  motion,
  AnimatePresence,
  type Transition,
  type Variants,
} from "motion/react";
import { CaretRightIcon } from "@phosphor-icons/react";

// 3. Internal imports
import { cn } from "@/lib/utils";
import { useShouldDisableAnimation } from "@/components/motion-provider";

// =============================================================================
// TYPES
// =============================================================================

/** Direction the menu expands from trigger */
export type PullDownDirection = "top" | "bottom" | "left" | "right";

/** Anchor point alignment */
export type PullDownAnchor = "start" | "center" | "end";

/** Spring configuration for animations */
export interface PullDownSpringConfig {
  stiffness: number;
  damping: number;
  mass?: number;
}

/** Detailed animation configuration */
export interface PullDownAnimationConfig {
  /** Spring stiffness for shape morph */
  morphStiffness?: number;
  /** Spring damping for shape morph */
  morphDamping?: number;
  /** Spring stiffness for content fade */
  contentStiffness?: number;
  /** Spring damping for content fade */
  contentDamping?: number;
  /** Delay before content appears (seconds) */
  contentDelay?: number;
  /** Scale when content is hidden */
  contentScale?: number;
  /** Blur amount for trigger icon (px) */
  triggerBlur?: number;
  /** Blur amount for content (px) */
  contentBlur?: number;
}

/** Root component props */
export interface PullDownProps {
  children: ReactNode;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Default open state for uncontrolled usage */
  defaultOpen?: boolean;
  /** Detailed animation configuration */
  animationConfig?: PullDownAnimationConfig;
  /** Close when clicking outside the menu */
  closeOnClickOutside?: boolean;
  /** Close when pressing Escape key */
  closeOnEscape?: boolean;
  /** Enable modal behavior with focus trapping */
  modal?: boolean;
  /** Direction the menu expands from trigger */
  direction?: PullDownDirection;
  /** Anchor point alignment */
  anchor?: PullDownAnchor;
  /** Spring animation duration in seconds (default: 0.25) */
  visualDuration?: number;
  /** Spring animation bounce (default: 0.2) */
  bounce?: number;
}

/** Container component props */
export interface PullDownContainerProps {
  children: ReactNode;
  /** Size of the closed button state - number for square, or { width, height } for rectangular */
  buttonSize?: number | { width: number; height: number };
  /** Fixed width when open */
  menuWidth?: number;
  /** Border radius of the open menu state */
  menuRadius?: number;
  /** Border radius of the closed button state (defaults to pill shape) */
  buttonRadius?: number;
  /** Additional class names */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
}

/** Trigger component props */
export interface PullDownTriggerProps {
  children: ReactNode;
  /** Disable the trigger */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
}

/** Content component props */
export interface PullDownContentProps {
  children: ReactNode;
  /** Additional class names */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Callback when content animation completes */
  onAnimationComplete?: () => void;
}

/** Item component props */
export interface PullDownItemProps {
  children: ReactNode;
  /** Called when item is selected */
  onSelect?: () => void;
  /** Disable the item */
  disabled?: boolean;
  /** Close menu after selection */
  closeOnSelect?: boolean;
  /** Additional class names */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
}

/** Portal component props */
export interface PullDownPortalProps {
  children: ReactNode;
  /** Container element for the portal */
  container?: HTMLElement | null;
}

/** Overlay component props */
export interface PullDownOverlayProps {
  /** Additional class names */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Click handler (defaults to closing menu) */
  onClick?: () => void;
}

/** SubMenu component props */
export interface PullDownSubMenuProps {
  children: ReactNode;
  /** Unique identifier for this submenu */
  id: string;
}

/** SubMenuTrigger component props */
export interface PullDownSubMenuTriggerProps {
  /** Static children or render prop receiving isActive state */
  children: ReactNode | ((isActive: boolean) => ReactNode);
  /** Additional class names */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Disable the trigger */
  disabled?: boolean;
}

/** SubMenuContent component props */
export interface PullDownSubMenuContentProps {
  children: ReactNode;
  /** Additional class names */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
}

/** Internal context state */
interface PullDownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: MutableRefObject<HTMLElement | null>;
  contentRef: MutableRefObject<HTMLDivElement | null>;
  animationConfig: Required<PullDownAnimationConfig>;
  closeOnClickOutside: boolean;
  closeOnEscape: boolean;
  modal: boolean;
  isOpenAnimationCompleteRef: MutableRefObject<boolean>;
  direction: PullDownDirection;
  anchor: PullDownAnchor;
  activeSubmenu: string | null;
  setActiveSubmenu: (id: string | null) => void;
  isSubmenuClosing: boolean;
  visualDuration: number;
  bounce: number;
  disableAnimation: boolean;
}

/** SubMenu context value */
interface PullDownSubMenuContextValue {
  id: string;
  triggerRef: MutableRefObject<HTMLDivElement | null>;
}

// =============================================================================
// CONTEXT
// =============================================================================

const PullDownContext = createContext<PullDownContextValue | null>(null);

function usePullDownContext(componentName = "PullDown"): PullDownContextValue {
  const context = useContext(PullDownContext);
  if (!context) {
    throw new Error(
      `${componentName} must be used within <PullDown>. ` +
        "Wrap your component tree with <PullDown>"
    );
  }
  return context;
}

const SubMenuContext = createContext<PullDownSubMenuContextValue | null>(null);

function useSubMenuContext(): PullDownSubMenuContextValue {
  const context = useContext(SubMenuContext);
  if (!context) {
    throw new Error(
      "SubMenu components must be used within a <PullDown.SubMenu> component"
    );
  }
  return context;
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook for controlled/uncontrolled state pattern
 */
function useControllable<T>({
  value: controlledValue,
  defaultValue,
  onChange,
}: {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}): [T, (value: T) => void] {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const wasControlled = useRef(isControlled);

  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" &&
      wasControlled.current !== isControlled
    ) {
      console.warn(
        "PullDown: A component is changing from",
        wasControlled.current ? "controlled" : "uncontrolled",
        "to",
        isControlled ? "controlled" : "uncontrolled",
        ". This is likely a bug."
      );
    }
    wasControlled.current = isControlled;
  }, [isControlled]);

  const setValue = useCallback(
    (newValue: T) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange]
  );

  return [value, setValue];
}

/**
 * Hook to detect clicks outside elements
 */
function useClickOutside(
  refs: RefObject<HTMLElement | null>[],
  handler: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    function handleClick(event: globalThis.MouseEvent | TouchEvent) {
      const target = event.target as Node;
      const isOutside = refs.every((ref) => {
        return !ref.current || !ref.current.contains(target);
      });

      if (isOutside) {
        handler();
      }
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [refs, handler, enabled]);
}

/**
 * Hook to handle escape key press
 */
function useEscapeKey(handler: () => void, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        handler();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handler, enabled]);
}

/**
 * Hook for reduced motion preference
 */
function useReducedMotion(): boolean {
  const QUERY = "(prefers-reduced-motion: reduce)";

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(QUERY).matches;
  }, []);

  const subscribe = useCallback((callback: () => void) => {
    if (typeof window === "undefined") return () => {};
    const mediaQuery = window.matchMedia(QUERY);
    mediaQuery.addEventListener("change", callback);
    return () => mediaQuery.removeEventListener("change", callback);
  }, []);

  const getServerSnapshot = useCallback(() => false, []);

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// =============================================================================
// ANIMATION CONSTANTS
// =============================================================================

const DEFAULT_ANIMATION_CONFIG: Required<PullDownAnimationConfig> = {
  morphStiffness: 382,
  morphDamping: 29,
  contentStiffness: 403,
  contentDamping: 36,
  contentDelay: 0.03,
  contentScale: 0.95,
  triggerBlur: 8,
  contentBlur: 10,
};

const REDUCED_MOTION_SPRING: PullDownSpringConfig = {
  stiffness: 1000,
  damping: 100,
};

const CONTENT_BLUR = 8;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/** Calculate base position styles based on direction */
function getPositionStyles(direction: PullDownDirection): CSSProperties {
  const styles: CSSProperties = {
    position: "absolute",
  };

  switch (direction) {
    case "top":
      styles.bottom = 0;
      styles.left = 0;
      break;
    case "bottom":
      styles.top = 0;
      styles.left = 0;
      break;
    case "left":
      styles.right = 0;
      styles.bottom = 0;
      break;
    case "right":
      styles.left = 0;
      styles.bottom = 0;
      break;
  }

  return styles;
}

/** Calculate anchor offset for menu alignment */
function getAnchorOffset(
  direction: PullDownDirection,
  anchor: PullDownAnchor,
  menuWidth: number,
  menuHeight: number,
  buttonWidth: number,
  buttonHeight: number
) {
  if (anchor === "start") {
    return { x: 0, y: 0 };
  }

  const offsetAmount = anchor === "center" ? 0.5 : 1;

  if (direction === "top" || direction === "bottom") {
    const xOffset = -(menuWidth - buttonWidth) * offsetAmount;
    return { x: xOffset, y: 0 };
  } else {
    const yOffset = (menuHeight - buttonHeight) * offsetAmount;
    return { x: 0, y: yOffset };
  }
}

/** Calculate transform origin based on direction and anchor */
function getTransformOrigin(
  direction: PullDownDirection,
  anchor: PullDownAnchor
): string {
  const vertical =
    direction === "top" ? "bottom" : direction === "bottom" ? "top" : "center";
  const horizontal =
    direction === "left" ? "right" : direction === "right" ? "left" : "center";

  if (direction === "top" || direction === "bottom") {
    const h =
      anchor === "start" ? "left" : anchor === "end" ? "right" : "center";
    return `${h} ${vertical}`;
  } else {
    const v =
      anchor === "start" ? "bottom" : anchor === "end" ? "top" : "center";
    return `${horizontal} ${v}`;
  }
}

/** Calculate animation offset based on direction */
function getAnimationOffset(direction: PullDownDirection, amount: number) {
  switch (direction) {
    case "top":
      return { y: -amount };
    case "bottom":
      return { y: amount };
    case "left":
      return { x: -amount };
    case "right":
      return { x: amount };
  }
}

// =============================================================================
// ROOT COMPONENT
// =============================================================================

const Root = forwardRef<HTMLDivElement, PullDownProps>(function PullDownRoot(
  {
    children,
    open: controlledOpen,
    onOpenChange,
    defaultOpen = false,
    animationConfig,
    closeOnClickOutside = true,
    closeOnEscape = true,
    modal = false,
    direction = "top",
    anchor: anchorProp = "start",
    visualDuration = 0.25,
    bounce = 0.2,
  },
  ref
) {
  const disableAnimation = useShouldDisableAnimation();

  // For horizontal directions, anchor is always center
  const anchor =
    direction === "left" || direction === "right" ? "center" : anchorProp;

  const [open, setOpen] = useControllable({
    value: controlledOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const isOpenAnimationCompleteRef = useRef(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  // Track when submenu is in the process of closing (exit animation)
  const [isSubmenuClosing, setIsSubmenuClosing] = useState(false);
  const submenuClosingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle submenu state changes and track closing animation
  const handleSetActiveSubmenu = useCallback(
    (id: string | null) => {
      // Clear any pending timeout
      if (submenuClosingTimeoutRef.current) {
        clearTimeout(submenuClosingTimeoutRef.current);
        submenuClosingTimeoutRef.current = null;
      }

      if (id === null && activeSubmenu !== null) {
        // Submenu is closing - mark it and wait for animation
        setIsSubmenuClosing(true);
        setActiveSubmenu(null);
        submenuClosingTimeoutRef.current = setTimeout(() => {
          setIsSubmenuClosing(false);
          submenuClosingTimeoutRef.current = null;
        }, visualDuration * 1000 + 50); // Add small buffer
      } else {
        setIsSubmenuClosing(false);
        setActiveSubmenu(id);
      }
    },
    [activeSubmenu, visualDuration]
  );

  const handleSetOpen = useCallback(
    (newOpen: boolean) => {
      if (newOpen) {
        isOpenAnimationCompleteRef.current = false;
      } else {
        // Clear any pending timeout
        if (submenuClosingTimeoutRef.current) {
          clearTimeout(submenuClosingTimeoutRef.current);
          submenuClosingTimeoutRef.current = null;
        }
        setIsSubmenuClosing(false);
        setActiveSubmenu(null);
      }
      setOpen(newOpen);
    },
    [setOpen]
  );

  // Handle click outside - if submenu is open or closing, handle appropriately
  const handleClickOutside = useCallback(() => {
    if (activeSubmenu !== null) {
      // If a submenu is open, close submenu first
      handleSetActiveSubmenu(null);
    } else if (isSubmenuClosing) {
      // Submenu is still in closing animation, ignore click
      return;
    } else {
      // No submenu open or closing, close the entire menu
      handleSetOpen(false);
    }
  }, [activeSubmenu, isSubmenuClosing, handleSetActiveSubmenu, handleSetOpen]);

  // Close on click outside
  useClickOutside(
    [triggerRef, contentRef],
    handleClickOutside,
    open && closeOnClickOutside
  );

  // Handle escape key - if submenu is open or closing, handle appropriately
  const handleEscapeKey = useCallback(() => {
    if (activeSubmenu !== null) {
      // If a submenu is open, close submenu first
      handleSetActiveSubmenu(null);
    } else if (isSubmenuClosing) {
      // Submenu is still in closing animation, ignore escape
      return;
    } else {
      // No submenu open or closing, close the entire menu
      handleSetOpen(false);
    }
  }, [activeSubmenu, isSubmenuClosing, handleSetActiveSubmenu, handleSetOpen]);

  // Close on escape
  useEscapeKey(handleEscapeKey, open && closeOnEscape);

  const mergedAnimationConfig = useMemo(
    () => ({
      ...DEFAULT_ANIMATION_CONFIG,
      ...animationConfig,
    }),
    [animationConfig]
  );

  const contextValue = useMemo(
    () => ({
      open,
      setOpen: handleSetOpen,
      triggerRef,
      contentRef,
      animationConfig: mergedAnimationConfig,
      closeOnClickOutside,
      closeOnEscape,
      modal,
      isOpenAnimationCompleteRef,
      direction,
      anchor,
      activeSubmenu,
      setActiveSubmenu: handleSetActiveSubmenu,
      isSubmenuClosing,
      visualDuration,
      bounce,
      disableAnimation,
    }),
    [
      open,
      handleSetOpen,
      mergedAnimationConfig,
      closeOnClickOutside,
      closeOnEscape,
      modal,
      direction,
      anchor,
      activeSubmenu,
      handleSetActiveSubmenu,
      isSubmenuClosing,
      visualDuration,
      bounce,
      disableAnimation,
    ]
  );

  return (
    <PullDownContext.Provider value={contextValue}>
      <div ref={ref} className="relative inline-block">
        {children}
      </div>
    </PullDownContext.Provider>
  );
});

Root.displayName = "PullDown";

// =============================================================================
// CONTAINER COMPONENT
// =============================================================================

const Container = forwardRef<HTMLDivElement, PullDownContainerProps>(
  function PullDownContainer(
    {
      children,
      buttonSize = 40,
      menuWidth = 200,
      menuRadius = 24,
      buttonRadius,
      className,
      style,
    },
    ref
  ) {
    const {
      open,
      setOpen,
      direction,
      anchor,
      activeSubmenu,
      isSubmenuClosing,
      visualDuration,
      bounce,
      disableAnimation,
    } = usePullDownContext("PullDownContainer");

    const prefersReducedMotion = useReducedMotion();
    const internalRef = useRef<HTMLDivElement>(null);
    const measureRef = useRef<HTMLDivElement>(null);

    const buttonWidth =
      typeof buttonSize === "number" ? buttonSize : buttonSize.width;
    const buttonHeight =
      typeof buttonSize === "number" ? buttonSize : buttonSize.height;
    const [measuredHeight, setMeasuredHeight] = useState<number>(buttonHeight);

    // Use centralized submenu closing state from context
    // Submenu styles should remain active during close animation
    const submenuStylesActive = activeSubmenu !== null || isSubmenuClosing;

    const shouldAnimate = !disableAnimation && !prefersReducedMotion;
    const springConfig: Transition = shouldAnimate
      ? { type: "spring" as const, visualDuration, bounce }
      : { type: "spring" as const, ...REDUCED_MOTION_SPRING };

    useLayoutEffect(() => {
      if (open && measureRef.current) {
        const height = measureRef.current.offsetHeight;
        setMeasuredHeight(height);
      }
    }, [open]);

    const handleClick = useCallback(
      (event: MouseEvent) => {
        if (!open) {
          event.preventDefault();
          setOpen(true);
        }
      },
      [open, setOpen]
    );

    const closedRadius =
      buttonRadius ?? Math.min(buttonWidth, buttonHeight) / 2;
    const positionStyles = getPositionStyles(direction);
    const transformOrigin = getTransformOrigin(direction, anchor);
    const liftAmount = buttonHeight * 0.75;
    const directionOffset = getAnimationOffset(direction, liftAmount);
    const anchorOffset = getAnchorOffset(
      direction,
      anchor,
      menuWidth,
      measuredHeight,
      buttonWidth,
      buttonHeight
    );

    const openOffset = {
      x: (directionOffset.x || 0) + anchorOffset.x,
      y: (directionOffset.y || 0) + anchorOffset.y,
    };

    return (
      <div
        ref={ref}
        style={{
          position: "relative",
          width: buttonWidth,
          height: buttonHeight,
        }}
      >
        <motion.div
          ref={internalRef}
          onClick={handleClick}
          initial={false}
          animate={{
            width: open ? menuWidth : buttonWidth,
            height: open ? measuredHeight : buttonHeight,
            borderRadius: open ? menuRadius : closedRadius,
            x: open ? openOffset.x : 0,
            y: open ? openOffset.y : 0,
            scale: submenuStylesActive ? 0.96 : 1,
            boxShadow: open
              ? "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
              : "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
          }}
          transition={springConfig}
          className={cn(
            "bg-popover text-popover-foreground ring-1 ring-border/50",
            className
          )}
          style={{
            ...positionStyles,
            overflow: submenuStylesActive ? "visible" : "hidden",
            cursor: open ? "default" : "pointer",
            transformOrigin: submenuStylesActive
              ? "center center"
              : transformOrigin,
            zIndex: open ? 50 : "auto",
            willChange: "transform",
            ...style,
          }}
        >
          <div ref={measureRef}>{children}</div>
        </motion.div>
      </div>
    );
  }
);

Container.displayName = "PullDownContainer";

// =============================================================================
// TRIGGER COMPONENT
// =============================================================================

const Trigger = forwardRef<HTMLDivElement, PullDownTriggerProps>(
  function PullDownTrigger(
    { children, disabled = false, className, style },
    ref
  ) {
    const {
      open,
      setOpen,
      triggerRef,
      animationConfig,
      visualDuration,
      bounce,
      disableAnimation,
    } = usePullDownContext("PullDownTrigger");

    const prefersReducedMotion = useReducedMotion();
    const shouldAnimate = !disableAnimation && !prefersReducedMotion;

    const springConfig: Transition = shouldAnimate
      ? {
          type: "spring" as const,
          visualDuration: visualDuration * 0.85,
          bounce,
        }
      : { type: "spring" as const, ...REDUCED_MOTION_SPRING };

    const handleClick = useCallback(
      (event: MouseEvent) => {
        if (disabled) return;
        event.preventDefault();
        event.stopPropagation();
        setOpen(!open);
      },
      [disabled, setOpen, open]
    );

    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (disabled) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setOpen(!open);
        }
        if (event.key === "ArrowDown" && !open) {
          event.preventDefault();
          setOpen(true);
        }
      },
      [disabled, setOpen, open]
    );

    const triggerContentVariants: Variants = {
      visible: {
        opacity: 1,
        filter: "blur(0px)",
      },
      hidden: {
        opacity: 0,
        filter: shouldAnimate
          ? `blur(${animationConfig.triggerBlur}px)`
          : "blur(0px)",
      },
    };

    return (
      <AnimatePresence initial={false}>
        {!open && (
          <motion.div
            ref={(node) => {
              if (ref) {
                if (typeof ref === "function") {
                  ref(node);
                } else {
                  ref.current = node;
                }
              }
              triggerRef.current = node;
            }}
            key="trigger-icon"
            layout={false}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={triggerContentVariants}
            transition={springConfig}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-expanded={open}
            aria-haspopup="menu"
            aria-disabled={disabled}
            className={cn(className)}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: disabled ? "not-allowed" : "pointer",
              ...style,
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

Trigger.displayName = "PullDownTrigger";

// =============================================================================
// CONTENT COMPONENT
// =============================================================================

const Content = forwardRef<HTMLDivElement, PullDownContentProps>(
  function PullDownContent(
    { children, className, style, onAnimationComplete },
    ref
  ) {
    const {
      open,
      contentRef,
      animationConfig,
      isOpenAnimationCompleteRef,
      direction,
      visualDuration,
      bounce,
      disableAnimation,
    } = usePullDownContext("PullDownContent");

    const prefersReducedMotion = useReducedMotion();
    const shouldAnimate = !disableAnimation && !prefersReducedMotion;

    const springConfig: Transition = shouldAnimate
      ? {
          type: "spring" as const,
          visualDuration: visualDuration * 0.85,
          bounce,
        }
      : { type: "spring" as const, ...REDUCED_MOTION_SPRING };

    const getOffset = (amount: number) => {
      switch (direction) {
        case "top":
          return { x: 0, y: amount };
        case "bottom":
          return { x: 0, y: -amount };
        case "left":
          return { x: amount, y: 0 };
        case "right":
          return { x: -amount, y: 0 };
      }
    };

    const hiddenOffset = getOffset(8);
    const exitOffset = getOffset(30);

    const contentVariants: Variants = {
      visible: {
        opacity: 1,
        scale: 1,
        x: 0,
        y: 0,
        filter: "blur(0px)",
        transition: {
          ...springConfig,
          delay: shouldAnimate ? animationConfig.contentDelay : 0,
        },
      },
      hidden: {
        opacity: 0,
        scale: animationConfig.contentScale,
        ...hiddenOffset,
        filter: shouldAnimate
          ? `blur(${animationConfig.contentBlur}px)`
          : "blur(0px)",
      },
      exit: {
        opacity: 0,
        scale: 0.9,
        ...exitOffset,
        filter: shouldAnimate
          ? `blur(${animationConfig.contentBlur}px)`
          : "blur(0px)",
        transition: {
          duration: 0.2,
          ease: [0.4, 0, 1, 1],
        },
      },
    };

    const setRef = useCallback(
      (node: HTMLDivElement | null) => {
        if (ref) {
          if (typeof ref === "function") {
            ref(node);
          } else {
            ref.current = node;
          }
        }
        contentRef.current = node;
      },
      [contentRef, ref]
    );

    const handleAnimationComplete = useCallback(
      (definition: string) => {
        if (definition === "visible") {
          isOpenAnimationCompleteRef.current = true;
        }
        onAnimationComplete?.();
      },
      [isOpenAnimationCompleteRef, onAnimationComplete]
    );

    return (
      <AnimatePresence>
        {open && (
          <motion.div
            ref={setRef}
            key="pulldown-content"
            role="menu"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={contentVariants}
            transition={{
              ...springConfig,
              delay: shouldAnimate ? animationConfig.contentDelay : 0,
            }}
            onAnimationComplete={handleAnimationComplete}
            className={cn(className)}
            style={{ position: "relative", ...style }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

Content.displayName = "PullDownContent";

// =============================================================================
// ITEM COMPONENT
// =============================================================================

const Item = forwardRef<HTMLDivElement, PullDownItemProps>(
  function PullDownItem(
    {
      children,
      onSelect,
      disabled = false,
      closeOnSelect = true,
      className,
      style,
    },
    ref
  ) {
    const {
      setOpen,
      isOpenAnimationCompleteRef,
      activeSubmenu,
      visualDuration,
      bounce,
      disableAnimation,
    } = usePullDownContext("PullDownItem");

    const subMenuContext = useContext(SubMenuContext);
    const [isHovered, setIsHovered] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    const isInsideActiveSubmenu =
      subMenuContext && activeSubmenu === subMenuContext.id;
    const shouldDim = activeSubmenu !== null && !isInsideActiveSubmenu;

    const shouldAnimate = !disableAnimation && !prefersReducedMotion;
    const springConfig: Transition = shouldAnimate
      ? { type: "spring" as const, visualDuration, bounce }
      : { type: "spring" as const, ...REDUCED_MOTION_SPRING };

    const handleClick = useCallback(
      (event: MouseEvent) => {
        if (disabled) return;
        event.preventDefault();
        onSelect?.();
        if (closeOnSelect) {
          setOpen(false);
        }
      },
      [disabled, onSelect, closeOnSelect, setOpen]
    );

    const handleMouseEnter = useCallback(() => {
      if (!isOpenAnimationCompleteRef.current) return;
      if (!disabled) {
        setIsHovered(true);
      }
    }, [disabled, isOpenAnimationCompleteRef]);

    const handleMouseLeave = useCallback(() => {
      setIsHovered(false);
    }, []);

    return (
      <motion.div
        ref={ref}
        role="menuitem"
        aria-disabled={disabled}
        data-disabled={disabled || undefined}
        data-highlighted={isHovered || undefined}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:bg-accent focus:text-accent-foreground",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          className
        )}
        animate={{
          opacity: shouldDim ? 0.5 : 1,
        }}
        transition={springConfig}
        style={{
          cursor: disabled ? "not-allowed" : "pointer",
          transformOrigin: "center center",
          userSelect: "none",
          ...style,
        }}
      >
        {children}
      </motion.div>
    );
  }
);

Item.displayName = "PullDownItem";

// =============================================================================
// PORTAL COMPONENT
// =============================================================================

function Portal({ children, container }: PullDownPortalProps): ReactNode {
  // Use useSyncExternalStore to track mounting in a way that doesn't trigger setState in effect
  const mounted = React.useSyncExternalStore(
    // subscribe - no-op since mount state doesn't change from external sources
    useCallback(() => () => {}, []),
    // getSnapshot - always true on client
    useCallback(() => true, []),
    // getServerSnapshot - always false on server
    useCallback(() => false, [])
  );

  if (!mounted) {
    return null;
  }

  const portalContainer = container ?? document.body;
  return createPortal(children, portalContainer);
}

Portal.displayName = "PullDownPortal";

// =============================================================================
// OVERLAY COMPONENT
// =============================================================================

const Overlay = forwardRef<HTMLDivElement, PullDownOverlayProps>(
  function PullDownOverlay({ className, style, onClick }, ref) {
    const { open, setOpen, visualDuration, bounce, disableAnimation } =
      usePullDownContext("PullDownOverlay");

    const prefersReducedMotion = useReducedMotion();
    const shouldAnimate = !disableAnimation && !prefersReducedMotion;

    const springConfig: Transition = shouldAnimate
      ? { type: "spring" as const, visualDuration, bounce }
      : { type: "spring" as const, ...REDUCED_MOTION_SPRING };

    const handleClick = useCallback(
      (event: MouseEvent) => {
        event.preventDefault();
        if (onClick) {
          onClick();
        } else {
          setOpen(false);
        }
      },
      [onClick, setOpen]
    );

    const overlayVariants: Variants = {
      visible: { opacity: 1 },
      hidden: { opacity: 0 },
    };

    return (
      <AnimatePresence>
        {open && (
          <motion.div
            ref={ref}
            key="pulldown-overlay"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            transition={springConfig}
            onClick={handleClick}
            className={cn("bg-background/80 backdrop-blur-sm", className)}
            style={{
              position: "fixed",
              inset: 0,
              ...style,
            }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    );
  }
);

Overlay.displayName = "PullDownOverlay";

// =============================================================================
// SEPARATOR COMPONENT
// =============================================================================

const Separator = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function PullDownSeparator({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn("my-1 h-px bg-border", className)}
      role="separator"
      {...props}
    />
  );
});

Separator.displayName = "PullDownSeparator";

// =============================================================================
// LABEL COMPONENT
// =============================================================================

const Label = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function PullDownLabel({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "px-3 py-1.5 text-xs font-medium text-muted-foreground",
          className
        )}
        {...props}
      />
    );
  }
);

Label.displayName = "PullDownLabel";

// =============================================================================
// SUBMENU COMPONENT
// =============================================================================

function SubMenu({ children, id }: PullDownSubMenuProps): ReactNode {
  const triggerRef = useRef<HTMLDivElement>(null);
  const contextValue = useMemo(() => ({ id, triggerRef }), [id]);

  return (
    <SubMenuContext.Provider value={contextValue}>
      {children}
    </SubMenuContext.Provider>
  );
}

SubMenu.displayName = "PullDownSubMenu";

// =============================================================================
// SUBMENU TRIGGER COMPONENT
// =============================================================================

const SubMenuTrigger = forwardRef<HTMLDivElement, PullDownSubMenuTriggerProps>(
  function PullDownSubMenuTrigger(
    { children, className, style, disabled = false },
    ref
  ) {
    const {
      setActiveSubmenu,
      activeSubmenu,
      isSubmenuClosing,
      visualDuration,
      bounce,
      disableAnimation,
    } = usePullDownContext("PullDownSubMenuTrigger");

    const { id, triggerRef } = useSubMenuContext();
    const prefersReducedMotion = useReducedMotion();

    const isActive = activeSubmenu === id;
    // Elevated state: active OR closing (for exit animation)
    const isElevated = isActive || isSubmenuClosing;

    const shouldAnimate = !disableAnimation && !prefersReducedMotion;
    const springConfig: Transition = shouldAnimate
      ? { type: "spring" as const, visualDuration, bounce }
      : { type: "spring" as const, ...REDUCED_MOTION_SPRING };

    const openScale = 1.06 / 0.96;

    const handleClick = useCallback(
      (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (!disabled) {
          setActiveSubmenu(isActive ? null : id);
        }
      },
      [disabled, setActiveSubmenu, id, isActive]
    );

    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (disabled) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setActiveSubmenu(isActive ? null : id);
        } else if (event.key === "ArrowRight" && !isActive) {
          event.preventDefault();
          setActiveSubmenu(id);
        } else if (
          (event.key === "ArrowLeft" || event.key === "Escape") &&
          isActive
        ) {
          event.preventDefault();
          setActiveSubmenu(null);
        }
      },
      [disabled, setActiveSubmenu, id, isActive]
    );

    const content =
      typeof children === "function" ? children(isActive) : children;

    return (
      <motion.div
        ref={(node) => {
          if (ref) {
            if (typeof ref === "function") {
              ref(node);
            } else {
              ref.current = node;
            }
          }
          triggerRef.current = node;
        }}
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={isActive}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        data-active={isActive || undefined}
        data-elevated={isElevated || undefined}
        className={cn(
          "flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm outline-none transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:bg-accent focus:text-accent-foreground",
          "data-[elevated]:hover:bg-transparent",
          className
        )}
        initial={false}
        animate={{
          scale: isActive ? openScale : 1,
        }}
        transition={springConfig}
        style={{
          ...style,
          position: "relative",
          zIndex: isElevated ? 20 : undefined,
          transformOrigin: "top center",
          userSelect: "none",
        }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {content}
      </motion.div>
    );
  }
);

SubMenuTrigger.displayName = "PullDownSubMenuTrigger";

// =============================================================================
// SUBMENU CONTENT COMPONENT
// =============================================================================

const SubMenuContent = forwardRef<HTMLDivElement, PullDownSubMenuContentProps>(
  function PullDownSubMenuContent({ children, className, style }, ref) {
    const {
      activeSubmenu,
      setActiveSubmenu,
      contentRef: mainContentRef,
      visualDuration,
      bounce,
      disableAnimation,
    } = usePullDownContext("PullDownSubMenuContent");

    const { id, triggerRef } = useSubMenuContext();
    const prefersReducedMotion = useReducedMotion();
    const subMenuRef = useRef<HTMLDivElement>(null);
    const measureRef = useRef<HTMLDivElement>(null);

    const [triggerTop, setTriggerTop] = useState(0);
    const [triggerHeight, setTriggerHeight] = useState(44);
    const [contentHeight, setContentHeight] = useState(triggerHeight);

    const isActive = activeSubmenu === id;

    useLayoutEffect(() => {
      if (isActive && triggerRef.current) {
        setTriggerTop(triggerRef.current.offsetTop);
        setTriggerHeight(triggerRef.current.offsetHeight);
      }
    }, [isActive, triggerRef]);

    useLayoutEffect(() => {
      if (isActive && measureRef.current) {
        setContentHeight(measureRef.current.offsetHeight);
      }
    }, [isActive, children, triggerHeight]);

    useEffect(() => {
      if (!isActive) return;

      const handleClickOutside = (event: globalThis.MouseEvent) => {
        const target = event.target as Node;

        if (subMenuRef.current?.contains(target)) {
          return;
        }

        if (triggerRef.current?.contains(target)) {
          return;
        }

        if (mainContentRef.current?.contains(target)) {
          event.stopPropagation();
          setActiveSubmenu(null);
          return;
        }

        setActiveSubmenu(null);
      };

      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside, true);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside, true);
      };
    }, [isActive, setActiveSubmenu, mainContentRef, triggerRef]);

    const shouldAnimate = !disableAnimation && !prefersReducedMotion;
    const springConfig: Transition = shouldAnimate
      ? { type: "spring" as const, visualDuration, bounce }
      : { type: "spring" as const, ...REDUCED_MOTION_SPRING };

    const contentSpringConfig: Transition = shouldAnimate
      ? {
          type: "spring" as const,
          visualDuration: visualDuration * 0.85,
          bounce,
        }
      : { type: "spring" as const, ...REDUCED_MOTION_SPRING };

    const contentVariants: Variants = {
      hidden: {
        opacity: 0,
        filter: shouldAnimate ? `blur(${CONTENT_BLUR}px)` : "blur(0px)",
      },
      visible: {
        opacity: 1,
        filter: "blur(0px)",
        transition: {
          ...contentSpringConfig,
          delay: 0.05,
        },
      },
      exit: {
        opacity: 0,
        filter: shouldAnimate ? `blur(${CONTENT_BLUR}px)` : "blur(0px)",
        transition: {
          duration: 0.15,
        },
      },
    };

    const openScale = 1.06 / 0.96;

    return (
      <AnimatePresence>
        {isActive && (
          <motion.div
            ref={(node) => {
              if (ref) {
                if (typeof ref === "function") {
                  ref(node);
                } else {
                  ref.current = node;
                }
              }
              (subMenuRef as MutableRefObject<HTMLDivElement | null>).current =
                node;
            }}
            className={cn(
              "rounded-xl bg-popover p-1 shadow-lg ring-1 ring-border/50",
              className
            )}
            initial={{
              height: triggerHeight,
              scale: 1,
              opacity: 1,
              pointerEvents: "auto" as const,
            }}
            animate={{
              height: contentHeight,
              scale: openScale,
              opacity: 1,
              pointerEvents: "auto" as const,
            }}
            exit={{
              height: triggerHeight,
              scale: 1,
              opacity: 0,
              pointerEvents: "none" as const,
            }}
            transition={{
              height: springConfig,
              scale: springConfig,
              opacity: { duration: 0.15 },
            }}
            style={{
              ...style,
              position: "absolute",
              top: triggerTop,
              left: 0,
              right: 0,
              zIndex: 10,
              overflow: "hidden",
              transformOrigin: "top center",
              willChange: "transform, height, opacity",
              boxSizing: "content-box",
            }}
          >
            <div ref={measureRef}>
              <div style={{ height: triggerHeight }} aria-hidden="true" />
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={contentVariants}
              >
                {children}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

SubMenuContent.displayName = "PullDownSubMenuContent";

// =============================================================================
// ICON COMPONENT (for submenu indicator)
// =============================================================================

interface PullDownChevronProps {
  isActive?: boolean;
  className?: string;
}

function PullDownChevron({ isActive, className }: PullDownChevronProps) {
  return (
    <CaretRightIcon
      className={cn(
        "h-4 w-4 text-muted-foreground transition-transform duration-200",
        isActive && "rotate-90",
        className
      )}
    />
  );
}

PullDownChevron.displayName = "PullDownChevron";

// =============================================================================
// COMPOUND EXPORT
// =============================================================================

export const PullDown = Object.assign(Root, {
  Container,
  Trigger,
  Content,
  Item,
  Portal,
  Overlay,
  Separator,
  Label,
  SubMenu,
  SubMenuTrigger,
  SubMenuContent,
  Chevron: PullDownChevron,
});

// Individual exports for flexibility
export {
  Root as PullDownRoot,
  Container as PullDownContainer,
  Trigger as PullDownTrigger,
  Content as PullDownContent,
  Item as PullDownItem,
  Portal as PullDownPortal,
  Overlay as PullDownOverlay,
  Separator as PullDownSeparator,
  Label as PullDownLabel,
  SubMenu as PullDownSubMenu,
  SubMenuTrigger as PullDownSubMenuTrigger,
  SubMenuContent as PullDownSubMenuContent,
  PullDownChevron,
};
