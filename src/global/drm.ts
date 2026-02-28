import {
	dashDrmConfig,
	detectKeySystem,
	drm,
	hlsDrmConfig,
	setupEme,
} from "../drm/index.js";

// biome-ignore lint/suspicious/noExplicitAny: global namespace access
// biome-ignore lint/suspicious/noAssignInExpressions: intentional ??= for global namespace init
const ns = ((globalThis as any).Vide ??= {});
Object.assign(ns, {
	drm,
	detectKeySystem,
	dashDrmConfig,
	hlsDrmConfig,
	setupEme,
});
