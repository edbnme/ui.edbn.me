"use client";

import * as React from "react";
import {
  useState,
  useId,
  useRef,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type Transition,
  type Variants,
} from "motion/react";
import useClickOutside from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils";

const TRANSITION: Transition = {
  type: "spring",
  bounce: 0.05,
  duration: 0.3,
};

const DEFAULT_VARIANTS: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    filter: "blur(10px)",
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      bounce: 0,
      duration: 0.3,
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    filter: "blur(10px)",
    transition: {
      duration: 0.2,
    },
  },
};

type PopoverContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  uniqueId: string;
  variants?: Variants;
};

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverLogic({
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}: {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  const uniqueId = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);

  const isOpen = controlledOpen ?? uncontrolledOpen;

  const open = useCallback(() => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(true);
    }
    onOpenChange?.(true);
  }, [controlledOpen, onOpenChange]);

  const close = useCallback(() => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(false);
    }
    onOpenChange?.(false);
  }, [controlledOpen, onOpenChange]);

  return { isOpen, open, close, uniqueId };
}

export type PopoverProps = {
  children: React.ReactNode;
  transition?: Transition;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variants?: Variants;
  className?: string;
} & React.ComponentProps<"div">;

function Popover({
  children,
  transition = TRANSITION,
  defaultOpen,
  open,
  onOpenChange,
  variants,
  className,
  ...props
}: PopoverProps) {
  const popoverLogic = usePopoverLogic({ defaultOpen, open, onOpenChange });

  return (
    <PopoverContext.Provider
      value={{ ...popoverLogic, variants: variants || DEFAULT_VARIANTS }}
    >
      <MotionConfig transition={transition}>
        <div
          className={cn("relative flex items-center justify-center", className)}
          key={popoverLogic.uniqueId}
          {...props}
        >
          {children}
        </div>
      </MotionConfig>
    </PopoverContext.Provider>
  );
}

export type PopoverTriggerProps = {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
} & React.ComponentProps<typeof motion.button>;

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ children, className, asChild = false, ...props }, ref) => {
    const context = useContext(PopoverContext);
    if (!context) {
      throw new Error("PopoverTrigger must be used within Popover");
    }

    if (asChild && React.isValidElement(children)) {
      return (
        <motion.div
          layoutId={`popover-trigger-${context.uniqueId}`}
          className={cn("inline-flex", className)}
          onClick={context.open}
          {...(props as React.ComponentProps<typeof motion.div>)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <motion.button
        ref={ref}
        layoutId={`popover-trigger-${context.uniqueId}`}
        className={cn("inline-flex items-center justify-center", className)}
        onClick={context.open}
        aria-expanded={context.isOpen}
        aria-controls={`popover-content-${context.uniqueId}`}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
PopoverTrigger.displayName = "PopoverTrigger";

export type PopoverLabelProps = {
  children: React.ReactNode;
  className?: string;
} & React.ComponentProps<typeof motion.span>;

const PopoverLabel = React.forwardRef<HTMLSpanElement, PopoverLabelProps>(
  ({ children, className, ...props }, ref) => {
    const context = useContext(PopoverContext);
    if (!context) {
      throw new Error("PopoverLabel must be used within Popover");
    }

    return (
      <motion.span
        ref={ref}
        layoutId={`popover-label-${context.uniqueId}`}
        className={cn("inline-flex items-center gap-2", className)}
        {...props}
      >
        {children}
      </motion.span>
    );
  }
);
PopoverLabel.displayName = "PopoverLabel";

export type PopoverContentProps = {
  children: React.ReactNode;
  className?: string;
} & React.ComponentProps<typeof motion.div>;

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ children, className, ...props }, ref) => {
    const context = useContext(PopoverContext);
    if (!context) throw new Error("PopoverContent must be used within Popover");

    const contentRef = useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => contentRef.current!);

    useClickOutside(contentRef, context.close);

    const { isOpen, close } = context;

    useEffect(() => {
      if (!isOpen) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") close();
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, close]);

    return (
      <AnimatePresence mode="wait">
        {context.isOpen && (
          <motion.div
            ref={contentRef}
            layoutId={`popover-trigger-${context.uniqueId}`}
            id={`popover-content-${context.uniqueId}`}
            role="dialog"
            aria-modal="true"
            className={cn(
              "absolute z-50 min-w-[300px] max-w-[95vw] overflow-hidden rounded-2xl border border-zinc-200 bg-white/90 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/90",
              className
            )}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={context.variants}
            {...props}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);
PopoverContent.displayName = "PopoverContent";

export type PopoverHeaderProps = {
  children: React.ReactNode;
  className?: string;
} & React.ComponentProps<typeof motion.div>;

const PopoverHeader = React.forwardRef<HTMLDivElement, PopoverHeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "flex flex-col items-start gap-1 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
PopoverHeader.displayName = "PopoverHeader";

export type PopoverTitleProps = {
  children: React.ReactNode;
  className?: string;
} & React.ComponentProps<typeof motion.h2>;

const PopoverTitle = React.forwardRef<HTMLHeadingElement, PopoverTitleProps>(
  ({ children, className, ...props }, ref) => {
    const context = useContext(PopoverContext);
    if (!context) {
      throw new Error("PopoverTitle must be used within Popover");
    }

    return (
      <motion.h2
        ref={ref}
        layoutId={`popover-label-${context.uniqueId}`}
        className={cn(
          "flex items-center gap-2 text-sm font-medium leading-none text-zinc-900 dark:text-zinc-100",
          className
        )}
        {...props}
      >
        {children}
      </motion.h2>
    );
  }
);
PopoverTitle.displayName = "PopoverTitle";

export type PopoverDescriptionProps = {
  children: React.ReactNode;
  className?: string;
} & React.ComponentProps<typeof motion.p>;

const PopoverDescription = React.forwardRef<
  HTMLParagraphElement,
  PopoverDescriptionProps
>(({ children, className, ...props }, ref) => {
  return (
    <motion.p
      ref={ref}
      variants={{
        initial: { opacity: 0, y: 5 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 5 },
      }}
      className={cn("text-sm text-zinc-500 dark:text-zinc-400", className)}
      {...props}
    >
      {children}
    </motion.p>
  );
});
PopoverDescription.displayName = "PopoverDescription";

export type PopoverBodyProps = {
  children: React.ReactNode;
  className?: string;
} & React.ComponentProps<typeof motion.div>;

const PopoverBody = React.forwardRef<HTMLDivElement, PopoverBodyProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn("p-4", className)}
        variants={{
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 10 },
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
PopoverBody.displayName = "PopoverBody";

export type PopoverFooterProps = {
  children: React.ReactNode;
  className?: string;
} & React.ComponentProps<typeof motion.div>;

const PopoverFooter = React.forwardRef<HTMLDivElement, PopoverFooterProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "flex items-center justify-end gap-2 border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800",
          className
        )}
        variants={{
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 10 },
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
PopoverFooter.displayName = "PopoverFooter";

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverBody,
  PopoverFooter,
  PopoverLabel,
};
