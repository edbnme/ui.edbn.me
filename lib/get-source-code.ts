/**
 * =============================================================================
 * SOURCE CODE READER
 * =============================================================================
 *
 * Server-side utility to read component source files at build time.
 * This eliminates the need to maintain duplicate copies of component code
 * in documentation pages.
 *
 * Usage in Server Components:
 * ```tsx
 * import { getComponentSource } from "@/lib/get-source-code";
 *
 * export default async function Page() {
 *   const buttonSource = await getComponentSource("button");
 *   return <SourceCode code={buttonSource} />;
 * }
 * ```
 *
 * @module lib/get-source-code
 * =============================================================================
 */

import { promises as fs } from "fs";
import path from "path";

/**
 * Component source file mapping
 * Maps component names to their file paths relative to components/ui
 */
const COMPONENT_FILES: Record<string, string> = {
  button: "button.tsx",
  "alert-dialog": "alert-dialog.tsx",
  "dropdown-menu": "dropdown-menu.tsx",
  popover: "popover.tsx",
  sheet: "sheet.tsx",
  input: "input.tsx",
  separator: "separator.tsx",
  sidebar: "sidebar.tsx",
  skeleton: "skeleton.tsx",
  tooltip: "tooltip.tsx",
};

/**
 * Gets the absolute path to the components/ui directory
 */
function getComponentsDir(): string {
  return path.join(process.cwd(), "components", "ui");
}

/**
 * Reads the source code of a UI component
 *
 * @param componentName - The name of the component (e.g., "button", "alert-dialog")
 * @returns The source code as a string
 * @throws Error if component not found or file read fails
 *
 * @example
 * ```tsx
 * // In a Server Component
 * const source = await getComponentSource("button");
 * ```
 */
export async function getComponentSource(
  componentName: string
): Promise<string> {
  const fileName = COMPONENT_FILES[componentName];

  if (!fileName) {
    throw new Error(
      `Unknown component: ${componentName}. Available: ${Object.keys(COMPONENT_FILES).join(", ")}`
    );
  }

  const filePath = path.join(getComponentsDir(), fileName);

  try {
    const content = await fs.readFile(filePath, "utf-8");
    return content;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`Component file not found: ${filePath}`);
    }
    throw error;
  }
}

/**
 * Reads the source code of any file in the project
 *
 * @param relativePath - Path relative to project root
 * @returns The source code as a string
 *
 * @example
 * ```tsx
 * const source = await getFileSource("lib/motion.ts");
 * ```
 */
export async function getFileSource(relativePath: string): Promise<string> {
  const filePath = path.join(process.cwd(), relativePath);

  try {
    const content = await fs.readFile(filePath, "utf-8");
    return content;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`File not found: ${filePath}`);
    }
    throw error;
  }
}

/**
 * Gets all available component names
 */
export function getAvailableComponents(): string[] {
  return Object.keys(COMPONENT_FILES);
}

/**
 * Checks if a component exists
 */
export function hasComponent(componentName: string): boolean {
  return componentName in COMPONENT_FILES;
}
