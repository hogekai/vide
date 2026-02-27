export interface VmapResponse {
	version: string;
	adBreaks: AdBreak[];
}

export interface AdBreak {
	timeOffset: AdBreakTimeOffset;
	breakType: "linear" | "nonlinear" | "display";
	breakId?: string | undefined;
	adSource: AdSource | null;
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

export interface VmapPluginOptions {
	url: string;
	timeout?: number | undefined;
	vastOptions?: {
		timeout?: number | undefined;
		maxDepth?: number | undefined;
	};
}
