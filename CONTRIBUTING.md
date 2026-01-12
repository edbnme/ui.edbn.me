# Contributing

Thanks for considering contributing to ui.edbn.me.

## Setup

```bash
git clone https://github.com/YOUR_USERNAME/ui.edbn.me.git
cd ui.edbn.me
npm install
npm run dev
```

## Before you start

Open an issue first if you're planning to add a new component or make significant changes. This helps avoid wasted effort.

## Component guidelines

- Use TypeScript
- Build on Radix UI primitives when possible
- Use motion presets from `lib/motion.ts` (no hardcoded spring values)
- Support both light and dark themes
- Test on mobile and desktop
- Include proper ARIA attributes

Example structure:

```tsx
"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { springPresets } from "@/lib/motion";

const MyComponent = React.forwardRef<HTMLDivElement, Props>(
  ({ className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn("base-styles", className)}
        transition={springPresets.snappy}
        {...props}
      />
    );
  },
);
MyComponent.displayName = "MyComponent";

export { MyComponent };
```

## Registry

After adding or modifying a component:

1. Update `scripts/update-registry.mjs`
2. Run `node scripts/update-registry.mjs`

## Tests

Write tests for new components:

```tsx
import { render, screen } from "@testing-library/react";
import { MyComponent } from "@/components/ui/my-component";

describe("MyComponent", () => {
  it("renders", () => {
    render(<MyComponent>Hello</MyComponent>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

Run tests before committing:

```bash
npm run test
npm run lint
```

## Pull requests

- Keep PRs focused on a single change
- Write clear commit messages
- Update docs if needed
- Make sure tests pass

## Questions?

Open an issue or check existing discussions.
