import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "vast/index": "src/vast/index.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  minify: true,
  treeshake: true,
  splitting: true,
  target: "es2022",
  outExtension: () => ({ js: ".mjs" }),
});
