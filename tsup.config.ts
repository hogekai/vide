import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "vast/index": "src/vast/index.ts",
    "vmap/index": "src/vmap/index.ts",
    "omid/index": "src/omid/index.ts",
    "simid/index": "src/simid/index.ts",
    "hls/index": "src/hls/index.ts",
    "dash/index": "src/dash/index.ts",
    "ui/index": "src/ui/index.ts",
  },
  onSuccess: "mkdir -p dist/ui && cp src/ui/theme.css dist/ui/theme.css",
  external: ["hls.js", "dashjs"],
  format: ["esm"],
  dts: true,
  clean: true,
  minify: true,
  treeshake: true,
  splitting: true,
  target: "es2022",
  outExtension: () => ({ js: ".mjs" }),
});
