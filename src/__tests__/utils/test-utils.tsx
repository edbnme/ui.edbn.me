/**
 * =============================================================================
 * TEST UTILITIES
 * =============================================================================
 *
 * Custom render function and helper utilities for testing React components.
 *
 * This module provides:
 * - Custom render function with automatic user event setup
 * - Keyboard interaction helpers (pressEscape, pressTab, etc.)
 * - Wait utilities for animations
 * - Focus management helpers
 *
 * @module test-utils
 * @example
 * ```tsx
 * import { render, screen, pressEscape } from "@/test/utils/test-utils";
 *
 * it("should close on escape", async () => {
 *   const { user } = render(<Dialog open />);
 *   await pressEscape(user);
 *   expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
 * });
 * ```
 * =============================================================================
 */

import { render, RenderOptions, screen, within } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { ReactElement, ReactNode } from "react";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Extended render result with user event instance
 */
export interface CustomRenderResult extends ReturnType<typeof render> {
  /** User event instance for simulating user interactions */
  user: UserEvent;
}

/**
 * Custom render options
 */
export type CustomRenderOptions = Omit<RenderOptions, "wrapper">;

// =============================================================================
// WRAPPER COMPONENT
// =============================================================================

/**
 * Simple wrapper component for tests
 *
 * This provides a minimal wrapper without external providers to avoid
 * import issues in tests. Add providers here if needed for all tests.
 *
 * @example
 * // To add a theme provider:
 * function TestWrapper({ children }: { children: ReactNode }) {
 *   return (
 *     <ThemeProvider>
 *       {children}
 *     </ThemeProvider>
 *   );
 * }
 */
function TestWrapper({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// =============================================================================
// CUSTOM RENDER
// =============================================================================

/**
 * Custom render function with automatic user event setup
 *
 * This wraps React Testing Library's render function to automatically
 * set up userEvent, which is needed for simulating user interactions.
 *
 * @param ui - The React element to render
 * @param options - Optional render options
 * @returns Render result with user event instance
 *
 * @example
 * ```tsx
 * const { user } = render(<Button onClick={onClick}>Click me</Button>);
 * await user.click(screen.getByRole("button"));
 * expect(onClick).toHaveBeenCalled();
 * ```
 */
export function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions,
): CustomRenderResult {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: TestWrapper, ...options }),
  };
}

// =============================================================================
// KEYBOARD HELPERS
// =============================================================================

/**
 * Simulate pressing the Escape key
 *
 * @param user - User event instance from render result
 *
 * @example
 * ```tsx
 * const { user } = render(<Dialog open />);
 * await pressEscape(user);
 * ```
 */
export async function pressEscape(user: UserEvent): Promise<void> {
  await user.keyboard("{Escape}");
}

/**
 * Simulate pressing the Tab key
 *
 * @param user - User event instance from render result
 *
 * @example
 * ```tsx
 * const { user } = render(<Form />);
 * await pressTab(user);
 * expect(document.activeElement).toBe(screen.getByRole("textbox"));
 * ```
 */
export async function pressTab(user: UserEvent): Promise<void> {
  await user.keyboard("{Tab}");
}

/**
 * Simulate pressing Shift+Tab (reverse tab)
 *
 * @param user - User event instance from render result
 */
export async function pressShiftTab(user: UserEvent): Promise<void> {
  await user.keyboard("{Shift>}{Tab}{/Shift}");
}

/**
 * Simulate pressing the Enter key
 *
 * @param user - User event instance from render result
 *
 * @example
 * ```tsx
 * const { user } = render(<Button>Submit</Button>);
 * screen.getByRole("button").focus();
 * await pressEnter(user);
 * ```
 */
export async function pressEnter(user: UserEvent): Promise<void> {
  await user.keyboard("{Enter}");
}

/**
 * Simulate pressing the Space key
 *
 * @param user - User event instance from render result
 */
export async function pressSpace(user: UserEvent): Promise<void> {
  await user.keyboard(" ");
}

/**
 * Simulate pressing the Arrow Down key
 *
 * @param user - User event instance from render result
 */
export async function pressArrowDown(user: UserEvent): Promise<void> {
  await user.keyboard("{ArrowDown}");
}

/**
 * Simulate pressing the Arrow Up key
 *
 * @param user - User event instance from render result
 */
export async function pressArrowUp(user: UserEvent): Promise<void> {
  await user.keyboard("{ArrowUp}");
}

/**
 * Simulate pressing the Arrow Left key
 *
 * @param user - User event instance from render result
 */
export async function pressArrowLeft(user: UserEvent): Promise<void> {
  await user.keyboard("{ArrowLeft}");
}

/**
 * Simulate pressing the Arrow Right key
 *
 * @param user - User event instance from render result
 */
export async function pressArrowRight(user: UserEvent): Promise<void> {
  await user.keyboard("{ArrowRight}");
}

/**
 * Simulate pressing the Home key
 *
 * @param user - User event instance from render result
 */
export async function pressHome(user: UserEvent): Promise<void> {
  await user.keyboard("{Home}");
}

/**
 * Simulate pressing the End key
 *
 * @param user - User event instance from render result
 */
export async function pressEnd(user: UserEvent): Promise<void> {
  await user.keyboard("{End}");
}

// =============================================================================
// WAIT UTILITIES
// =============================================================================

/**
 * Wait for a specified duration
 *
 * Use sparingly - prefer waitFor or findBy queries instead.
 * This is useful for waiting for animations to complete.
 *
 * @param ms - Duration in milliseconds (default: 100)
 *
 * @example
 * ```tsx
 * await waitForAnimation(); // Wait 100ms
 * await waitForAnimation(300); // Wait 300ms for longer animation
 * ```
 */
export async function waitForAnimation(ms: number = 100): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

// =============================================================================
// FOCUS HELPERS
// =============================================================================

/**
 * Check if an element contains the currently focused element
 *
 * @param element - The container element to check
 * @returns True if the element or a descendant has focus
 *
 * @example
 * ```tsx
 * const dialog = screen.getByRole("dialog");
 * expect(hasFocusWithin(dialog)).toBe(true);
 * ```
 */
export function hasFocusWithin(element: HTMLElement): boolean {
  return element.contains(document.activeElement);
}

/**
 * Get the currently focused element
 *
 * @returns The currently focused element or null
 */
export function getFocusedElement(): Element | null {
  return document.activeElement;
}

// =============================================================================
// ACCESSIBILITY HELPERS
// =============================================================================

/**
 * Check if an element is visible to screen readers
 *
 * @param element - The element to check
 * @returns True if the element is visible to assistive technologies
 */
export function isAccessible(element: HTMLElement): boolean {
  return !(
    element.hasAttribute("aria-hidden") &&
    element.getAttribute("aria-hidden") === "true"
  );
}

/**
 * Get all elements with a specific ARIA role
 *
 * @param role - The ARIA role to search for
 * @returns Array of elements with the specified role
 */
export function getByAriaRole(role: string): HTMLElement[] {
  return Array.from(document.querySelectorAll(`[role="${role}"]`));
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

// Re-export everything from React Testing Library
export * from "@testing-library/react";

// Export custom render as default render
export { customRender as render };

// Export user event and common utilities
export { userEvent, screen, within };
