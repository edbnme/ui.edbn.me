import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

const isCI = !!process.env.CI;
const isGitHubActions = !!process.env.GITHUB_ACTIONS;

export default defineConfig({
  plugins: [react()],

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup/test-setup.ts"],

    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/coverage/**",
    ],

    coverage: {
      provider: "v8",
      reporter: isCI
        ? ["text", "json-summary", "lcov"]
        : ["text", "json-summary", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: [
        "components/ui/alert-dialog.tsx",
        "components/ui/button.tsx",
        "components/ui/dropdown-menu.tsx",
        "components/ui/popover.tsx",
        "components/ui/sheet.tsx",
      ],
      exclude: [
        "**/*.test.tsx",
        "**/*.spec.tsx",
        "**/index.ts",
        "**/__tests__/**",
        "**/node_modules/**",
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
      skipFull: false,
      clean: true,
    },

    reporters: isGitHubActions
      ? ["default", "github-actions", "json"]
      : ["default"],
    outputFile: isCI ? { json: "./test-results.json" } : undefined,

    // Vitest 4 configuration
    maxWorkers: isCI ? 2 : undefined,
    isolate: false,
    testTimeout: 5000,
    hookTimeout: 5000,
    bail: isCI ? 1 : 0,
    sequence: { shuffle: false },
    watch: false,
  },

  resolve: {
    alias: {
      "@/test": path.resolve(__dirname, "./src/__tests__"),
      "@/components": path.resolve(__dirname, "./components"),
      "@/src/components": path.resolve(__dirname, "./src/components"),
      "@/lib": path.resolve(__dirname, "./lib"),
      "@/hooks": path.resolve(__dirname, "./hooks"),
      "@": path.resolve(__dirname, "./"),
    },
  },
});
