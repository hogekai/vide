import {
	classifyAds,
	fetchVast,
	getQuartile,
	parseVast,
	resolveVast,
	selectMediaFile,
	track,
	trackCompanionView,
	vast,
} from "../vast/index.js";

// biome-ignore lint/suspicious/noExplicitAny: global namespace access
// biome-ignore lint/suspicious/noAssignInExpressions: intentional ??= for global namespace init
const ns = ((globalThis as any).Vide ??= {});
Object.assign(ns, {
	vast,
	parseVast,
	fetchVast,
	resolveVast,
	track,
	trackCompanionView,
	getQuartile,
	classifyAds,
	selectMediaFile,
});
