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
	adVerifications?: AdVerification[] | undefined;
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

// === VAST Plugin Options ===
export interface VastPluginOptions {
	tagUrl: string;
	timeout?: number | undefined;
	allowSkip?: boolean | undefined;
}

// === Resolve Options ===
export interface ResolveOptions {
	timeout?: number | undefined;
	maxDepth?: number | undefined;
}
