import {
	drm,
	detectKeySystem,
	dashDrmConfig,
	hlsDrmConfig,
	setupEme,
} from "../drm/index.js";

// biome-ignore lint/suspicious/noExplicitAny: global namespace access
const ns = ((globalThis as any).Vide ??= {});
Object.assign(ns, { drm, detectKeySystem, dashDrmConfig, hlsDrmConfig, setupEme });
