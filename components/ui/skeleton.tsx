/**
 * Skeleton Component
 *
 * A loading placeholder component with pulse animation for content loading states.
 * Use to indicate loading content while maintaining layout structure.
 *
 * @packageDocumentation
 */

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

Skeleton.displayName = "Skeleton";

export { Skeleton };
