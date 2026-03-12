import { DEFAULT_VAST_TAG_URL } from "./playground-presets";

export type FrameworkType = "vanilla" | "react" | "vue" | "svelte";

export interface PlaygroundConfig {
	sourceUrl: string;
	sourceType: "hls" | "dash" | "mp4";
	enabledPlugins: string[];
	posterUrl?: string;
	autoplay?: boolean;
	muted?: boolean;
	loop?: boolean;
	playsinline?: boolean;
	vastTagUrl?: string;
	vastTimeout?: number;
	vastAllowSkip?: boolean;
	vmapUrl?: string;
	uiExclude?: string[];
	drmKeySystem?: "widevine" | "fairplay" | "playready" | "clearkey";
	drmLicenseUrl?: string;
	imaAdTagUrl?: string;
	imaTimeout?: number;
	ssaiTolerance?: number;
}

const CDN_VERSION = "0.10";
const CDN_BASE = `https://esm.sh/@videts/vide@${CDN_VERSION}`;

const ERROR_REPORTING = `
    window.addEventListener("error", (e) => {
      parent.postMessage({ type: "vide-playground-error", message: e.message }, "*");
    });
    window.addEventListener("unhandledrejection", (e) => {
      parent.postMessage({ type: "vide-playground-error", message: e.reason?.message || String(e.reason) }, "*");
    });`;

const INSPECTOR_BRIDGE = `
    // Inspector bridge — forwards player data to parent
    const _events = [
      "play","pause","ended","timeupdate","statechange","error",
      "volumechange","ratechange","seeking","seeked",
      "qualitiesavailable","qualitychange",
      "ad:start","ad:end","ad:skip","ad:click","ad:error","ad:impression",
      "ad:loaded","ad:quartile","ad:breakStart","ad:breakEnd",
      "texttrackchange","texttracksavailable","cuechange",
      "drm:keystatus","drm:ready","livestatechange"
    ];
    for (const ev of _events) {
      player.on(ev, (data) => {
        parent.postMessage({ type: "vide-pg-event", event: ev, data: JSON.parse(JSON.stringify(data ?? {})), ts: Date.now() }, "*");
      });
    }
    player.on("statechange", ({ from, to }) => {
      parent.postMessage({ type: "vide-pg-statechange", from, to }, "*");
    });
    player.on("qualitiesavailable", () => {
      const qs = player.qualities.map(q => ({ id: q.id, label: q.label, width: q.width, height: q.height, bitrate: q.bitrate }));
      parent.postMessage({ type: "vide-pg-qualities", qualities: qs }, "*");
    });
    setInterval(() => {
      parent.postMessage({ type: "vide-pg-state",
        state: player.state,
        src: player.src || "",
        currentTime: player.currentTime,
        duration: player.duration,
        volume: player.volume,
        muted: player.muted,
        paused: player.paused,
        loop: player.loop,
        playbackRate: player.playbackRate,
        isAutoQuality: player.isAutoQuality ?? null,
        isLive: player.isLive ?? false,
      }, "*");
    }, 250);
    parent.postMessage({ type: "vide-pg-ready" }, "*");`;

function buildHtmlShell(
	esmImports: string,
	jsSetup: string,
	hasUi: boolean,
): string {
	const themeCssLink = hasUi
		? `<link rel="stylesheet" href="${CDN_BASE}/ui/theme.css">`
		: "";

	return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${themeCssLink}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #000; }
    #player { position: relative; width: 100%; height: 100%; }
    video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="player">
    <video></video>
  </div>
  <script type="module">${ERROR_REPORTING}
    ${esmImports}

    const video = document.querySelector("video");
    try {
      ${jsSetup}

      ${INSPECTOR_BRIDGE}
    } catch (e) {
      console.error("[vide playground]", e);
      parent.postMessage({ type: "vide-playground-error", message: e.message || String(e) }, "*");
    }
  </script>
</body>
</html>`;
}

/** Check if any ad plugins (OMID/SIMID/VPAID) need the adPlugins array */
function hasAdPlugins(plugins: string[]): boolean {
	return plugins.some((p) => ["omid", "simid", "vpaid"].includes(p));
}

/** Build the adPlugins array entries for display code */
function buildAdPluginsEntries(plugins: string[], hasUi: boolean): string[] {
	const entries: string[] = [];
	if (hasUi) entries.push("uiPlugin.getAdPlugin()");
	if (plugins.includes("omid"))
		entries.push(
			'omid({ partner: { name: "your-company", version: "1.0.0" } })',
		);
	if (plugins.includes("simid"))
		entries.push('simid({ container: document.getElementById("player")! })');
	if (plugins.includes("vpaid"))
		entries.push('vpaid({ container: document.getElementById("player")! })');
	return entries;
}

// ---------------------------------------------------------------------------
// Shared helpers for plugin option generation
// ---------------------------------------------------------------------------

function buildDrmOption(config: PlaygroundConfig): string | null {
	if (!config.enabledPlugins.includes("drm") || !config.drmKeySystem)
		return null;
	const ks = config.drmKeySystem;
	if (ks === "clearkey") {
		return '{\n  clearkey: { keys: { "key-id": "key" } },\n}';
	}
	const url = config.drmLicenseUrl || "https://license.example.com/...";
	return `{\n  ${ks}: { licenseUrl: "${url}" },\n}`;
}

function buildUiExcludeFragment(config: PlaygroundConfig): string {
	return config.uiExclude?.length
		? `, exclude: [${config.uiExclude.map((c) => `"${c}"`).join(", ")}]`
		: "";
}

function buildVastOpts(
	config: PlaygroundConfig,
	adPluginsRef: string | null,
): string {
	const opts: string[] = [];
	const tagUrl = config.vastTagUrl || DEFAULT_VAST_TAG_URL;
	opts.push(`  tagUrl: "${tagUrl}" + Date.now(),`);
	if (config.vastTimeout && config.vastTimeout !== 5000) {
		opts.push(`  timeout: ${config.vastTimeout},`);
	}
	if (config.vastAllowSkip === false) {
		opts.push("  allowSkip: false,");
	}
	if (adPluginsRef) opts.push(`  ${adPluginsRef},`);
	return `{\n${opts.join("\n")}\n}`;
}

function buildVmapOpts(
	config: PlaygroundConfig,
	adPluginsRef: string | null,
): string {
	const url = config.vmapUrl || "https://example.com/vmap.xml";
	const opts: string[] = [`  url: "${url}",`];
	if (adPluginsRef) opts.push(`  ${adPluginsRef},`);
	return `{\n${opts.join("\n")}\n}`;
}

function buildImaOpts(config: PlaygroundConfig): string {
	const tagUrl = config.imaAdTagUrl || DEFAULT_VAST_TAG_URL;
	const opts: string[] = [];
	opts.push(`  adTagUrl: "${tagUrl}" + Date.now(),`);
	opts.push('  adContainer: document.getElementById("player")!,');
	if (config.imaTimeout && config.imaTimeout !== 6000) {
		opts.push(`  timeout: ${config.imaTimeout},`);
	}
	return `{\n${opts.join("\n")}\n}`;
}

function buildSsaiCall(config: PlaygroundConfig): string {
	if (config.ssaiTolerance && config.ssaiTolerance !== 0.5) {
		return `ssai({ tolerance: ${config.ssaiTolerance} })`;
	}
	return "ssai()";
}

// ---------------------------------------------------------------------------
// Vanilla code generation (original logic)
// ---------------------------------------------------------------------------

function generateVanillaCode(config: PlaygroundConfig): string {
	const imports: string[] = ['import { createPlayer } from "@videts/vide";'];
	const setup: string[] = [];
	const plugins = config.enabledPlugins;

	if (plugins.includes("hls")) {
		imports.push('import { hls } from "@videts/vide/hls";');
	}
	if (plugins.includes("dash")) {
		imports.push('import { dash } from "@videts/vide/dash";');
	}
	if (plugins.includes("ui")) {
		imports.push('import { ui } from "@videts/vide/ui";');
		imports.push('import "@videts/vide/ui/theme.css";');
	}
	if (plugins.includes("vast")) {
		imports.push('import { vast } from "@videts/vide/vast";');
	}
	if (plugins.includes("vmap")) {
		imports.push('import { vmap } from "@videts/vide/vmap";');
	}
	if (plugins.includes("ima")) {
		imports.push('import { ima } from "@videts/vide/ima";');
	}
	if (plugins.includes("drm")) {
		imports.push('import { drm } from "@videts/vide/drm";');
	}
	if (plugins.includes("ssai")) {
		imports.push('import { ssai } from "@videts/vide/ssai";');
	}
	if (plugins.includes("omid")) {
		imports.push('import { omid } from "@videts/vide/omid";');
	}
	if (plugins.includes("simid")) {
		imports.push('import { simid } from "@videts/vide/simid";');
	}
	if (plugins.includes("vpaid")) {
		imports.push('import { vpaid } from "@videts/vide/vpaid";');
	}

	setup.push('const player = createPlayer(document.querySelector("video")!);');

	if (plugins.includes("hls")) {
		setup.push("player.use(hls());");
	}
	if (plugins.includes("dash")) {
		setup.push("player.use(dash());");
	}

	// DRM
	const drmOpt = buildDrmOption(config);
	if (drmOpt) {
		setup.push(`player.use(drm(${drmOpt}));`);
	}

	// UI — extract as variable when VAST/VMAP need adPlugins
	const needsUiVar =
		plugins.includes("ui") &&
		(plugins.includes("vast") || plugins.includes("vmap"));
	if (needsUiVar) {
		const excludeOpt = buildUiExcludeFragment(config);
		setup.push(
			`const uiPlugin = ui({ container: document.getElementById("player")!${excludeOpt} });`,
		);
		setup.push("player.use(uiPlugin);");
	} else if (plugins.includes("ui")) {
		const excludeOpt = buildUiExcludeFragment(config);
		setup.push(
			`player.use(ui({ container: document.getElementById("player")!${excludeOpt} }));`,
		);
	}

	// Ad plugins array (OMID/SIMID/VPAID + UI's getAdPlugin)
	const useAdPluginsArray =
		hasAdPlugins(plugins) &&
		(plugins.includes("vast") || plugins.includes("vmap"));
	if (useAdPluginsArray) {
		const entries = buildAdPluginsEntries(plugins, needsUiVar);
		if (entries.length === 1) {
			setup.push(`const adPlugins = [${entries[0]}];`);
		} else {
			setup.push(`const adPlugins = [\n  ${entries.join(",\n  ")},\n];`);
		}
	}

	// Resolve adPlugins reference for VAST/VMAP
	let adPluginsRef: string | null = null;
	if (useAdPluginsArray) {
		adPluginsRef = "adPlugins";
	} else if (needsUiVar) {
		adPluginsRef = "adPlugins: uiPlugin.getAdPlugin()";
	}

	if (plugins.includes("vast")) {
		setup.push(`player.use(vast(${buildVastOpts(config, adPluginsRef)}));`);
	}
	if (plugins.includes("vmap")) {
		setup.push(`player.use(vmap(${buildVmapOpts(config, adPluginsRef)}));`);
	}
	if (plugins.includes("ima")) {
		setup.push(`player.use(ima(${buildImaOpts(config)}));`);
	}
	if (plugins.includes("ssai")) {
		setup.push(`player.use(${buildSsaiCall(config)});`);
	}

	if (config.muted) setup.push("player.muted = true;");
	if (config.loop) setup.push("player.loop = true;");
	if (config.autoplay) setup.push("player.autoplay = true;");

	setup.push(`player.src = "${config.sourceUrl}";`);

	return `${imports.join("\n")}\n\n${setup.join("\n")}`;
}

// ---------------------------------------------------------------------------
// Framework: React
// ---------------------------------------------------------------------------

/** Map plugin id to React hook name and import */
const REACT_HOOK_MAP: Record<string, { hook: string; import: string }> = {
	hls: { hook: "useHls", import: "useHls" },
	dash: { hook: "useDash", import: "useDash" },
	drm: { hook: "useDrm", import: "useDrm" },
	ui: { hook: "useUi", import: "useUi" },
	vast: { hook: "useVast", import: "useVast" },
	vmap: { hook: "useVmap", import: "useVmap" },
	ssai: { hook: "useSsai", import: "useSsai" },
	ima: { hook: "useIma", import: "useIma" },
};

function generateReactCode(config: PlaygroundConfig): string {
	const plugins = config.enabledPlugins;
	const hookImports: string[] = ["useVidePlayer"];
	const body: string[] = [];

	// Collect hook imports
	for (const p of plugins) {
		if (REACT_HOOK_MAP[p]) hookImports.push(REACT_HOOK_MAP[p].import);
	}

	const lines: string[] = [];
	lines.push(`import { ${hookImports.join(", ")} } from "@videts/vide/react";`);
	if (plugins.includes("ui")) {
		lines.push('import "@videts/vide/ui/theme.css";');
	}
	lines.push("");
	lines.push("function Player() {");
	lines.push("  const player = useVidePlayer();");

	// Streaming
	if (plugins.includes("hls")) body.push("  useHls(player);");
	if (plugins.includes("dash")) body.push("  useDash(player);");

	// DRM
	const drmOpt = buildDrmOption(config);
	if (drmOpt) {
		body.push(`  useDrm(player, ${drmOpt.replace(/\n/g, "\n  ")});`);
	}

	// UI
	if (plugins.includes("ui")) {
		const excludeOpt = buildUiExcludeFragment(config);
		body.push(
			`  useUi(player, { container: document.getElementById("player")!${excludeOpt} });`,
		);
	}

	// VAST
	if (plugins.includes("vast")) {
		body.push(
			`  useVast(player, ${buildVastOpts(config, null).replace(/\n/g, "\n  ")});`,
		);
	}

	// VMAP
	if (plugins.includes("vmap")) {
		body.push(
			`  useVmap(player, ${buildVmapOpts(config, null).replace(/\n/g, "\n  ")});`,
		);
	}

	// IMA
	if (plugins.includes("ima")) {
		body.push(
			`  useIma(player, ${buildImaOpts(config).replace(/\n/g, "\n  ")});`,
		);
	}

	// SSAI
	if (plugins.includes("ssai")) {
		if (config.ssaiTolerance && config.ssaiTolerance !== 0.5) {
			body.push(`  useSsai(player, { tolerance: ${config.ssaiTolerance} });`);
		} else {
			body.push("  useSsai(player);");
		}
	}

	lines.push(...body);
	lines.push("");

	// JSX return
	const videoAttrs: string[] = [];
	videoAttrs.push("ref={player._registerEl}");
	if (config.muted) videoAttrs.push("muted");
	if (config.loop) videoAttrs.push("loop");
	if (config.autoplay) videoAttrs.push("autoPlay");
	if (config.posterUrl) videoAttrs.push(`poster="${config.posterUrl}"`);

	lines.push("  return (");
	lines.push('    <div id="player">');
	lines.push(`      <video ${videoAttrs.join(" ")} />`);
	lines.push("    </div>");
	lines.push("  );");
	lines.push("}");

	return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Framework: Vue
// ---------------------------------------------------------------------------

function generateVueCode(config: PlaygroundConfig): string {
	const plugins = config.enabledPlugins;
	const hookImports: string[] = ["useVidePlayer"];
	const body: string[] = [];

	for (const p of plugins) {
		if (REACT_HOOK_MAP[p]) hookImports.push(REACT_HOOK_MAP[p].import);
	}

	const lines: string[] = [];
	lines.push('<script setup lang="ts">');
	lines.push(`import { ${hookImports.join(", ")} } from "@videts/vide/vue";`);
	if (plugins.includes("ui")) {
		lines.push('import "@videts/vide/ui/theme.css";');
	}
	lines.push("");
	lines.push("const player = useVidePlayer();");

	// Streaming
	if (plugins.includes("hls")) body.push("useHls(player);");
	if (plugins.includes("dash")) body.push("useDash(player);");

	// DRM
	const drmOpt = buildDrmOption(config);
	if (drmOpt) {
		body.push(`useDrm(player, ${drmOpt});`);
	}

	// UI
	if (plugins.includes("ui")) {
		const excludeOpt = buildUiExcludeFragment(config);
		body.push(
			`useUi(player, { container: document.getElementById("player")!${excludeOpt} });`,
		);
	}

	// VAST
	if (plugins.includes("vast")) {
		body.push(`useVast(player, ${buildVastOpts(config, null)});`);
	}

	// VMAP
	if (plugins.includes("vmap")) {
		body.push(`useVmap(player, ${buildVmapOpts(config, null)});`);
	}

	// IMA
	if (plugins.includes("ima")) {
		body.push(`useIma(player, ${buildImaOpts(config)});`);
	}

	// SSAI
	if (plugins.includes("ssai")) {
		if (config.ssaiTolerance && config.ssaiTolerance !== 0.5) {
			body.push(`useSsai(player, { tolerance: ${config.ssaiTolerance} });`);
		} else {
			body.push("useSsai(player);");
		}
	}

	lines.push(...body);
	lines.push("</script>");
	lines.push("");

	// Template
	const videoAttrs: string[] = [];
	if (config.muted) videoAttrs.push("muted");
	if (config.loop) videoAttrs.push("loop");
	if (config.autoplay) videoAttrs.push("autoplay");
	if (config.posterUrl) videoAttrs.push(`:poster='"${config.posterUrl}"'`);
	const attrStr = videoAttrs.length ? ` ${videoAttrs.join(" ")}` : "";

	lines.push("<template>");
	lines.push('  <div id="player">');
	lines.push(`    <video${attrStr} />`);
	lines.push("  </div>");
	lines.push("</template>");

	return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Framework: Svelte
// ---------------------------------------------------------------------------

function generateSvelteCode(config: PlaygroundConfig): string {
	const plugins = config.enabledPlugins;
	const hookImports: string[] = ["createVidePlayer"];

	for (const p of plugins) {
		// Svelte uses same hook names as React/Vue except createVidePlayer
		if (REACT_HOOK_MAP[p]) hookImports.push(REACT_HOOK_MAP[p].import);
	}

	const body: string[] = [];
	const lines: string[] = [];
	lines.push('<script lang="ts">');
	lines.push(
		`  import { ${hookImports.join(", ")} } from "@videts/vide/svelte";`,
	);
	if (plugins.includes("ui")) {
		lines.push('  import "@videts/vide/ui/theme.css";');
	}
	lines.push("");
	lines.push("  const getPlayer = createVidePlayer();");

	// Streaming
	if (plugins.includes("hls")) body.push("  useHls(getPlayer);");
	if (plugins.includes("dash")) body.push("  useDash(getPlayer);");

	// DRM
	const drmOpt = buildDrmOption(config);
	if (drmOpt) {
		body.push(`  useDrm(getPlayer, ${drmOpt.replace(/\n/g, "\n  ")});`);
	}

	// UI
	if (plugins.includes("ui")) {
		const excludeOpt = buildUiExcludeFragment(config);
		body.push(
			`  useUi(getPlayer, { container: document.getElementById("player")!${excludeOpt} });`,
		);
	}

	// VAST
	if (plugins.includes("vast")) {
		body.push(
			`  useVast(getPlayer, ${buildVastOpts(config, null).replace(/\n/g, "\n  ")});`,
		);
	}

	// VMAP
	if (plugins.includes("vmap")) {
		body.push(
			`  useVmap(getPlayer, ${buildVmapOpts(config, null).replace(/\n/g, "\n  ")});`,
		);
	}

	// IMA
	if (plugins.includes("ima")) {
		body.push(
			`  useIma(getPlayer, ${buildImaOpts(config).replace(/\n/g, "\n  ")});`,
		);
	}

	// SSAI
	if (plugins.includes("ssai")) {
		if (config.ssaiTolerance && config.ssaiTolerance !== 0.5) {
			body.push(
				`  useSsai(getPlayer, { tolerance: ${config.ssaiTolerance} });`,
			);
		} else {
			body.push("  useSsai(getPlayer);");
		}
	}

	lines.push(...body);
	lines.push("</script>");
	lines.push("");

	// Markup
	const videoAttrs: string[] = [];
	if (config.muted) videoAttrs.push("muted");
	if (config.loop) videoAttrs.push("loop");
	if (config.autoplay) videoAttrs.push("autoplay");
	if (config.posterUrl) videoAttrs.push(`poster="${config.posterUrl}"`);
	const attrStr = videoAttrs.length ? ` ${videoAttrs.join(" ")}` : "";

	lines.push('<div id="player">');
	lines.push(`  <video${attrStr} />`);
	lines.push("</div>");

	return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Generate display code for the selected framework */
export function generateCode(
	config: PlaygroundConfig,
	framework: FrameworkType = "vanilla",
): string {
	switch (framework) {
		case "react":
			return generateReactCode(config);
		case "vue":
			return generateVueCode(config);
		case "svelte":
			return generateSvelteCode(config);
		default:
			return generateVanillaCode(config);
	}
}

/** Map framework to syntax highlighting language */
export function frameworkToLang(framework: FrameworkType): string {
	switch (framework) {
		case "react":
			return "tsx";
		case "vue":
			return "vue";
		case "svelte":
			return "svelte";
		default:
			return "typescript";
	}
}

/** Generate a complete HTML document for iframe execution */
export function generateIframeHtml(config: PlaygroundConfig): string {
	const plugins = config.enabledPlugins;

	const importMap: Record<string, string> = {
		core: CDN_BASE,
	};
	if (plugins.includes("hls")) importMap.hls = `${CDN_BASE}/hls`;
	if (plugins.includes("dash")) importMap.dash = `${CDN_BASE}/dash`;
	if (plugins.includes("ui")) importMap.ui = `${CDN_BASE}/ui`;
	if (plugins.includes("vast")) importMap.vast = `${CDN_BASE}/vast`;
	if (plugins.includes("vmap")) importMap.vmap = `${CDN_BASE}/vmap`;
	if (plugins.includes("ima")) importMap.ima = `${CDN_BASE}/ima`;
	if (plugins.includes("drm")) importMap.drm = `${CDN_BASE}/drm`;
	if (plugins.includes("ssai")) importMap.ssai = `${CDN_BASE}/ssai`;
	if (plugins.includes("omid")) importMap.omid = `${CDN_BASE}/omid`;
	if (plugins.includes("simid")) importMap.simid = `${CDN_BASE}/simid`;
	if (plugins.includes("vpaid")) importMap.vpaid = `${CDN_BASE}/vpaid`;

	const esmImports = Object.entries(importMap)
		.map(([key, url]) => {
			if (key === "core") return `import { createPlayer } from "${url}";`;
			return `import { ${key} } from "${url}";`;
		})
		.join("\n    ");

	let jsSetup = "const player = createPlayer(video);";

	// Video attributes
	const attrs: string[] = [];
	if (config.playsinline !== false) attrs.push("video.playsInline = true;");
	if (config.muted !== false) attrs.push("video.muted = true;");
	if (config.autoplay) attrs.push("video.autoplay = true;");
	if (config.loop) attrs.push("video.loop = true;");
	if (config.posterUrl) attrs.push(`video.poster = "${config.posterUrl}";`);
	if (attrs.length) {
		jsSetup += `\n      ${attrs.join("\n      ")}`;
	}

	if (plugins.includes("hls")) {
		jsSetup += "\n      player.use(hls());";
	}
	if (plugins.includes("dash")) {
		jsSetup += "\n      player.use(dash());";
	}

	// DRM
	if (plugins.includes("drm") && config.drmKeySystem) {
		const ks = config.drmKeySystem;
		if (ks === "clearkey") {
			jsSetup +=
				'\n      player.use(drm({ clearkey: { keys: { "key-id": "key" } } }));';
		} else {
			const url = config.drmLicenseUrl || "https://license.example.com/...";
			jsSetup += `\n      player.use(drm({ ${ks}: { licenseUrl: "${url}" } }));`;
		}
	}

	// UI — extract as variable when VAST/VMAP need adPlugins
	const needsUiVar =
		plugins.includes("ui") &&
		(plugins.includes("vast") || plugins.includes("vmap"));
	if (needsUiVar) {
		const excludeOpt = config.uiExclude?.length
			? `, exclude: [${config.uiExclude.map((c) => `"${c}"`).join(", ")}]`
			: "";
		jsSetup += `\n      const uiPlugin = ui({ container: document.getElementById('player')${excludeOpt} });`;
		jsSetup += "\n      player.use(uiPlugin);";
	} else if (plugins.includes("ui")) {
		const excludeOpt = config.uiExclude?.length
			? `, exclude: [${config.uiExclude.map((c) => `"${c}"`).join(", ")}]`
			: "";
		jsSetup += `\n      player.use(ui({ container: document.getElementById('player')${excludeOpt} }));`;
	}

	// Ad plugins array (OMID/SIMID/VPAID + UI's getAdPlugin)
	const useAdPluginsArray =
		hasAdPlugins(plugins) &&
		(plugins.includes("vast") || plugins.includes("vmap"));
	if (useAdPluginsArray) {
		const entries = buildAdPluginsEntries(plugins, needsUiVar);
		jsSetup += `\n      const adPlugins = [${entries.join(", ")}];`;
	}

	// VAST
	if (plugins.includes("vast")) {
		const tagUrl = config.vastTagUrl || DEFAULT_VAST_TAG_URL;
		jsSetup += "\n      player.use(vast({";
		jsSetup += `\n        tagUrl: "${tagUrl}" + Date.now(),`;
		if (config.vastTimeout && config.vastTimeout !== 5000) {
			jsSetup += `\n        timeout: ${config.vastTimeout},`;
		}
		if (config.vastAllowSkip === false) {
			jsSetup += "\n        allowSkip: false,";
		}
		if (useAdPluginsArray) {
			jsSetup += "\n        adPlugins,";
		} else if (needsUiVar) {
			jsSetup += "\n        adPlugins: uiPlugin.getAdPlugin(),";
		}
		jsSetup += "\n      }));";
	}

	// VMAP
	if (plugins.includes("vmap")) {
		const url = config.vmapUrl || "https://example.com/vmap.xml";
		jsSetup += "\n      player.use(vmap({";
		jsSetup += `\n        url: "${url}",`;
		if (useAdPluginsArray) {
			jsSetup += "\n        adPlugins,";
		} else if (needsUiVar) {
			jsSetup += "\n        adPlugins: uiPlugin.getAdPlugin(),";
		}
		jsSetup += "\n      }));";
	}

	// IMA
	if (plugins.includes("ima")) {
		const tagUrl = config.imaAdTagUrl || DEFAULT_VAST_TAG_URL;
		jsSetup += "\n      player.use(ima({";
		jsSetup += `\n        adTagUrl: "${tagUrl}" + Date.now(),`;
		jsSetup += "\n        adContainer: document.getElementById('player'),";
		if (config.imaTimeout && config.imaTimeout !== 6000) {
			jsSetup += `\n        timeout: ${config.imaTimeout},`;
		}
		jsSetup += "\n      }));";
	}

	// SSAI
	if (plugins.includes("ssai")) {
		if (config.ssaiTolerance && config.ssaiTolerance !== 0.5) {
			jsSetup += `\n      player.use(ssai({ tolerance: ${config.ssaiTolerance} }));`;
		} else {
			jsSetup += "\n      player.use(ssai());";
		}
	}

	jsSetup += `\n      player.src = "${config.sourceUrl}";`;

	return buildHtmlShell(esmImports, jsSetup, plugins.includes("ui"));
}
