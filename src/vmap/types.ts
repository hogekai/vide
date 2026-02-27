export interface VmapResponse {
	version: string;
	adBreaks: AdBreak[];
}

export interface AdBreakTrackingEvents {
	breakStart: string[];
	breakEnd: string[];
	error: string[];
}

export interface AdBreak {
	timeOffset: AdBreakTimeOffset;
	breakType: "linear" | "nonlinear" | "display";
	breakId?: string | undefined;
	adSource: AdSource | null;
	trackingEvents: AdBreakTrackingEvents;
}

export type AdBreakTimeOffset =
	| { type: "start" }
	| { type: "end" }
	| { type: "time"; seconds: number }
	| { type: "percentage"; pct: number };

export interface AdSource {
	id?: string | undefined;
	allowMultipleAds?: boolean | undefined;
	followRedirects?: boolean | undefined;
	vastUrl?: string | undefined;
	vastData?: string | undefined;
}

import type { AdPlugin, VastAd } from "../vast/types.js";

export interface VmapPluginOptions {
	url: string;
	timeout?: number | undefined;
	vastOptions?: {
		timeout?: number | undefined;
		maxDepth?: number | undefined;
	};
	/** Create per-ad plugins. Called once per ad with the parsed VastAd. */
	adPlugins?: ((ad: VastAd) => AdPlugin[]) | undefined;
}
