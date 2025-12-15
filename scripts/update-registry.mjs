import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

// Component registry configuration
const components = {
  'button': {
    type: 'registry:ui',
    title: 'Button',
    description: 'Animated button component with press feedback, loading states, and icon support.',
    dependencies: ['@radix-ui/react-slot', 'class-variance-authority', 'motion', 'lucide-react', 'tw-animate-css'],
    registryDependencies: ['utils'],
    inlineDependencies: ['motion-provider', 'icons'],
    files: [
      { path: 'components/ui/button.tsx', type: 'registry:ui' }
    ]
  },
  'alert-dialog': {
    type: 'registry:ui',
    title: 'Alert Dialog',
    description: 'Animated modal dialog with morphing animations, focus trap, and controlled/uncontrolled state.',
    dependencies: ['motion', 'lucide-react', 'tw-animate-css'],
    registryDependencies: ['utils', 'button'],
    inlineDependencies: ['motion-provider', 'animations', 'tokens', 'use-stable-id', 'use-controllable-state'],
    files: [
      { path: 'components/ui/alert-dialog.tsx', type: 'registry:ui' }
    ],
    cssVars: true,
    tailwind: {
      config: {}
    }
  },
  'popover': {
    type: 'registry:ui',
    title: 'Popover',
    description: 'Animated popover component with morphing transitions, focus trap, and click-outside handling.',
    dependencies: ['motion', 'tw-animate-css'],
    registryDependencies: ['utils'],
    inlineDependencies: ['motion-provider', 'animations', 'tokens', 'use-stable-id', 'use-controllable-state', 'use-click-outside'],
    files: [
      { path: 'components/ui/popover.tsx', type: 'registry:ui' }
    ],
    cssVars: true,
    tailwind: {
      config: {}
    }
  },
  'dropdown-menu': {
    type: 'registry:ui',
    title: 'Dropdown Menu',
    description: 'Animated dropdown menu with smooth spring animations and staggered item reveals.',
    dependencies: ['@radix-ui/react-dropdown-menu', 'motion', 'lucide-react', 'tw-animate-css'],
    registryDependencies: ['utils'],
    inlineDependencies: ['motion-provider', 'animations', 'tokens'],
    files: [
      { path: 'components/ui/dropdown-menu.tsx', type: 'registry:ui' }
    ],
    cssVars: true,
    tailwind: {
      config: {}
    }
  },
  'motion-provider': {
    type: 'registry:component',
    title: 'Motion Provider',
    description: 'Global animation configuration provider with reduced motion and low-power device detection.',
    dependencies: ['motion', 'tw-animate-css'],
    registryDependencies: [],
    inlineDependencies: [],
    files: [
      { path: 'components/MotionProvider.tsx', type: 'registry:component' },
      { path: 'hooks/useReducedMotion.ts', type: 'registry:hook' },
      { path: 'hooks/useLowPowerDevice.ts', type: 'registry:hook' },
      { path: 'lib/motion.ts', type: 'registry:lib' }
    ]
  },
  'animations': {
    type: 'registry:lib',
    title: 'Animations',
    description: 'Motion system with spring presets, transitions, and variant factories.',
    dependencies: ['motion', 'tw-animate-css'],
    registryDependencies: [],
    inlineDependencies: [],
    files: [
      { path: 'lib/animations.ts', type: 'registry:lib' }
    ]
  },
  'tokens': {
    type: 'registry:lib',
    title: 'Design Tokens',
    description: 'Centralized design tokens for colors, spacing, typography, shadows, and more.',
    dependencies: [],
    registryDependencies: [],
    inlineDependencies: [],
    files: [
      { path: 'lib/tokens.ts', type: 'registry:lib' }
    ]
  },
  'icons': {
    type: 'registry:lib',
    title: 'Animated Icons',
    description: 'Animated icon components including loading spinners, morphing icons, and close buttons.',
    dependencies: ['motion', 'lucide-react', 'tw-animate-css'],
    registryDependencies: ['utils'],
    inlineDependencies: ['motion-provider'],
    files: [
      { path: 'lib/icons.tsx', type: 'registry:lib' }
    ]
  },
  'use-click-outside': {
    type: 'registry:hook',
    title: 'useClickOutside',
    description: 'Hook to detect clicks outside a referenced element.',
    dependencies: [],
    registryDependencies: [],
    inlineDependencies: [],
    files: [
      { path: 'hooks/useClickOutside.tsx', type: 'registry:hook' }
    ]
  },
  'use-stable-id': {
    type: 'registry:hook',
    title: 'useStableId',
    description: 'SSR-safe hook for generating stable unique IDs for accessibility attributes.',
    dependencies: [],
    registryDependencies: [],
    inlineDependencies: [],
    files: [
      { path: 'hooks/useStableId.ts', type: 'registry:hook' }
    ]
  },
  'use-controllable-state': {
    type: 'registry:hook',
    title: 'useControllableState',
    description: 'Hook for handling controlled/uncontrolled state pattern in components.',
    dependencies: [],
    registryDependencies: [],
    inlineDependencies: [],
    files: [
      { path: 'hooks/useControllableState.ts', type: 'registry:hook' }
    ]
  },
  'use-merged-refs': {
    type: 'registry:hook',
    title: 'useMergedRefs',
    description: 'Hook to merge multiple refs into a single callback ref.',
    dependencies: [],
    registryDependencies: [],
    inlineDependencies: [],
    files: [
      { path: 'hooks/useMergedRefs.ts', type: 'registry:hook' }
    ]
  }
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
    config.inlineDependencies.forEach(depName => {
      const depConfig = components[depName];
      if (depConfig) {
        allFiles.push(...depConfig.files);
      }
    });
  }

  const registryItem = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name,
    type: config.type,
    title: config.title,
    description: config.description,
    dependencies: config.dependencies,
    registryDependencies: config.registryDependencies,
    files: allFiles.map(file => {
      const fullPath = join(root, file.path);
      const content = readFileSync(fullPath, 'utf-8');
      return {
        path: file.path,
        content: escapeContent(content),
        type: file.type
      };
    })
  };
  
  // Add CSS vars configuration if present
  if (config.cssVars) {
    registryItem.cssVars = {
      light: {
        background: "0 0% 100%",
        foreground: "0 0% 9%",
        card: "0 0% 100%",
        "card-foreground": "0 0% 9%",
        popover: "0 0% 100%",
        "popover-foreground": "0 0% 9%",
        primary: "0 0% 12.5%",
        "primary-foreground": "0 0% 97%",
        secondary: "0 0% 96%",
        "secondary-foreground": "0 0% 12.5%",
        muted: "0 0% 96%",
        "muted-foreground": "0 0% 45%",
        accent: "0 0% 96%",
        "accent-foreground": "0 0% 12.5%",
        destructive: "0 84% 60%",
        "destructive-foreground": "0 0% 98%",
        border: "0 0% 90%",
        input: "0 0% 90%",
        ring: "0 0% 60%",
        radius: "0.75rem"
      },
      dark: {
        background: "0 0% 9%",
        foreground: "0 0% 97%",
        card: "0 0% 12.5%",
        "card-foreground": "0 0% 97%",
        popover: "0 0% 12.5%",
        "popover-foreground": "0 0% 97%",
        primary: "0 0% 90%",
        "primary-foreground": "0 0% 12.5%",
        secondary: "0 0% 18%",
        "secondary-foreground": "0 0% 97%",
        muted: "0 0% 18%",
        "muted-foreground": "0 0% 60%",
        accent: "0 0% 18%",
        "accent-foreground": "0 0% 97%",
        destructive: "0 62% 50%",
        "destructive-foreground": "0 0% 98%",
        border: "0 0% 18%",
        input: "0 0% 20%",
        ring: "0 0% 45%"
      }
    };
  }
  
  // Add tailwind configuration if present
  if (config.tailwind) {
    registryItem.tailwind = {
      config: {
        theme: {
          extend: {
            fontFamily: {
              sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif"]
            }
          }
        }
      }
    };
  }

  const outputPath = join(root, 'public', 'r', `${name}.json`);
  writeFileSync(outputPath, JSON.stringify(registryItem, null, 2), 'utf-8');
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
    files: config.files.map(f => ({ path: f.path, type: f.type }))
  }));

  const registry = {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: 'edbn-ui',
    homepage: 'https://ui.edbn.me',
    items
  };

  const registryPath = join(root, 'registry.json');
  writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf-8');
  console.log('✅ Updated registry.json');

  const publicRegistryPath = join(root, 'public', 'r', 'registry.json');
  writeFileSync(publicRegistryPath, JSON.stringify(registry, null, 2), 'utf-8');
  console.log('✅ Updated public/r/registry.json');
}

// Main execution
console.log('🔄 Updating registry files...\n');

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
  console.error('❌ Failed to update main registry:', error.message);
}

console.log('\n✨ Registry update complete!');
