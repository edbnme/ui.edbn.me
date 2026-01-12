# Changelog

All notable changes to **edbn/ui** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-01-03

### Added

- Professional versioning with semantic versioning (SemVer)
- Comprehensive CHANGELOG documentation
- Package metadata (author, license, repository, keywords)

### Changed

- **Breaking:** All file names now follow kebab-case convention
  - Hooks: `useStableId.ts` → `use-stable-id.ts`
  - Components: `MotionProvider.tsx` → `motion-provider.tsx`
- Updated all import paths to match new file names
- Registry script updated for new file structure
- Documentation code examples updated with new import paths

### Hooks Renamed

| Old Name                  | New Name                    |
| ------------------------- | --------------------------- |
| `useClickOutside.tsx`     | `use-click-outside.tsx`     |
| `useControllableState.ts` | `use-controllable-state.ts` |
| `useFocusTrap.ts`         | `use-focus-trap.ts`         |
| `useLowPowerDevice.ts`    | `use-low-power-device.ts`   |
| `useMergedRefs.ts`        | `use-merged-refs.ts`        |
| `usePreventScroll.ts`     | `use-prevent-scroll.ts`     |
| `useReducedMotion.ts`     | `use-reduced-motion.ts`     |
| `useStableId.ts`          | `use-stable-id.ts`          |

### Components Renamed

| Old Name                | New Name                 |
| ----------------------- | ------------------------ |
| `ColorBends.tsx`        | `color-bends.tsx`        |
| `ComponentShowcase.tsx` | `component-showcase.tsx` |
| `FloatingNav.tsx`       | `floating-nav.tsx`       |
| `Footer.tsx`            | `footer.tsx`             |
| `ModeToggle.tsx`        | `mode-toggle.tsx`        |
| `MotionProvider.tsx`    | `motion-provider.tsx`    |
| `Preloader.tsx`         | `preloader.tsx`          |
| `ThemeProvider.tsx`     | `theme-provider.tsx`     |

### Migration Guide

If you're upgrading from 0.1.x, update your imports:

```tsx
// Before
import { useShouldDisableAnimation } from "@/components/MotionProvider";
import { useStableId } from "@/hooks/useStableId";

// After
import { useShouldDisableAnimation } from "@/components/motion-provider";
import { useStableId } from "@/hooks/use-stable-id";
```

## [0.1.0] - 2025-12-XX

### Added

- Initial release of edbn/ui component library
- Core UI components: Button, Alert Dialog, Popover, Dropdown Menu, Sheet
- Motion system with spring animations
- MotionProvider for global animation configuration
- Accessibility-first design with ARIA support
- Custom hooks for common patterns:
  - `useClickOutside` - Click outside detection
  - `useControllableState` - Controlled/uncontrolled pattern
  - `useFocusTrap` - Focus management for modals
  - `useLowPowerDevice` - Device capability detection
  - `useMergedRefs` - Ref composition
  - `usePreventScroll` - Scroll locking
  - `useReducedMotion` - Motion preference detection
  - `useStableId` - SSR-safe ID generation
- Registry system for shadcn-compatible distribution
- Full TypeScript support
- Tailwind CSS v4 integration

---

[Unreleased]: https://github.com/edbnme/ui.edbn.me/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/edbnme/ui.edbn.me/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/edbnme/ui.edbn.me/releases/tag/v0.1.0
