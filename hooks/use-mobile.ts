import * as React from "react";

/** Breakpoint in pixels for mobile detection */
const MOBILE_BREAKPOINT = 768;

/**
 * Hook to detect mobile viewport width.
 *
 * Uses the `matchMedia` API to reactively detect viewport changes
 * and returns whether the current viewport is mobile-sized.
 *
 * @returns `true` if viewport width is less than 768px, `false` otherwise.
 *          Returns `false` during SSR/initial render.
 *
 * @example
 * ```tsx
 * function ResponsiveLayout() {
 *   const isMobile = useIsMobile();
 *
 *   return isMobile ? <MobileNav /> : <DesktopNav />;
 * }
 * ```
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
