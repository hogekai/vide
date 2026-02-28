import {
	ssai,
	parseDateRange,
	parseId3Samples,
	parseEventStream,
} from "../ssai/index.js";

// biome-ignore lint/suspicious/noExplicitAny: global namespace access
const ns = ((globalThis as any).Vide ??= {});
Object.assign(ns, { ssai, parseDateRange, parseId3Samples, parseEventStream });
