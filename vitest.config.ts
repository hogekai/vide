import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,js}"],
    exclude: ["tests/e2e/**"],
    setupFiles: ["vitest.setup.ts"],
  },
});
