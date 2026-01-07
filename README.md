# edbn/ui

[![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)](https://github.com/kewonit/ui.edbn.me/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE.md)

A collection of React components with smooth animations and careful attention to detail. Built with Next.js 16, Tailwind CSS v4, and Motion.

These aren't just demos, they're meant to be copied into your project and customized.

## What's here

- React components in `components/ui/`
- Hooks for common patterns (kebab-case naming: `use-stable-id.ts`)
- Motion presets and utilities
- Registry for installing via shadcn CLI

## Installation

Install components one at a time:

```bash
npx shadcn@latest add https://ui.edbn.me/r/button.json
```

Or copy the code directly from `components/ui/`.

## License

Free for personal and open source projects. Commercial use requires a license. See [LICENSE.md](LICENSE.md).

## Docs

See [ui.edbn.me](https://ui.edbn.me) for examples and API docs.

## Contributing

Pull requests welcome. Check [CONTRIBUTING.md](CONTRIBUTING.md) first.

## Security

For security policy and reporting vulnerabilities, please see [SECURITY.md](SECURITY.md).

## Development

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run test     # Run tests
```

After changing components, rebuild the registry:

```bash
node scripts/update-registry.mjs
```

## Stack

Next.js 16, React 19, Tailwind CSS v4, Radix UI, Motion (framer-motion fork), Vitest.

## Issues

Bugs? Ideas? [Open an issue](https://github.com/edbnme/ui.edbn.me/issues).

---
