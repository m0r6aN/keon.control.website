import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Statically replace NODE_ENV so React and react-dom load their dev/test builds.
  // This ensures React.act is available for @testing-library/react to use.
  define: {
    "process.env.NODE_ENV": JSON.stringify("test"),
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    css: false,
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: "./coverage",
      include: [
        "src/lib/**/*.ts",
        "src/lib/**/*.tsx",
        "src/hooks/**/*.ts",
        "src/hooks/**/*.tsx",
        "src/app/api/control/**/*.ts",
      ],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.md",
        "src/lib/types.ts",
        "src/lib/api/types.ts",
        "src/lib/contracts/**/*.ts",
      ],
    },
  },
  resolve: {
    // Load development builds of packages in test. React 19's production build
    // removes React.act (it only ships in dev/test builds), and @testing-library/react
    // falls back to react-dom/test-utils which also needs React.act. Loading
    // development builds makes act available on both React and react-dom/test-utils.
    conditions: ["development", "browser", "module", "import", "default"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
