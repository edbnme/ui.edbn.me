# edbn-ui Registry Guide

> Reference guide for adding new components to the shadcn registry at https://ui.edbn.me

## Quick Start

### Install a Component

```bash
# Install using the shadcn CLI
npx shadcn@latest add https://ui.edbn.me/r/button.json
```

### Available Components

#### UI Components

| Component         | Registry URL                              | Description                                                       |
| ----------------- | ----------------------------------------- | ----------------------------------------------------------------- |
| **Button**        | `https://ui.edbn.me/r/button.json`        | Animated button with press feedback, loading states, icon support |
| **Alert Dialog**  | `https://ui.edbn.me/r/alert-dialog.json`  | Modal dialog with morphing animations and focus trap              |
| **Avatar**        | `https://ui.edbn.me/r/avatar.json`        | Composable avatar with sizes, status indicators, group stacking   |
| **Dropdown Menu** | `https://ui.edbn.me/r/dropdown-menu.json` | Dropdown menu with smooth spring animations                       |
| **Input**         | `https://ui.edbn.me/r/input.json`         | Styled input with focus states and validation support             |
| **Popover**       | `https://ui.edbn.me/r/popover.json`       | Animated popover with morphing transitions                        |
| **Pull Down**     | `https://ui.edbn.me/r/pull-down.json`     | Pull down menu with morphing animations                           |
| **Scroll Area**   | `https://ui.edbn.me/r/scroll-area.json`   | Scrollable area with custom scrollbars                            |
| **Separator**     | `https://ui.edbn.me/r/separator.json`     | Visual separator for dividing content                             |
| **Sheet**         | `https://ui.edbn.me/r/sheet.json`         | Slide-out panel with drag-to-dismiss                              |
| **Sidebar**       | `https://ui.edbn.me/r/sidebar.json`       | Responsive sidebar with collapsible states                        |
| **Skeleton**      | `https://ui.edbn.me/r/skeleton.json`      | Loading placeholder with pulse animation                          |
| **Slider**        | `https://ui.edbn.me/r/slider.json`        | Range slider with single or multiple thumbs                       |
| **Tooltip**       | `https://ui.edbn.me/r/tooltip.json`       | Tooltip with smooth animations                                    |

#### Utilities

| Utility             | Registry URL                                | Description                                         |
| ------------------- | ------------------------------------------- | --------------------------------------------------- |
| **Motion Provider** | `https://ui.edbn.me/r/motion-provider.json` | Global animation config with reduced motion support |
| **Animations**      | `https://ui.edbn.me/r/animations.json`      | Motion system with spring presets and transitions   |
| **Tokens**          | `https://ui.edbn.me/r/tokens.json`          | Design tokens for colors, spacing, typography       |
| **Icons**           | `https://ui.edbn.me/r/icons.json`           | Animated icons including loading spinners           |

#### Hooks

| Hook                     | Registry URL                                       | Description                                  |
| ------------------------ | -------------------------------------------------- | -------------------------------------------- |
| **useClickOutside**      | `https://ui.edbn.me/r/use-click-outside.json`      | Detect clicks outside an element             |
| **useControllableState** | `https://ui.edbn.me/r/use-controllable-state.json` | Handle controlled/uncontrolled state pattern |
| **useMergedRefs**        | `https://ui.edbn.me/r/use-merged-refs.json`        | Merge multiple refs into one                 |
| **useMobile**            | `https://ui.edbn.me/r/use-mobile.json`             | Detect mobile viewport                       |
| **useStableId**          | `https://ui.edbn.me/r/use-stable-id.json`          | Generate SSR-safe unique IDs                 |

> **Note:** All components automatically bundle their dependencies. You don't need to install motion-provider separately!

---

## Adding a New Component

### Step 1: Create the Registry Source File

Create your component in the registry folder structure:

```
registry/
└── new-york/
    └── [component-name]/
        └── [component-name].tsx
```

**Example:** `registry/new-york/my-component/my-component.tsx`

### Step 2: Update Import Paths

Convert all imports to registry-compatible paths:

```tsx
// ❌ Original (components/ui/button.tsx)
import { cn } from "@/lib/utils";
import { springPresets } from "@/lib/motion";
import { useShouldDisableAnimation } from "@/components/motion-provider";

// ✅ Registry version (registry/new-york/button/button.tsx)
import { cn } from "@/lib/utils"; // utils is a built-in shadcn dependency
import { springPresets } from "@/lib/motion"; // from motion-provider registry dep
import { useShouldDisableAnimation } from "@/components/motion-provider"; // from motion-provider
```

### Step 3: Add to registry.json

Add your component to the root `registry.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "edbn-ui",
  "homepage": "https://ui.edbn.me",
  "items": [
    // ... existing items
    {
      "name": "my-component",
      "type": "registry:ui",
      "title": "My Component",
      "description": "A brief description of your component.",
      "dependencies": ["motion", "@phosphor-icons/react"],
      "registryDependencies": ["utils", "motion-provider"],
      "files": [
        {
          "path": "registry/new-york/my-component/my-component.tsx",
          "type": "registry:ui"
        }
      ]
    }
  ]
}
```

### Step 4: Build the Registry

```bash
npm run registry:build
```

This generates JSON files in `public/r/`:

- `public/r/my-component.json`
- `public/r/registry.json` (index)

### Step 5: Test the Installation

```bash
# Start the dev server
npm run dev

# In another terminal, test installation
npx shadcn@latest add http://localhost:3000/r/my-component.json
```

---

## Component Types

| Type                 | Description       | Example               |
| -------------------- | ----------------- | --------------------- |
| `registry:ui`        | UI components     | button, alert-dialog  |
| `registry:component` | Non-UI components | motion-provider       |
| `registry:hook`      | React hooks       | use-click-outside     |
| `registry:lib`       | Utility libraries | icons, motion presets |

---

## Auto-Bundled Dependencies

**Important:** This registry automatically bundles custom dependencies to provide a seamless installation experience.

When you install a component like `button`, it automatically includes all required files:

- ✅ The button component itself
- ✅ Motion Provider (animation configuration)
- ✅ Icons library (loading spinners)
- ✅ All required hooks and utilities

**You don't need to install dependencies separately!** Just run one command and everything works.

### How It Works

The registry uses `inlineDependencies` in `scripts/update-registry.mjs`:

```javascript
'button': {
  dependencies: ['motion', '@phosphor-icons/react'],      // npm packages
  registryDependencies: ['utils'],                // official shadcn components
  inlineDependencies: ['motion-provider', 'icons'], // auto-bundled custom components
  files: [...]
}
```

When you run `node scripts/update-registry.mjs`, it automatically:

1. Reads the button component source
2. Finds motion-provider and icons in the registry
3. Bundles all their files into button.json
4. Generates the final registry file

This means **one command installs everything** - no manual dependency management required!

---

## Multi-File Components

For components with multiple files (like motion-provider):

```json
{
  "name": "motion-provider",
  "type": "registry:component",
  "files": [
    {
      "path": "registry/new-york/motion-provider/motion-provider.tsx",
      "type": "registry:component"
    },
    {
      "path": "registry/new-york/motion-provider/use-reduced-motion.ts",
      "type": "registry:hook"
    },
    {
      "path": "registry/new-york/motion-provider/use-low-power-device.ts",
      "type": "registry:hook"
    },
    {
      "path": "registry/new-york/motion-provider/motion.ts",
      "type": "registry:lib"
    }
  ]
}
```

---

## Dependencies

### npm Dependencies

External packages installed via npm:

```json
"dependencies": ["motion", "@radix-ui/react-dialog", "@phosphor-icons/react"]
```

### Registry Dependencies

Other registry items that will be auto-installed:

```json
"registryDependencies": ["utils", "motion-provider", "icons"]
```

**Built-in shadcn dependencies:**

- `utils` - The `cn()` function from `@/lib/utils`

**Custom registry dependencies:**

- `motion-provider` - Animation infrastructure (MotionProvider, hooks, presets)
- `icons` - Animated icon components
- `use-click-outside` - Click outside detection hook

---

## Documentation Updates

When adding a new component, update its docs page to use `InstallationTabs`:

```tsx
import { InstallationTabs } from "@/components/docs";

// In your docs page:
<InstallationTabs
  componentName="my-component"
  dependencies={["motion", "@phosphor-icons/react"]}
  registryDependencies={["motion-provider", "icons"]}
  importExample={`import { MyComponent } from "@/components/ui/my-component"`}
/>;
```

---

## File Structure Reference

```
ui.edbn.me/
├── registry.json                    # Main registry definition
├── registry/
│   └── new-york/
│       ├── motion-provider/
│       │   ├── motion-provider.tsx
│       │   ├── use-reduced-motion.ts
│       │   ├── use-low-power-device.ts
│       │   └── motion.ts
│       ├── icons/
│       │   └── icons.tsx
│       ├── use-click-outside/
│       │   └── use-click-outside.ts
│       ├── button/
│       │   └── button.tsx
│       ├── alert-dialog/
│       │   └── alert-dialog.tsx
│       ├── popover/
│       │   └── popover.tsx
│       └── dropdown-menu/
│           └── dropdown-menu.tsx
├── public/
│   └── r/                           # Generated JSON files
│       ├── registry.json
│       ├── button.json
│       ├── alert-dialog.json
│       └── ...
└── components/
    └── docs/
        └── installation-tabs.tsx    # Reusable installation UI
```

---

## Troubleshooting

### Build Fails

1. Check that all file paths in `registry.json` are correct
2. Ensure all imports use valid paths
3. Verify dependencies are listed correctly

### Component Not Found

1. Make sure `npm run registry:build` completed successfully
2. Check that the JSON file exists in `public/r/`
3. Verify the URL matches exactly (case-sensitive)

### Dependencies Not Installing

1. Verify `registryDependencies` includes all required items
2. Check that dependent components exist in the registry
3. Run build again after adding new dependencies

---

## Scripts

```bash
# Update registry JSON files (run after modifying components)
node scripts/update-registry.mjs

# Start dev server for testing
npm run dev

# Install component from local (for testing)
npx shadcn@latest add http://localhost:3000/r/[component].json

# Install component from production
npx shadcn@latest add https://ui.edbn.me/r/[component].json
```

### Registry Update Script

The `scripts/update-registry.mjs` script automatically:

1. Reads all component source files
2. Bundles inline dependencies
3. Generates JSON files in `public/r/`
4. Updates the main `registry.json`

**Run this script whenever you:**

- Add a new component
- Modify an existing component
- Change dependencies
- Update component metadata
