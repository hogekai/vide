import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    test: {
      name: "unit",
      environment: "jsdom",
      exclude: ["tests/e2e/**", "tests/svelte/**", "node_modules/**"],
      setupFiles: ["vitest.setup.ts"],
    },
  },
  {
    plugins: [svelte({ hot: false }), svelteTesting({ autoCleanup: false })],
    test: {
      name: "svelte",
      environment: "jsdom",
      include: ["tests/svelte/**/*.test.ts"],
      setupFiles: ["vitest.setup.svelte.ts"],
    },
  },
]);
