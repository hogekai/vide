import { resolve } from "node:path";
import { defineConfig, type Options } from "tsup";
import type { Plugin as EsbuildPlugin } from "esbuild";

// ── ESM build (existing, unchanged) ──────────────────────────────
const esmConfig: Options = {
	entry: {
		index: "src/index.ts",
		"vast/index": "src/vast/index.ts",
		"vmap/index": "src/vmap/index.ts",
		"omid/index": "src/omid/index.ts",
		"simid/index": "src/simid/index.ts",
		"vpaid/index": "src/vpaid/index.ts",
		"hls/index": "src/hls/index.ts",
		"dash/index": "src/dash/index.ts",
		"drm/index": "src/drm/index.ts",
		"ssai/index": "src/ssai/index.ts",
		"ui/index": "src/ui/index.ts",
		"react/index": "src/react/index.ts",
		"vue/index": "src/vue/index.ts",
	},
	onSuccess:
		"mkdir -p dist/ui && cp src/ui/theme.css dist/ui/theme.css && cp src/ui/theme.css dist/vide.ui.css && for f in dist/index.mjs dist/*/index.mjs; do d=$(dirname $f); cp $f $d/index.js; done",
	external: ["hls.js", "dashjs", "react", "react-dom", "react/jsx-runtime", "vue", "svelte"],
	esbuildOptions(options) {
		options.jsx = "automatic";
	},
	format: ["esm"],
	dts: true,
	clean: true,
	minify: true,
	treeshake: true,
	splitting: true,
	target: "es2022",
	outExtension: () => ({ js: ".mjs" }),
};

// ── IIFE helpers ─────────────────────────────────────────────────

/** esbuild plugin that redirects hls.js/dashjs imports to globalThis shims. */
const globalShimPlugin: EsbuildPlugin = {
	name: "global-shim",
	setup(build) {
		build.onResolve({ filter: /^hls\.js$/ }, () => ({
			path: resolve("src/global/hls-shim.ts"),
		}));
		build.onResolve({ filter: /^dashjs$/ }, () => ({
			path: resolve("src/global/dashjs-shim.ts"),
		}));
	},
};

const iifeBase: Partial<Options> = {
	format: ["iife"],
	outDir: "dist",
	dts: false,
	clean: false,
	minify: true,
	treeshake: true,
	splitting: false,
	target: "es2020",
	platform: "browser",
	outExtension: () => ({ js: ".js" }),
};

function iifeConfig(
	entryName: string,
	entryPath: string,
	opts?: { globalName?: string; needsShims?: boolean },
): Options {
	return {
		...iifeBase,
		entry: { [entryName]: entryPath },
		globalName: opts?.globalName,
		esbuildPlugins: opts?.needsShims ? [globalShimPlugin] : [],
	};
}

// ── Export ────────────────────────────────────────────────────────
export default defineConfig([
	esmConfig,
	// All-in-one
	iifeConfig("vide.global", "src/global/all.ts", {
		globalName: "Vide",
		needsShims: true,
	}),
	// Core only
	iifeConfig("vide.core.global", "src/global/core.ts", {
		globalName: "Vide",
	}),
	// Individual plugins (no globalName — they extend window.Vide)
	iifeConfig("vide.hls.global", "src/global/hls.ts", { needsShims: true }),
	iifeConfig("vide.dash.global", "src/global/dash.ts", { needsShims: true }),
	iifeConfig("vide.vast.global", "src/global/vast.ts"),
	iifeConfig("vide.vmap.global", "src/global/vmap.ts"),
	iifeConfig("vide.drm.global", "src/global/drm.ts"),
	iifeConfig("vide.ssai.global", "src/global/ssai.ts"),
	iifeConfig("vide.omid.global", "src/global/omid.ts"),
	iifeConfig("vide.simid.global", "src/global/simid.ts"),
	iifeConfig("vide.vpaid.global", "src/global/vpaid.ts"),
	iifeConfig("vide.ui.global", "src/global/ui.ts"),
]);
