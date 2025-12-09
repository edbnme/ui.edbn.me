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
    description: 'Animated modal dialog with morphing animations and focus trap.',
    dependencies: ['motion', 'lucide-react', 'tw-animate-css'],
    registryDependencies: ['utils'],
    inlineDependencies: ['motion-provider'],
    files: [
      { path: 'components/ui/alert-dialog.tsx', type: 'registry:ui' }
    ]
  },
  'popover': {
    type: 'registry:ui',
    title: 'Popover',
    description: 'Animated popover component with morphing transitions and click-outside handling.',
    dependencies: ['motion', 'tw-animate-css'],
    registryDependencies: ['utils'],
    inlineDependencies: [],
    files: [
      { path: 'hooks/useClickOutside.tsx', type: 'registry:hook' },
      { path: 'components/ui/popover.tsx', type: 'registry:ui' }
    ]
  },
  'dropdown-menu': {
    type: 'registry:ui',
    title: 'Dropdown Menu',
    description: 'Animated dropdown menu with smooth spring animations and staggered item reveals.',
    dependencies: ['@radix-ui/react-dropdown-menu', 'motion', 'lucide-react', 'tw-animate-css'],
    registryDependencies: ['utils'],
    inlineDependencies: ['motion-provider'],
    files: [
      { path: 'components/ui/dropdown-menu.tsx', type: 'registry:ui' }
    ]
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
