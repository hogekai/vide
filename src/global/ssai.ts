import {
	parseDateRange,
	parseEventStream,
	parseId3Samples,
	ssai,
} from "../ssai/index.js";

// biome-ignore lint/suspicious/noExplicitAny: global namespace access
// biome-ignore lint/suspicious/noAssignInExpressions: intentional ??= for global namespace init
const ns = ((globalThis as any).Vide ??= {});
Object.assign(ns, { ssai, parseDateRange, parseId3Samples, parseEventStream });
