import type { Player } from "../types.js";

// === VAST 4.1 Linear Ad ===

export interface VastResponse {
	version: string;
	ads: VastAd[];
	errors: string[];
}

export interface VastAd {
	id: string;
	sequence?: number | undefined;
	adSystem: string;
	adTitle: string;
	impressions: string[];
	creatives: VastCreative[];
	errors: string[];
	verifications?: AdVerification[] | undefined;
	categories?: AdCategory[] | undefined;
}

export interface AdVerification {
	vendor: string;
	resourceUrl: string;
	apiFramework?: string | undefined;
	parameters?: string | undefined;
}

export interface AdCategory {
	authority: string;
	value: string;
}

export interface VastCreative {
	id?: string | undefined;
	sequence?: number | undefined;
	linear: VastLinear | null;
}

export interface VastLinear {
	duration: number;
	skipOffset?: number | undefined;
	mediaFiles: VastMediaFile[];
	interactiveCreativeFiles: InteractiveCreativeFile[];
	trackingEvents: VastTrackingEvents;
	clickThrough?: string | undefined;
	clickTracking: string[];
}

export interface VastMediaFile {
	url: string;
	mimeType: string;
	width: number;
	height: number;
	bitrate?: number | undefined;
	delivery: "progressive" | "streaming";
}

export interface InteractiveCreativeFile {
	url: string;
	apiFramework: string;
	variableDuration?: boolean | undefined;
}

export interface VastTrackingEvents {
	start: string[];
	firstQuartile: string[];
	midpoint: string[];
	thirdQuartile: string[];
	complete: string[];
	pause: string[];
	resume: string[];
	skip: string[];
}

// === Ad Plugin (per-ad lifecycle) ===

/** Plugin scoped to a single ad. Created per-ad, cleaned up on ad end. */
export interface AdPlugin {
	name: string;
	setup(player: Player, ad: VastAd): (() => void) | undefined;
}

// === VAST Plugin Options ===
export interface VastPluginOptions {
	tagUrl: string;
	timeout?: number | undefined;
	allowSkip?: boolean | undefined;
	/** Create per-ad plugins. Called once per ad with the parsed VastAd. */
	adPlugins?: ((ad: VastAd) => AdPlugin[]) | undefined;
}

// === Resolve Options ===
export interface ResolveOptions {
	timeout?: number | undefined;
	maxDepth?: number | undefined;
}
