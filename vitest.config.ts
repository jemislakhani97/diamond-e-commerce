import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Vitest reads tsconfig paths only when told to. Mirror the `@/*` alias from
 * tsconfig.json so route/component tests can import `@/lib/...`.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    environment: "node",
  },
});
