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
	companionAds?: VastCompanionAds | undefined;
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

export interface VastProgressEvent {
	offset: number;
	url: string;
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
	loaded: string[];
	mute: string[];
	unmute: string[];
	rewind: string[];
	playerExpand: string[];
	playerCollapse: string[];
	closeLinear: string[];
	notUsed: string[];
	otherAdInteraction: string[];
	creativeView: string[];
	progress: VastProgressEvent[];
}

// === VAST 4.1 CompanionAds ===

export type CompanionRequired = "all" | "any" | "none";

export type CompanionRenderingMode = "default" | "end-card" | "concurrent";

export interface CompanionTrackingEvents {
	creativeView: string[];
}

export interface CompanionStaticResource {
	type: "static";
	url: string;
	creativeType: string;
}

export interface CompanionIFrameResource {
	type: "iframe";
	url: string;
}

export interface CompanionHTMLResource {
	type: "html";
	content: string;
}

export type CompanionResource =
	| CompanionStaticResource
	| CompanionIFrameResource
	| CompanionHTMLResource;

export interface VastCompanionAd {
	width: number;
	height: number;
	id?: string | undefined;
	assetWidth?: number | undefined;
	assetHeight?: number | undefined;
	expandedWidth?: number | undefined;
	expandedHeight?: number | undefined;
	apiFramework?: string | undefined;
	adSlotId?: string | undefined;
	pxratio?: number | undefined;
	renderingMode?: CompanionRenderingMode | undefined;
	resources: CompanionResource[];
	clickThrough?: string | undefined;
	clickTracking: string[];
	trackingEvents: CompanionTrackingEvents;
	altText?: string | undefined;
	adParameters?: string | undefined;
}

export interface VastCompanionAds {
	required: CompanionRequired;
	companions: VastCompanionAd[];
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
