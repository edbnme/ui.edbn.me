/**
 * =============================================================================
 * VITEST CONFIGURATION
 * =============================================================================
 *
 * This configuration sets up Vitest for testing React components in the UI library.
 *
 * Test file patterns:
 * - Test files: .test.{ts,tsx} or .spec.{ts,tsx}
 *
 * @see https://vitest.dev/config/
 * =============================================================================
 */

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  
  test: {
    // =========================================================================
    // ENVIRONMENT
    // =========================================================================
    
    /**
     * Use jsdom for DOM simulation
     * This provides browser-like APIs (document, window, etc.)
     */
    environment: "jsdom",
    
    /**
     * Make test utilities globally available (describe, it, expect, etc.)
     */
    globals: true,
    
    /**
     * Setup files run before each test file
     * These configure mocks, extend matchers, and set up test utilities
     */
    setupFiles: ["./src/__tests__/setup/test-setup.ts"],
    
    // =========================================================================
    // TEST FILES
    // =========================================================================
    
    /**
     * Include patterns for test files
     * Supports both .test.tsx and .spec.tsx patterns
     */
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
    ],
    
    /**
     * Exclude patterns - skip these directories
     */
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/coverage/**",
    ],
    
    // =========================================================================
    // COVERAGE
    // =========================================================================
    
    coverage: {
      /**
       * Use V8 coverage provider (faster than Istanbul, lower overhead)
       */
      provider: "v8",
      
      /**
       * Coverage reporters:
       * - text: Console output (minimal in CI)
       * - json-summary: Summary JSON for CI tools (lightweight)
       * - lcov: For Codecov integration
       * HTML reporter only generated in local development
       */
      reporter: process.env.CI 
        ? ["text", "json-summary", "lcov"]
        : ["text", "json-summary", "html", "lcov"],
      
      /**
       * Output directory for coverage reports
       */
      reportsDirectory: "./coverage",
      
      /**
       * Files to include in coverage
       * Only measure UI components that have tests
       */
      include: [
        "components/ui/alert-dialog.tsx",
        "components/ui/button.tsx",
        "components/ui/dropdown-menu.tsx",
        "components/ui/popover.tsx",
        "components/ui/sheet.tsx",
      ],
      
      /**
       * Exclude from coverage measurement
       */
      exclude: [
        "**/*.test.tsx",
        "**/*.spec.tsx",
        "**/index.ts",
        "**/__tests__/**",
        "**/node_modules/**",
      ],
      
      /**
       * Coverage thresholds - realistic targets for quality
       * 
       * Note: Some edge cases like portal interactions and async callbacks
       * are difficult to test in jsdom. Targets balanced for quality with
       * practicality given jsdom limitations with portals and motion.
       */
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
      
      /**
       * Skip files with no executable code
       */
      skipFull: false,
      
      /**
       * Clean coverage directory before running
       */
      clean: true,
      
      /**
       * All files included in coverage should be covered
       */
      all: true,
    },
    
    // =========================================================================
    // REPORTERS
    // =========================================================================
    
    /**
     * Use minimal reporters in CI for cleaner output
     * GitHub Actions reporter adds inline annotations for failures
     */
    reporters: process.env.GITHUB_ACTIONS 
      ? ["default", "github-actions"]
      : ["default"],
    
    /**
     * Output file for JSON reporter (used in CI for artifacts)
     */
    outputFile: process.env.CI ? {
      json: "./test-results.json",
    } : undefined,
    
    // =========================================================================
    // PERFORMANCE OPTIMIZATION
    // =========================================================================
    
    /**
     * Run tests in parallel using worker threads
     * Optimal for CPU-bound test execution
     */
    pool: "threads",
    
    /**
     * Pool options for better performance
     * Dynamically adjust based on CI environment
     */
    poolOptions: {
      threads: {
        singleThread: false,
        // Use environment variables or sensible defaults
        minThreads: process.env.VITEST_MIN_THREADS 
          ? parseInt(process.env.VITEST_MIN_THREADS) 
          : 1,
        maxThreads: process.env.VITEST_MAX_THREADS 
          ? parseInt(process.env.VITEST_MAX_THREADS) 
          : undefined,
      },
    },
    
    /**
     * Disable test isolation for faster execution
     * Only safe if tests properly clean up after themselves
     * Our tests use proper setup/teardown, so this is safe
     */
    isolate: false,
    
    /**
     * Timeout for individual tests (ms)
     * Reduced from 10s to 5s for faster failure detection
     */
    testTimeout: 5000,
    
    /**
     * Timeout for hooks (beforeEach, afterEach, etc.)
     */
    hookTimeout: 5000,
    
    /**
     * Bail on first test failure in CI for faster feedback
     */
    bail: process.env.CI ? 1 : 0,
    
    // =========================================================================
    // WATCH MODE
    // =========================================================================
    
    /**
     * Watch mode configuration
     */
    watch: false,
    
    /**
     * Files that trigger re-runs when changed
     */
    watchExclude: ["**/node_modules/**", "**/dist/**", "**/coverage/**"],
  },
  
  // ===========================================================================
  // PATH RESOLUTION
  // ===========================================================================
  
  resolve: {
    /**
     * Path aliases matching tsconfig.json
     * Note: For test files in src/, we need precise aliases
     */
    alias: {
      // Test utilities
      "@/test": path.resolve(__dirname, "./src/__tests__"),
      
      // Component imports
      "@/components": path.resolve(__dirname, "./components"),
      "@/src/components": path.resolve(__dirname, "./src/components"),
      
      // Other paths
      "@/lib": path.resolve(__dirname, "./lib"),
      "@/hooks": path.resolve(__dirname, "./hooks"),
      
      // Root alias (must be last to avoid shadowing specific paths)
      "@": path.resolve(__dirname, "./"),
    },
  },
});
