import { DEFAULT_VAST_TAG_URL } from "./playground-presets";

export interface PlaygroundConfig {
	sourceUrl: string;
	sourceType: "hls" | "dash" | "mp4";
	enabledPlugins: string[];
	vastTagUrl?: string;
}

const CDN_VERSION = "0.9";
const CDN_BASE = `https://esm.sh/@videts/vide@${CDN_VERSION}`;

const ERROR_REPORTING = `
    window.addEventListener("error", (e) => {
      parent.postMessage({ type: "vide-playground-error", message: e.message }, "*");
    });
    window.addEventListener("unhandledrejection", (e) => {
      parent.postMessage({ type: "vide-playground-error", message: e.reason?.message || String(e.reason) }, "*");
    });`;

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
    <video playsinline muted></video>
  </div>
  <script type="module">${ERROR_REPORTING}
    ${esmImports}

    const video = document.querySelector("video");
    try {
      ${jsSetup}
    } catch (e) {
      console.error("[vide playground]", e);
      parent.postMessage({ type: "vide-playground-error", message: e.message || String(e) }, "*");
    }
  </script>
</body>
</html>`;
}

/** Generate display code using clean @videts/vide imports */
export function generateCode(config: PlaygroundConfig): string {
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
	if (plugins.includes("ssai")) {
		imports.push('import { ssai } from "@videts/vide/ssai";');
	}

	setup.push('const player = createPlayer(document.querySelector("video")!);');

	if (plugins.includes("hls")) {
		setup.push("player.use(hls());");
	}
	if (plugins.includes("dash")) {
		setup.push("player.use(dash());");
	}

	if (plugins.includes("ui") && plugins.includes("vast")) {
		setup.push(
			'const uiPlugin = ui({ container: document.getElementById("player")! });',
		);
		setup.push("player.use(uiPlugin);");
		const tagUrl = config.vastTagUrl || DEFAULT_VAST_TAG_URL;
		setup.push("player.use(vast({");
		setup.push(`  tagUrl: "${tagUrl}" + Date.now(),`);
		setup.push("  adPlugins: uiPlugin.getAdPlugin(),");
		setup.push("}));");
	} else if (plugins.includes("ui")) {
		setup.push(
			'player.use(ui({ container: document.getElementById("player")! }));',
		);
	}

	if (plugins.includes("ssai")) {
		setup.push("player.use(ssai());");
	}

	setup.push(`player.src = "${config.sourceUrl}";`);

	return `${imports.join("\n")}\n\n${setup.join("\n")}`;
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
	if (plugins.includes("ssai")) importMap.ssai = `${CDN_BASE}/ssai`;

	const esmImports = Object.entries(importMap)
		.map(([key, url]) => {
			if (key === "core") return `import { createPlayer } from "${url}";`;
			return `import { ${key} } from "${url}";`;
		})
		.join("\n    ");

	let jsSetup = "const player = createPlayer(video);";

	if (plugins.includes("hls")) {
		jsSetup += "\n      player.use(hls());";
	}
	if (plugins.includes("dash")) {
		jsSetup += "\n      player.use(dash());";
	}
	if (plugins.includes("ui") && plugins.includes("vast")) {
		jsSetup +=
			"\n      const uiPlugin = ui({ container: document.getElementById('player') });";
		jsSetup += "\n      player.use(uiPlugin);";
		const tagUrl = config.vastTagUrl || DEFAULT_VAST_TAG_URL;
		jsSetup += "\n      player.use(vast({";
		jsSetup += `\n        tagUrl: "${tagUrl}" + Date.now(),`;
		jsSetup += "\n        adPlugins: uiPlugin.getAdPlugin(),";
		jsSetup += "\n      }));";
	} else if (plugins.includes("ui")) {
		jsSetup +=
			"\n      player.use(ui({ container: document.getElementById('player') }));";
	}
	if (plugins.includes("ssai")) {
		jsSetup += "\n      player.use(ssai());";
	}

	jsSetup += `\n      player.src = "${config.sourceUrl}";`;

	return buildHtmlShell(esmImports, jsSetup, plugins.includes("ui"));
}

/** Transform user-edited display code into executable iframe HTML */
export function codeToIframeHtml(displayCode: string): string {
	// Detect if UI plugin is used (for theme.css link)
	const hasUi = /from\s+["']@videts\/vide\/ui["']/.test(displayCode);

	// Strip CSS import lines (handled via <link> tag)
	let code = displayCode.replace(
		/import\s+["']@videts\/vide\/ui\/theme\.css["'];?\n?/g,
		"",
	);

	// Replace @videts/vide imports with CDN URLs
	code = code.replace(
		/from\s+["']@videts\/vide(\/[^"']*)?\s*["']/g,
		(_, subpath) => `from "${CDN_BASE}${subpath || ""}"`,
	);

	// Replace document.querySelector("video")! with video (already declared in shell)
	code = code.replace(
		/document\.querySelector\(\s*["']video["']\s*\)\s*!?/g,
		"video",
	);

	// Replace document.getElementById("player")! with document.getElementById('player')
	code = code.replace(
		/document\.getElementById\(\s*["']player["']\s*\)\s*!?/g,
		"document.getElementById('player')",
	);

	// Split into import lines and setup lines
	const lines = code.split("\n");
	const importLines: string[] = [];
	const setupLines: string[] = [];
	let pastImports = false;

	for (const line of lines) {
		const trimmed = line.trim();
		if (!pastImports && (trimmed.startsWith("import ") || trimmed === "")) {
			if (trimmed !== "") importLines.push(trimmed);
		} else {
			pastImports = true;
			if (trimmed !== "") setupLines.push(trimmed);
		}
	}

	const esmImports = importLines.join("\n    ");
	const jsSetup = setupLines.join("\n      ");

	return buildHtmlShell(esmImports, jsSetup, hasUi);
}
