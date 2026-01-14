import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, "..");

// Component registry configuration
const components = {
  button: {
    type: "registry:ui",
    title: "Button",
    description:
      "Animated button component with press feedback, loading states, and icon support.",
    dependencies: [
      "@radix-ui/react-slot",
      "class-variance-authority",
      "motion",
      "@phosphor-icons/react",
      "tw-animate-css",
    ],
    registryDependencies: ["utils"],
    inlineDependencies: ["motion-provider", "icons"],
    files: [{ path: "components/ui/button.tsx", type: "registry:ui" }],
  },
  "alert-dialog": {
    type: "registry:ui",
    title: "Alert Dialog",
    description:
      "Animated modal dialog with morphing animations, focus trap, and controlled/uncontrolled state.",
    dependencies: ["motion", "@phosphor-icons/react", "tw-animate-css"],
    registryDependencies: ["utils", "button"],
    inlineDependencies: [
      "motion-provider",
      "animations",
      "tokens",
      "use-stable-id",
      "use-controllable-state",
    ],
    files: [{ path: "components/ui/alert-dialog.tsx", type: "registry:ui" }],
    cssVars: true,
    tailwind: {
      config: {},
    },
  },
  popover: {
    type: "registry:ui",
    title: "Popover",
    description:
      "Animated popover component with morphing transitions, focus trap, and click-outside handling.",
    dependencies: ["motion", "tw-animate-css"],
    registryDependencies: ["utils"],
    inlineDependencies: [
      "motion-provider",
      "animations",
      "tokens",
      "use-stable-id",
      "use-controllable-state",
      "use-click-outside",
    ],
    files: [{ path: "components/ui/popover.tsx", type: "registry:ui" }],
    cssVars: true,
    tailwind: {
      config: {},
    },
  },
  "dropdown-menu": {
    type: "registry:ui",
    title: "Dropdown Menu",
    description:
      "Animated dropdown menu with smooth spring animations and staggered item reveals.",
    dependencies: [
      "@radix-ui/react-dropdown-menu",
      "motion",
      "@phosphor-icons/react",
      "tw-animate-css",
    ],
    registryDependencies: ["utils"],
    inlineDependencies: ["motion-provider", "animations", "tokens"],
    files: [{ path: "components/ui/dropdown-menu.tsx", type: "registry:ui" }],
    cssVars: true,
    tailwind: {
      config: {},
    },
  },
  "motion-provider": {
    type: "registry:component",
    title: "Motion Provider",
    description:
      "Global animation configuration provider with reduced motion and low-power device detection.",
    dependencies: ["motion", "tw-animate-css"],
    registryDependencies: [],
    inlineDependencies: [],
    files: [
      { path: "components/motion-provider.tsx", type: "registry:component" },
      { path: "hooks/use-reduced-motion.ts", type: "registry:hook" },
      { path: "hooks/use-low-power-device.ts", type: "registry:hook" },
      { path: "lib/motion.ts", type: "registry:lib" },
    ],
  },
  animations: {
    type: "registry:lib",
    title: "Animations",
    description:
      "Motion system with spring presets, transitions, and variant factories.",
    dependencies: ["motion", "tw-animate-css"],
    registryDependencies: [],
    inlineDependencies: [],
    files: [{ path: "lib/animations.ts", type: "registry:lib" }],
  },
  tokens: {
    type: "registry:lib",
    title: "Design Tokens",
    description:
      "Centralized design tokens for colors, spacing, typography, shadows, and more.",
    dependencies: [],
    registryDependencies: [],
    inlineDependencies: [],
    files: [{ path: "lib/tokens.ts", type: "registry:lib" }],
  },
  icons: {
    type: "registry:lib",
    title: "Animated Icons",
    description:
      "Animated icon components including loading spinners, morphing icons, and close buttons.",
    dependencies: ["motion", "@phosphor-icons/react", "tw-animate-css"],
    registryDependencies: ["utils"],
    inlineDependencies: ["motion-provider"],
    files: [{ path: "lib/icons.tsx", type: "registry:lib" }],
  },
  "use-click-outside": {
    type: "registry:hook",
    title: "useClickOutside",
    description: "Hook to detect clicks outside a referenced element.",
    dependencies: [],
    registryDependencies: [],
    inlineDependencies: [],
    files: [{ path: "hooks/use-click-outside.tsx", type: "registry:hook" }],
  },
  "use-stable-id": {
    type: "registry:hook",
    title: "useStableId",
    description:
      "SSR-safe hook for generating stable unique IDs for accessibility attributes.",
    dependencies: [],
    registryDependencies: [],
    inlineDependencies: [],
    files: [{ path: "hooks/use-stable-id.ts", type: "registry:hook" }],
  },
  "use-controllable-state": {
    type: "registry:hook",
    title: "useControllableState",
    description:
      "Hook for handling controlled/uncontrolled state pattern in components.",
    dependencies: [],
    registryDependencies: [],
    inlineDependencies: [],
    files: [{ path: "hooks/use-controllable-state.ts", type: "registry:hook" }],
  },
  "use-merged-refs": {
    type: "registry:hook",
    title: "useMergedRefs",
    description: "Hook to merge multiple refs into a single callback ref.",
    dependencies: [],
    registryDependencies: [],
    inlineDependencies: [],
    files: [{ path: "hooks/use-merged-refs.ts", type: "registry:hook" }],
  },
  avatar: {
    type: "registry:ui",
    title: "Avatar",
    description:
      "Composable avatar component with sizes, status indicators, and group stacking support.",
    dependencies: ["@radix-ui/react-avatar", "class-variance-authority"],
    registryDependencies: ["utils"],
    inlineDependencies: [],
    files: [{ path: "components/ui/avatar.tsx", type: "registry:ui" }],
  },
  "pull-down": {
    type: "registry:ui",
    title: "Pull Down Menu",
    description:
      "A pull down menu with morphing animations. The trigger morphs into the menu container with spring physics.",
    dependencies: ["motion", "@phosphor-icons/react", "tw-animate-css"],
    registryDependencies: ["utils"],
    inlineDependencies: ["motion-provider"],
    files: [{ path: "components/ui/pull-down.tsx", type: "registry:ui" }],
    cssVars: true,
    tailwind: {
      config: {},
    },
  },
  input: {
    type: "registry:ui",
    title: "Input",
    description:
      "A styled input component with focus states, validation support, and file input styling.",
    dependencies: [],
    registryDependencies: ["utils"],
    inlineDependencies: [],
    files: [{ path: "components/ui/input.tsx", type: "registry:ui" }],
  },
  "scroll-area": {
    type: "registry:ui",
    title: "Scroll Area",
    description:
      "A scrollable area with custom scrollbars built on Radix UI ScrollArea.",
    dependencies: ["@radix-ui/react-scroll-area"],
    registryDependencies: ["utils"],
    inlineDependencies: [],
    files: [{ path: "components/ui/scroll-area.tsx", type: "registry:ui" }],
  },
  separator: {
    type: "registry:ui",
    title: "Separator",
    description:
      "A visual separator for dividing content, supporting horizontal and vertical orientations.",
    dependencies: ["@radix-ui/react-separator"],
    registryDependencies: ["utils"],
    inlineDependencies: [],
    files: [{ path: "components/ui/separator.tsx", type: "registry:ui" }],
  },
  sheet: {
    type: "registry:ui",
    title: "Sheet",
    description:
      "A slide-out panel component with drag-to-dismiss, multiple sides, and smooth animations.",
    dependencies: [
      "@radix-ui/react-dialog",
      "class-variance-authority",
      "motion",
    ],
    registryDependencies: ["utils"],
    inlineDependencies: ["motion-provider", "icons"],
    files: [{ path: "components/ui/sheet.tsx", type: "registry:ui" }],
  },
  skeleton: {
    type: "registry:ui",
    title: "Skeleton",
    description:
      "A loading placeholder component with pulse animation for content loading states.",
    dependencies: [],
    registryDependencies: ["utils"],
    inlineDependencies: [],
    files: [{ path: "components/ui/skeleton.tsx", type: "registry:ui" }],
  },
  slider: {
    type: "registry:ui",
    title: "Slider",
    description:
      "A range slider component with single or multiple thumbs, built on Radix UI Slider.",
    dependencies: ["@radix-ui/react-slider"],
    registryDependencies: ["utils"],
    inlineDependencies: [],
    files: [{ path: "components/ui/slider.tsx", type: "registry:ui" }],
  },
  tooltip: {
    type: "registry:ui",
    title: "Tooltip",
    description:
      "A tooltip component with smooth animations and configurable positioning.",
    dependencies: ["@radix-ui/react-tooltip"],
    registryDependencies: ["utils"],
    inlineDependencies: [],
    files: [{ path: "components/ui/tooltip.tsx", type: "registry:ui" }],
  },
  sidebar: {
    type: "registry:ui",
    title: "Sidebar",
    description:
      "A responsive sidebar component with collapsible states, mobile sheet mode, and keyboard shortcuts.",
    dependencies: [
      "@radix-ui/react-slot",
      "class-variance-authority",
      "@phosphor-icons/react",
    ],
    registryDependencies: [
      "utils",
      "button",
      "input",
      "separator",
      "sheet",
      "skeleton",
      "tooltip",
    ],
    inlineDependencies: ["use-mobile"],
    files: [{ path: "components/ui/sidebar.tsx", type: "registry:ui" }],
  },
  "use-mobile": {
    type: "registry:hook",
    title: "useMobile",
    description: "Hook to detect mobile viewport based on media query.",
    dependencies: [],
    registryDependencies: [],
    inlineDependencies: [],
    files: [{ path: "hooks/use-mobile.ts", type: "registry:hook" }],
  },
};

function escapeContent(content) {
  // Return as-is, JSON.stringify will handle escaping
  return content;
}

function updateRegistryFile(name, config) {
  // Collect all files including inline dependencies
  const allFiles = [...config.files];

  // Add files from inline dependencies
  if (config.inlineDependencies && config.inlineDependencies.length > 0) {
    config.inlineDependencies.forEach((depName) => {
      const depConfig = components[depName];
      if (depConfig) {
        allFiles.push(...depConfig.files);
      }
    });
  }

  const registryItem = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name,
    type: config.type,
    title: config.title,
    description: config.description,
    dependencies: config.dependencies,
    registryDependencies: config.registryDependencies,
    files: allFiles.map((file) => {
      const fullPath = join(root, file.path);
      const content = readFileSync(fullPath, "utf-8");
      return {
        path: file.path,
        content: escapeContent(content),
        type: file.type,
      };
    }),
  };

  // Add CSS vars configuration if present (using OKLCH colors for Tailwind v4)
  if (config.cssVars) {
    registryItem.cssVars = {
      light: {
        // Base radius
        radius: "0.75rem",
        // Core colors (OKLCH format)
        background: "oklch(1 0 0)",
        foreground: "oklch(0.145 0 0)",
        card: "oklch(1 0 0)",
        "card-foreground": "oklch(0.145 0 0)",
        popover: "oklch(1 0 0)",
        "popover-foreground": "oklch(0.145 0 0)",
        primary: "oklch(0.205 0 0)",
        "primary-foreground": "oklch(0.985 0 0)",
        secondary: "oklch(0.97 0 0)",
        "secondary-foreground": "oklch(0.205 0 0)",
        muted: "oklch(0.97 0 0)",
        "muted-foreground": "oklch(0.556 0 0)",
        accent: "oklch(0.97 0 0)",
        "accent-foreground": "oklch(0.205 0 0)",
        destructive: "oklch(0.577 0.245 27.325)",
        "destructive-foreground": "oklch(0.985 0 0)",
        border: "oklch(0.922 0 0)",
        input: "oklch(0.922 0 0)",
        ring: "oklch(0.708 0 0)",
        // Charts
        "chart-1": "oklch(0.646 0.222 41.116)",
        "chart-2": "oklch(0.6 0.118 184.704)",
        "chart-3": "oklch(0.398 0.07 227.392)",
        "chart-4": "oklch(0.828 0.189 84.429)",
        "chart-5": "oklch(0.769 0.188 70.08)",
        // Sidebar
        sidebar: "oklch(0.985 0 0)",
        "sidebar-foreground": "oklch(0.145 0 0)",
        "sidebar-primary": "oklch(0.205 0 0)",
        "sidebar-primary-foreground": "oklch(0.985 0 0)",
        "sidebar-accent": "oklch(0.97 0 0)",
        "sidebar-accent-foreground": "oklch(0.205 0 0)",
        "sidebar-border": "oklch(0.922 0 0)",
        "sidebar-ring": "oklch(0.708 0 0)",
        // Light mode shadows
        "shadow-xs": "0 1px 2px oklch(0 0 0 / 0.04)",
        "shadow-sm":
          "0 1px 3px oklch(0 0 0 / 0.06), 0 1px 2px oklch(0 0 0 / 0.04)",
        "shadow-md":
          "0 4px 6px oklch(0 0 0 / 0.05), 0 2px 4px oklch(0 0 0 / 0.04)",
        "shadow-lg":
          "0 10px 15px oklch(0 0 0 / 0.08), 0 4px 6px oklch(0 0 0 / 0.04)",
        "shadow-xl":
          "0 20px 25px oklch(0 0 0 / 0.1), 0 8px 10px oklch(0 0 0 / 0.05)",
        "shadow-2xl": "0 25px 50px oklch(0 0 0 / 0.15)",
      },
      dark: {
        // Core colors (OKLCH format)
        background: "oklch(0.21 0.006 285.885)",
        foreground: "oklch(0.985 0 0)",
        card: "oklch(0.205 0 0)",
        "card-foreground": "oklch(0.985 0 0)",
        popover: "oklch(0.205 0 0)",
        "popover-foreground": "oklch(0.985 0 0)",
        primary: "oklch(0.922 0 0)",
        "primary-foreground": "oklch(0.205 0 0)",
        secondary: "oklch(0.269 0 0)",
        "secondary-foreground": "oklch(0.985 0 0)",
        muted: "oklch(0.269 0 0)",
        "muted-foreground": "oklch(0.708 0 0)",
        accent: "oklch(0.269 0 0)",
        "accent-foreground": "oklch(0.985 0 0)",
        destructive: "oklch(0.704 0.191 22.216)",
        "destructive-foreground": "oklch(0.985 0 0)",
        border: "oklch(1 0 0 / 10%)",
        input: "oklch(1 0 0 / 15%)",
        ring: "oklch(0.556 0 0)",
        // Charts
        "chart-1": "oklch(0.488 0.243 264.376)",
        "chart-2": "oklch(0.696 0.17 162.48)",
        "chart-3": "oklch(0.769 0.188 70.08)",
        "chart-4": "oklch(0.627 0.265 303.9)",
        "chart-5": "oklch(0.645 0.246 16.439)",
        // Sidebar
        sidebar: "oklch(0.205 0 0)",
        "sidebar-foreground": "oklch(0.985 0 0)",
        "sidebar-primary": "oklch(0.488 0.243 264.376)",
        "sidebar-primary-foreground": "oklch(0.985 0 0)",
        "sidebar-accent": "oklch(0.269 0 0)",
        "sidebar-accent-foreground": "oklch(0.985 0 0)",
        "sidebar-border": "oklch(1 0 0 / 10%)",
        "sidebar-ring": "oklch(0.556 0 0)",
        // Dark mode shadows
        "shadow-xs": "0 1px 2px oklch(0 0 0 / 0.1)",
        "shadow-sm":
          "0 1px 3px oklch(0 0 0 / 0.15), 0 1px 2px oklch(0 0 0 / 0.1)",
        "shadow-md":
          "0 4px 6px oklch(0 0 0 / 0.15), 0 2px 4px oklch(0 0 0 / 0.1)",
        "shadow-lg":
          "0 10px 15px oklch(0 0 0 / 0.2), 0 4px 6px oklch(0 0 0 / 0.1)",
        "shadow-xl":
          "0 20px 25px oklch(0 0 0 / 0.25), 0 8px 10px oklch(0 0 0 / 0.1)",
        "shadow-2xl": "0 25px 50px oklch(0 0 0 / 0.35)",
      },
      // Global theme tokens (not themed by light/dark)
      theme: {
        // Blur values
        "blur-sm": "4px",
        "blur-md": "8px",
        "blur-lg": "16px",
        "blur-xl": "20px",
        "blur-2xl": "32px",
        // Backdrop saturation for glassmorphism
        "backdrop-saturate": "180%",
        // Spring timing (CSS approximation)
        "spring-snappy": "cubic-bezier(0.25, 0.1, 0.25, 1)",
        "spring-bouncy": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "spring-smooth": "cubic-bezier(0.33, 1, 0.68, 1)",
        // Duration presets
        "duration-instant": "0ms",
        "duration-fast": "100ms",
        "duration-normal": "200ms",
        "duration-slow": "300ms",
        "duration-slower": "500ms",
      },
    };
  }

  // Add tailwind configuration if present
  if (config.tailwind) {
    registryItem.tailwind = {
      config: {
        theme: {
          extend: {
            fontFamily: {
              sans: [
                "var(--font-sans)",
                "Inter",
                "ui-sans-serif",
                "system-ui",
                "-apple-system",
                "BlinkMacSystemFont",
                "Segoe UI",
                "Roboto",
                "Helvetica Neue",
                "Arial",
                "Noto Sans",
                "sans-serif",
              ],
            },
          },
        },
      },
    };
  }

  // Add cssVars.theme for Tailwind v4 @theme directive mapping
  // This is the correct property for Tailwind v4 color mappings
  if (config.cssVars) {
    // Extend cssVars with theme property for Tailwind v4
    registryItem.cssVars.theme = {
      "--color-background": "var(--background)",
      "--color-foreground": "var(--foreground)",
      "--color-card": "var(--card)",
      "--color-card-foreground": "var(--card-foreground)",
      "--color-popover": "var(--popover)",
      "--color-popover-foreground": "var(--popover-foreground)",
      "--color-primary": "var(--primary)",
      "--color-primary-foreground": "var(--primary-foreground)",
      "--color-secondary": "var(--secondary)",
      "--color-secondary-foreground": "var(--secondary-foreground)",
      "--color-muted": "var(--muted)",
      "--color-muted-foreground": "var(--muted-foreground)",
      "--color-accent": "var(--accent)",
      "--color-accent-foreground": "var(--accent-foreground)",
      "--color-destructive": "var(--destructive)",
      "--color-destructive-foreground": "var(--destructive-foreground)",
      "--color-border": "var(--border)",
      "--color-input": "var(--input)",
      "--color-ring": "var(--ring)",
      "--radius-sm": "calc(var(--radius) - 4px)",
      "--radius-md": "calc(var(--radius) - 2px)",
      "--radius-lg": "var(--radius)",
      "--radius-xl": "calc(var(--radius) + 4px)",
    };

    // Add base layer CSS separately
    registryItem.css = {
      "@layer base": {
        "*": {
          "border-color": "var(--border)",
          "outline-color": "var(--ring)",
        },
        body: {
          "background-color": "var(--background)",
          color: "var(--foreground)",
        },
      },
    };
  }

  const outputPath = join(root, "public", "r", `${name}.json`);
  writeFileSync(outputPath, JSON.stringify(registryItem, null, 2), "utf-8");
  console.log(`✅ Updated ${name}.json`);
}

function updateMainRegistry() {
  const items = Object.entries(components).map(([name, config]) => ({
    name,
    type: config.type,
    title: config.title,
    description: config.description,
    dependencies: config.dependencies,
    registryDependencies: config.registryDependencies,
    files: config.files.map((f) => ({ path: f.path, type: f.type })),
  }));

  const registry = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "edbn-ui",
    version: "0.2.0",
    homepage: "https://ui.edbn.me",
    items,
  };

  const registryPath = join(root, "registry.json");
  writeFileSync(registryPath, JSON.stringify(registry, null, 2), "utf-8");
  console.log("✅ Updated registry.json");

  const publicRegistryPath = join(root, "public", "r", "registry.json");
  writeFileSync(publicRegistryPath, JSON.stringify(registry, null, 2), "utf-8");
  console.log("✅ Updated public/r/registry.json");
}

// Main execution
console.log("🔄 Updating registry files...\n");

// Update individual component registry files
Object.entries(components).forEach(([name, config]) => {
  try {
    updateRegistryFile(name, config);
  } catch (error) {
    console.error(`❌ Failed to update ${name}.json:`, error.message);
  }
});

// Update main registry
try {
  updateMainRegistry();
} catch (error) {
  console.error("❌ Failed to update main registry:", error.message);
}

console.log("\n✨ Registry update complete!");
