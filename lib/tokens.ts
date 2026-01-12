/**
 * Design Tokens - Single source of truth for all visual design
 *
 * These tokens define the design language for the component library.
 * Always reference tokens instead of hardcoding values.
 *
 * @packageDocumentation
 */

// =============================================================================
// COLOR SYSTEM
// Using OKLCH for better perceptual uniformity
// Colors are semantic - use these, not raw values
// =============================================================================

export const colors = {
  /**
   * Primitive colors - Raw color palette (reference only)
   * Use semantic tokens in components, not these directly
   */
  primitives: {
    white: "oklch(1 0 0)",
    black: "oklch(0 0 0)",
    gray: {
      50: "oklch(0.985 0 0)",
      100: "oklch(0.97 0 0)",
      200: "oklch(0.922 0 0)",
      300: "oklch(0.87 0 0)",
      400: "oklch(0.708 0 0)",
      500: "oklch(0.556 0 0)",
      600: "oklch(0.44 0 0)",
      700: "oklch(0.371 0 0)",
      800: "oklch(0.269 0 0)",
      900: "oklch(0.205 0 0)",
      950: "oklch(0.145 0 0)",
    },
    red: {
      50: "oklch(0.97 0.02 20)",
      100: "oklch(0.94 0.05 20)",
      500: "oklch(0.637 0.237 25.331)",
      600: "oklch(0.577 0.245 27.325)",
      700: "oklch(0.505 0.213 27.518)",
    },
    blue: {
      50: "oklch(0.97 0.02 250)",
      100: "oklch(0.94 0.05 250)",
      500: "oklch(0.623 0.214 259.532)",
      600: "oklch(0.546 0.245 262.881)",
    },
  },

  /**
   * Semantic colors - Use these in components
   * Maps to CSS variables defined in globals.css
   */
  semantic: {
    background: "var(--background)",
    foreground: "var(--foreground)",
    card: "var(--card)",
    cardForeground: "var(--card-foreground)",
    popover: "var(--popover)",
    popoverForeground: "var(--popover-foreground)",
    primary: "var(--primary)",
    primaryForeground: "var(--primary-foreground)",
    secondary: "var(--secondary)",
    secondaryForeground: "var(--secondary-foreground)",
    muted: "var(--muted)",
    mutedForeground: "var(--muted-foreground)",
    accent: "var(--accent)",
    accentForeground: "var(--accent-foreground)",
    destructive: "var(--destructive)",
    border: "var(--border)",
    input: "var(--input)",
    ring: "var(--ring)",
  },
} as const;

// =============================================================================
// SPACING SCALE
// 4px base, 4px increments (1 unit = 4px)
// =============================================================================

export const spacing = {
  0: "0",
  px: "1px",
  0.5: "0.125rem", // 2px
  1: "0.25rem", // 4px
  1.5: "0.375rem", // 6px
  2: "0.5rem", // 8px
  2.5: "0.625rem", // 10px
  3: "0.75rem", // 12px
  3.5: "0.875rem", // 14px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  7: "1.75rem", // 28px
  8: "2rem", // 32px
  9: "2.25rem", // 36px
  10: "2.5rem", // 40px
  11: "2.75rem", // 44px
  12: "3rem", // 48px
  14: "3.5rem", // 56px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  28: "7rem", // 112px
  32: "8rem", // 128px
} as const;

// =============================================================================
// BORDER RADIUS
// 8px base with 4px increments
// =============================================================================

export const radius = {
  none: "0",
  sm: "calc(var(--radius) - 4px)", // ~8px
  md: "calc(var(--radius) - 2px)", // ~10px
  DEFAULT: "var(--radius)", // ~12px
  lg: "var(--radius)", // ~12px
  xl: "calc(var(--radius) + 4px)", // ~16px
  "2xl": "calc(var(--radius) + 8px)", // ~20px
  "3xl": "calc(var(--radius) + 12px)", // ~24px
  full: "9999px",
} as const;

// =============================================================================
// TYPOGRAPHY SCALE
// =============================================================================

export const typography = {
  /**
   * Font Size Scale
   */
  fontSize: {
    xs: ["0.75rem", { lineHeight: "1rem" }], // 12px
    sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14px
    base: ["1rem", { lineHeight: "1.5rem" }], // 16px
    lg: ["1.125rem", { lineHeight: "1.75rem" }], // 18px
    xl: ["1.25rem", { lineHeight: "1.75rem" }], // 20px
    "2xl": ["1.5rem", { lineHeight: "2rem" }], // 24px
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px
    "5xl": ["3rem", { lineHeight: "1" }], // 48px
    "6xl": ["3.75rem", { lineHeight: "1" }], // 60px
  },

  /**
   * Font Weight Scale
   */
  fontWeight: {
    thin: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },

  /**
   * Letter Spacing
   */
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },

  /**
   * Line Height
   */
  lineHeight: {
    none: "1",
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  },
} as const;

// =============================================================================
// SHADOW ELEVATIONS
// 0-5 levels following Material Design elevation philosophy
// =============================================================================

export const shadows = {
  none: "none",
  xs: "var(--shadow-xs)",
  sm: "var(--shadow-sm)",
  DEFAULT: "var(--shadow-md)",
  md: "var(--shadow-md)",
  lg: "var(--shadow-lg)",
  xl: "var(--shadow-xl)",
  "2xl": "var(--shadow-2xl)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
} as const;

// =============================================================================
// Z-INDEX LAYERS
// Prevents z-index wars - use these, never raw numbers
// =============================================================================

export const zIndex = {
  auto: "auto",
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
} as const;

// =============================================================================
// ANIMATION DURATIONS
// Standardized timing values
// =============================================================================

export const durations = {
  instant: 0,
  fastest: 50,
  fast: 100,
  normal: 200,
  slow: 300,
  slower: 500,
  slowest: 800,
} as const;

// =============================================================================
// EASING FUNCTIONS
// Cubic-bezier curves for CSS transitions
// =============================================================================

export const easings = {
  linear: "linear",
  ease: "ease",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  easeOut: "cubic-bezier(0, 0, 0.2, 1)",
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  /** Spring-like (CSS approximation) */
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  /** Snappy - for buttons, toggles */
  snappy: "var(--spring-snappy)",
  /** Bouncy - for attention */
  bouncy: "var(--spring-bouncy)",
  /** Smooth - for modals */
  smooth: "var(--spring-smooth)",
} as const;

// =============================================================================
// BREAKPOINTS
// Responsive design breakpoints
// =============================================================================

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// =============================================================================
// SIZES
// Component size presets
// =============================================================================

export const sizes = {
  /** Touch target minimum (44px iOS, 48dp Android) */
  touchTarget: "44px",
  /** Icon sizes */
  icon: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    DEFAULT: "1rem", // 16px
    md: "1.25rem", // 20px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
  },
  /** Button heights */
  button: {
    sm: "2.25rem", // 36px
    DEFAULT: "2.5rem", // 40px
    md: "2.5rem", // 40px
    lg: "2.75rem", // 44px
    xl: "3rem", // 48px
  },
  /** Input heights */
  input: {
    sm: "2.25rem", // 36px
    DEFAULT: "2.5rem", // 40px
    md: "2.5rem", // 40px
    lg: "2.75rem", // 44px
  },
} as const;

// =============================================================================
// OPACITY VALUES
// Consistent transparency levels
// =============================================================================

export const opacity = {
  0: "0",
  5: "0.05",
  10: "0.1",
  15: "0.15",
  20: "0.2",
  25: "0.25",
  30: "0.3",
  40: "0.4",
  50: "0.5",
  60: "0.6",
  70: "0.7",
  75: "0.75",
  80: "0.8",
  90: "0.9",
  95: "0.95",
  100: "1",
} as const;

// =============================================================================
// BLUR VALUES
// For glassmorphism and backdrop effects
// =============================================================================

export const blur = {
  none: "0",
  sm: "var(--blur-sm)", // 4px
  DEFAULT: "var(--blur-md)", // 8px
  md: "var(--blur-md)", // 8px
  lg: "var(--blur-lg)", // 16px
  xl: "var(--blur-xl)", // 20px
  "2xl": "var(--blur-2xl)", // 32px
} as const;

// =============================================================================
// TYPE EXPORTS
// For use in component prop types
// =============================================================================

export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
export type Shadow = keyof typeof shadows;
export type ZIndex = keyof typeof zIndex;
export type Duration = keyof typeof durations;
export type Easing = keyof typeof easings;
export type Breakpoint = keyof typeof breakpoints;
export type IconSize = keyof typeof sizes.icon;
export type ButtonSize = keyof typeof sizes.button;
export type Opacity = keyof typeof opacity;
export type Blur = keyof typeof blur;

// =============================================================================
// TOKEN ACCESS HELPERS
// =============================================================================

/**
 * Gets a spacing value by key
 * @example getSpacing(4) => '1rem'
 */
export function getSpacing(key: Spacing): string {
  return spacing[key];
}

/**
 * Gets a radius value by key
 * @example getRadius('lg') => 'var(--radius)'
 */
export function getRadius(key: Radius): string {
  return radius[key];
}

/**
 * Gets a z-index value by key
 * @example getZIndex('modal') => 1400
 */
export function getZIndex(key: ZIndex): string | number {
  return zIndex[key];
}

/**
 * Gets a duration value in ms
 * @example getDuration('normal') => 200
 */
export function getDuration(key: Duration): number {
  return durations[key];
}
