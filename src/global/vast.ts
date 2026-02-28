import {
	vast,
	parseVast,
	fetchVast,
	resolveVast,
	track,
	getQuartile,
} from "../vast/index.js";

// biome-ignore lint/suspicious/noExplicitAny: global namespace access
const ns = ((globalThis as any).Vide ??= {});
Object.assign(ns, { vast, parseVast, fetchVast, resolveVast, track, getQuartile });
