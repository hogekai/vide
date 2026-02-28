import type {
	AdCategory,
	AdVerification,
	CompanionRenderingMode,
	CompanionRequired,
	CompanionResource,
	CompanionTrackingEvents,
	InteractiveCreativeFile,
	ResolveOptions,
	VastAd,
	VastCompanionAd,
	VastCompanionAds,
	VastCreative,
	VastLinear,
	VastMediaFile,
	VastResponse,
	VastTrackingEvents,
} from "./types.js";

/**
 * Parse a VAST XML string into a VastResponse object.
 * Pure function — no side effects, no network access.
 */
export function parseVast(xml: string): VastResponse {
	const parser = new DOMParser();
	const doc = parser.parseFromString(xml, "text/xml");

	const parseError = doc.querySelector("parsererror");
	if (parseError) {
		return { version: "", ads: [], errors: ["VAST XML parse error"] };
	}

	const vastEl = doc.documentElement;
	if (vastEl.tagName !== "VAST") {
		return {
			version: "",
			ads: [],
			errors: ["Document is not a VAST response"],
		};
	}

	const version = vastEl.getAttribute("version") ?? "";

	const rootErrors = childrenTextContents(vastEl, "Error");
	const adEls = directChildren(vastEl, "Ad");
	const ads: VastAd[] = [];

	for (const adEl of adEls) {
		const ad = parseAd(adEl);
		if (ad) {
			ads.push(ad);
		}
	}

	return { version, ads, errors: rootErrors };
}

function parseAd(adEl: Element): VastAd | null {
	const inlineEl = directChild(adEl, "InLine");
	if (!inlineEl) {
		return null;
	}

	const id = adEl.getAttribute("id") ?? "";
	const sequenceAttr = adEl.getAttribute("sequence");
	const sequence = safeInt(sequenceAttr, undefined);

	const adSystem = textContent(inlineEl, "AdSystem");
	const adTitle = textContent(inlineEl, "AdTitle");
	const impressions = textContents(inlineEl, "Impression");
	const errors = childrenTextContents(inlineEl, "Error");

	const creativesEl = inlineEl.querySelector("Creatives");
	const creatives: VastCreative[] = [];

	if (creativesEl) {
		const creativeEls = directChildren(creativesEl, "Creative");
		for (const creativeEl of creativeEls) {
			creatives.push(parseCreative(creativeEl));
		}
	}

	const verifications = parseAdVerifications(inlineEl);
	const categories = parseCategories(inlineEl);

	return {
		id,
		sequence,
		adSystem,
		adTitle,
		impressions,
		creatives,
		errors,
		verifications,
		categories,
	};
}

function parseAdVerifications(parent: Element): AdVerification[] | undefined {
	const adVerificationsEl = parent.querySelector("AdVerifications");
	if (!adVerificationsEl) return undefined;

	const verifications: AdVerification[] = [];
	const verificationEls = directChildren(adVerificationsEl, "Verification");

	for (const vEl of verificationEls) {
		const vendor = vEl.getAttribute("vendor") ?? "";

		let resourceUrl = "";
		let apiFramework: string | undefined;

		const jsResource = vEl.querySelector("JavaScriptResource");
		if (jsResource) {
			resourceUrl = (jsResource.textContent ?? "").trim();
			apiFramework = jsResource.getAttribute("apiFramework") ?? undefined;
		} else {
			const exeResource = vEl.querySelector("ExecutableResource");
			if (exeResource) {
				resourceUrl = (exeResource.textContent ?? "").trim();
				apiFramework = exeResource.getAttribute("apiFramework") ?? undefined;
			}
		}

		const parametersEl = vEl.querySelector("VerificationParameters");
		const parameters = parametersEl
			? (parametersEl.textContent ?? "").trim() || undefined
			: undefined;

		verifications.push({ vendor, resourceUrl, apiFramework, parameters });
	}

	return verifications.length > 0 ? verifications : undefined;
}

function parseCategories(parent: Element): AdCategory[] | undefined {
	const categoryEls = directChildren(parent, "Category");
	if (categoryEls.length === 0) return undefined;

	const categories: AdCategory[] = [];
	for (const catEl of categoryEls) {
		const authority = catEl.getAttribute("authority") ?? "";
		const value = (catEl.textContent ?? "").trim();
		if (value) {
			categories.push({ authority, value });
		}
	}

	return categories.length > 0 ? categories : undefined;
}

function parseCreative(creativeEl: Element): VastCreative {
	const id = creativeEl.getAttribute("id") ?? undefined;
	const sequenceAttr = creativeEl.getAttribute("sequence");
	const sequence = safeInt(sequenceAttr, undefined);

	const linearEl = creativeEl.querySelector("Linear");
	const linear = linearEl ? parseLinear(linearEl) : null;

	const companionAds = parseCompanionAds(creativeEl);

	return { id, sequence, linear, companionAds };
}

function parseLinear(linearEl: Element): VastLinear {
	const durationStr = textContent(linearEl, "Duration");
	const duration = parseDuration(durationStr);

	const skipOffsetStr = linearEl.getAttribute("skipoffset");
	const skipOffset =
		skipOffsetStr !== null ? parseOffset(skipOffsetStr, duration) : undefined;

	const mediaFiles = parseMediaFiles(linearEl);
	const interactiveCreativeFiles = parseInteractiveCreativeFiles(linearEl);
	const trackingEvents = parseTrackingEvents(linearEl);

	const videoClicksEl = linearEl.querySelector("VideoClicks");
	const clickThrough = videoClicksEl
		? textContent(videoClicksEl, "ClickThrough") || undefined
		: undefined;
	const clickTracking = videoClicksEl
		? textContents(videoClicksEl, "ClickTracking")
		: [];

	return {
		duration,
		skipOffset,
		mediaFiles,
		interactiveCreativeFiles,
		trackingEvents,
		clickThrough,
		clickTracking,
	};
}

function parseMediaFiles(linearEl: Element): VastMediaFile[] {
	const mediaFilesEl = linearEl.querySelector("MediaFiles");
	if (!mediaFilesEl) return [];

	const files: VastMediaFile[] = [];
	const mediaFileEls = directChildren(mediaFilesEl, "MediaFile");

	for (const mf of mediaFileEls) {
		const url = (mf.textContent ?? "").trim();
		if (!url) continue;

		const deliveryAttr = mf.getAttribute("delivery");
		files.push({
			url,
			mimeType: mf.getAttribute("type") ?? "",
			width: safeInt(mf.getAttribute("width"), 0),
			height: safeInt(mf.getAttribute("height"), 0),
			bitrate: safeInt(mf.getAttribute("bitrate"), undefined),
			delivery: deliveryAttr === "streaming" ? "streaming" : "progressive",
		});
	}

	return files;
}

function parseInteractiveCreativeFiles(
	linearEl: Element,
): InteractiveCreativeFile[] {
	const mediaFilesEl = linearEl.querySelector("MediaFiles");
	if (!mediaFilesEl) return [];

	const files: InteractiveCreativeFile[] = [];
	const els = directChildren(mediaFilesEl, "InteractiveCreativeFile");

	for (const el of els) {
		const url = (el.textContent ?? "").trim();
		if (!url) continue;

		const apiFramework = el.getAttribute("apiFramework") ?? "";
		const variableDurationAttr = el.getAttribute("variableDuration");
		const variableDuration =
			variableDurationAttr === "true"
				? true
				: variableDurationAttr === "false"
					? false
					: undefined;

		files.push({ url, apiFramework, variableDuration });
	}

	return files;
}

// === CompanionAds Parsing ===

function parseCompanionAds(creativeEl: Element): VastCompanionAds | undefined {
	const companionAdsEl = directChild(creativeEl, "CompanionAds");
	if (!companionAdsEl) return undefined;

	const requiredAttr = companionAdsEl.getAttribute("required");
	const required: CompanionRequired =
		requiredAttr === "all" || requiredAttr === "any" ? requiredAttr : "none";

	const companions: VastCompanionAd[] = [];
	for (const companionEl of directChildren(companionAdsEl, "Companion")) {
		const companion = parseCompanion(companionEl);
		if (companion) companions.push(companion);
	}

	return companions.length > 0 ? { required, companions } : undefined;
}

function parseCompanion(companionEl: Element): VastCompanionAd | null {
	const width = safeInt(companionEl.getAttribute("width"), 0);
	const height = safeInt(companionEl.getAttribute("height"), 0);
	if (width === 0 || height === 0) return null;

	const id = companionEl.getAttribute("id") ?? undefined;
	const assetWidth = safeInt(companionEl.getAttribute("assetWidth"), undefined);
	const assetHeight = safeInt(
		companionEl.getAttribute("assetHeight"),
		undefined,
	);
	const expandedWidth = safeInt(
		companionEl.getAttribute("expandedWidth"),
		undefined,
	);
	const expandedHeight = safeInt(
		companionEl.getAttribute("expandedHeight"),
		undefined,
	);
	const apiFramework = companionEl.getAttribute("apiFramework") ?? undefined;
	const adSlotId = companionEl.getAttribute("adSlotId") ?? undefined;
	const pxratio = safeFloat(companionEl.getAttribute("pxratio"), undefined);
	const renderingModeAttr = companionEl.getAttribute("renderingMode");
	const renderingMode: CompanionRenderingMode | undefined =
		renderingModeAttr === "end-card" || renderingModeAttr === "concurrent"
			? renderingModeAttr
			: renderingModeAttr === "default"
				? "default"
				: undefined;

	const resources: CompanionResource[] = [];
	for (const staticEl of directChildren(companionEl, "StaticResource")) {
		const url = (staticEl.textContent ?? "").trim();
		const creativeType = staticEl.getAttribute("creativeType") ?? "";
		if (url) resources.push({ type: "static", url, creativeType });
	}
	for (const iframeEl of directChildren(companionEl, "IFrameResource")) {
		const url = (iframeEl.textContent ?? "").trim();
		if (url) resources.push({ type: "iframe", url });
	}
	for (const htmlEl of directChildren(companionEl, "HTMLResource")) {
		const content = (htmlEl.textContent ?? "").trim();
		if (content) resources.push({ type: "html", content });
	}

	const clickThrough =
		textContent(companionEl, "CompanionClickThrough") || undefined;
	const clickTracking = textContents(companionEl, "CompanionClickTracking");
	const trackingEvents = parseCompanionTrackingEvents(companionEl);
	const altText = textContent(companionEl, "AltText") || undefined;
	const adParameters = textContent(companionEl, "AdParameters") || undefined;

	return {
		width,
		height,
		id,
		assetWidth,
		assetHeight,
		expandedWidth,
		expandedHeight,
		apiFramework,
		adSlotId,
		pxratio,
		renderingMode,
		resources,
		clickThrough,
		clickTracking,
		trackingEvents,
		altText,
		adParameters,
	};
}

function parseCompanionTrackingEvents(
	companionEl: Element,
): CompanionTrackingEvents {
	const events: CompanionTrackingEvents = { creativeView: [] };
	const trackingEventsEl = companionEl.querySelector("TrackingEvents");
	if (!trackingEventsEl) return events;

	for (const t of trackingEventsEl.querySelectorAll("Tracking")) {
		const eventName = t.getAttribute("event");
		const url = (t.textContent ?? "").trim();
		if (eventName === "creativeView" && url) {
			events.creativeView.push(url);
		}
	}
	return events;
}

const SIMPLE_TRACKING_EVENTS = new Set([
	"start",
	"firstQuartile",
	"midpoint",
	"thirdQuartile",
	"complete",
	"pause",
	"resume",
	"skip",
	"loaded",
	"mute",
	"unmute",
	"rewind",
	"playerExpand",
	"playerCollapse",
	"closeLinear",
	"notUsed",
	"otherAdInteraction",
	"creativeView",
]);

type SimpleTrackingEvent = Exclude<keyof VastTrackingEvents, "progress">;

function parseTrackingEvents(linearEl: Element): VastTrackingEvents {
	const events: VastTrackingEvents = emptyTrackingEvents();

	const trackingEventsEl = linearEl.querySelector("TrackingEvents");
	if (!trackingEventsEl) return events;

	const trackingEls = trackingEventsEl.querySelectorAll("Tracking");
	for (const t of trackingEls) {
		const eventName = t.getAttribute("event");
		const url = (t.textContent ?? "").trim();
		if (!eventName || !url) continue;

		if (eventName === "progress") {
			const offsetStr = t.getAttribute("offset");
			const offset = offsetStr ? parseOffset(offsetStr, 0) : 0;
			events.progress.push({ offset, url });
		} else if (SIMPLE_TRACKING_EVENTS.has(eventName)) {
			events[eventName as SimpleTrackingEvent].push(url);
		}
	}

	return events;
}

// === Helpers ===

/** Parse HH:MM:SS or HH:MM:SS.mmm to seconds */
export function parseDuration(str: string): number {
	if (!str) return 0;
	const parts = str.split(":");
	if (parts.length !== 3) return 0;

	const hours = Number.parseInt(parts[0], 10);
	const minutes = Number.parseInt(parts[1], 10);
	const seconds = Number.parseFloat(parts[2]);

	if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) {
		return 0;
	}

	return hours * 3600 + minutes * 60 + seconds;
}

/** Parse skipoffset — either HH:MM:SS or n% */
function parseOffset(str: string, totalDuration: number): number {
	if (str.endsWith("%")) {
		const pct = Number.parseFloat(str);
		return Number.isNaN(pct) ? 0 : (pct / 100) * totalDuration;
	}
	return parseDuration(str);
}

/** Get direct child elements matching a tag name. Avoids :scope selector issues in XML DOM. */
function directChildren(parent: Element, tagName: string): Element[] {
	const result: Element[] = [];
	for (let i = 0; i < parent.children.length; i++) {
		if (parent.children[i].tagName === tagName) {
			result.push(parent.children[i]);
		}
	}
	return result;
}

/** Get first direct child element matching a tag name. */
function directChild(parent: Element, tagName: string): Element | null {
	for (let i = 0; i < parent.children.length; i++) {
		if (parent.children[i].tagName === tagName) {
			return parent.children[i];
		}
	}
	return null;
}

/** Get text contents of direct children matching a tag name. */
function childrenTextContents(parent: Element, tagName: string): string[] {
	const results: string[] = [];
	for (const el of directChildren(parent, tagName)) {
		const text = (el.textContent ?? "").trim();
		if (text) {
			results.push(text);
		}
	}
	return results;
}

function textContent(parent: Element, selector: string): string {
	const el = parent.querySelector(selector);
	return el ? (el.textContent ?? "").trim() : "";
}

function textContents(parent: Element, selector: string): string[] {
	const els = parent.querySelectorAll(selector);
	const results: string[] = [];
	for (const el of els) {
		const text = (el.textContent ?? "").trim();
		if (text) {
			results.push(text);
		}
	}
	return results;
}

/** Fetch a VAST tag URL. Separated from parsing for testability. */
export async function fetchVast(
	tagUrl: string,
	options?: { timeout?: number | undefined },
): Promise<string> {
	const timeout = options?.timeout ?? 5000;
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch(tagUrl, { signal: controller.signal });
		if (!response.ok) {
			throw new Error(`VAST fetch failed: ${response.status}`);
		}
		return await response.text();
	} finally {
		clearTimeout(timer);
	}
}

// === Wrapper Resolution ===

interface WrapperAd {
	adTagUri: string;
	errors: string[];
	impressions: string[];
	trackingEvents: VastTrackingEvents;
	clickTracking: string[];
	companionAds?: VastCompanionAds | undefined;
	companionClickTracking: string[];
}

/**
 * Resolve a VAST tag URL, following Wrapper redirects until an InLine ad is found.
 * Merges tracking from all Wrappers in the chain into the final InLine ad.
 */
export async function resolveVast(
	tagUrl: string,
	options?: ResolveOptions | undefined,
): Promise<VastResponse> {
	const timeout = options?.timeout ?? 10_000;
	const maxDepth = options?.maxDepth ?? 5;
	const deadline = Date.now() + timeout;
	const visited = new Set<string>();
	const wrapperChain: WrapperAd[] = [];

	let currentUrl = tagUrl;

	for (let depth = 0; depth <= maxDepth; depth++) {
		const remaining = deadline - Date.now();
		if (remaining <= 0) {
			return { version: "", ads: [], errors: ["VAST resolve timeout"] };
		}

		if (visited.has(currentUrl)) {
			return {
				version: "",
				ads: [],
				errors: ["VAST circular reference detected"],
			};
		}
		visited.add(currentUrl);

		let xml: string;
		try {
			xml = await fetchVast(currentUrl, { timeout: remaining });
		} catch (err) {
			return {
				version: "",
				ads: [],
				errors: [err instanceof Error ? err.message : String(err)],
			};
		}

		const response = parseVast(xml);

		if (response.ads.length > 0) {
			return {
				version: response.version,
				ads: response.ads.map((ad) => mergeWrapperIntoAd(ad, wrapperChain)),
				errors: response.errors,
			};
		}

		const wrapper = extractWrapperFromXml(xml);
		if (!wrapper) {
			return response;
		}

		wrapperChain.push(wrapper);
		currentUrl = wrapper.adTagUri;
	}

	return {
		version: "",
		ads: [],
		errors: ["VAST wrapper depth limit exceeded"],
	};
}

function extractWrapperFromXml(xml: string): WrapperAd | null {
	const parser = new DOMParser();
	const doc = parser.parseFromString(xml, "text/xml");
	const vastEl = doc.documentElement;
	if (vastEl.tagName !== "VAST") return null;

	for (const adEl of directChildren(vastEl, "Ad")) {
		const wrapperEl = directChild(adEl, "Wrapper");
		if (!wrapperEl) continue;

		const adTagUri = textContent(wrapperEl, "VASTAdTagURI").trim();
		if (!adTagUri) continue;

		const errors = childrenTextContents(wrapperEl, "Error");
		const impressions = textContents(wrapperEl, "Impression");

		let trackingEvents = emptyTrackingEvents();
		let clickTracking: string[] = [];
		let companionAds: VastCompanionAds | undefined;
		const companionClickTracking: string[] = [];
		const creativesEl = wrapperEl.querySelector("Creatives");
		if (creativesEl) {
			for (const creativeEl of directChildren(creativesEl, "Creative")) {
				const linearEl = creativeEl.querySelector("Linear");
				if (linearEl) {
					trackingEvents = parseTrackingEvents(linearEl);
					const videoClicksEl = linearEl.querySelector("VideoClicks");
					if (videoClicksEl) {
						clickTracking = textContents(videoClicksEl, "ClickTracking");
					}
				}

				const parsed = parseCompanionAds(creativeEl);
				if (parsed) {
					companionAds = parsed;
					for (const c of parsed.companions) {
						companionClickTracking.push(...c.clickTracking);
					}
				}
			}
		}

		return {
			adTagUri,
			errors,
			impressions,
			trackingEvents,
			clickTracking,
			companionAds,
			companionClickTracking,
		};
	}
	return null;
}

function emptyTrackingEvents(): VastTrackingEvents {
	return {
		start: [],
		firstQuartile: [],
		midpoint: [],
		thirdQuartile: [],
		complete: [],
		pause: [],
		resume: [],
		skip: [],
		loaded: [],
		mute: [],
		unmute: [],
		rewind: [],
		playerExpand: [],
		playerCollapse: [],
		closeLinear: [],
		notUsed: [],
		otherAdInteraction: [],
		creativeView: [],
		progress: [],
	};
}

function mergeTrackingEvents(
	wrapperChain: VastTrackingEvents[],
	inline: VastTrackingEvents,
): VastTrackingEvents {
	const result = emptyTrackingEvents();

	for (const key of Object.keys(result) as (keyof VastTrackingEvents)[]) {
		if (key === "progress") continue;
		const arr = result[key] as string[];
		for (const wrapper of wrapperChain) {
			arr.push(...(wrapper[key] as string[]));
		}
		arr.push(...(inline[key] as string[]));
	}

	for (const wrapper of wrapperChain) {
		result.progress.push(...wrapper.progress);
	}
	result.progress.push(...inline.progress);

	return result;
}

function mergeWrapperIntoAd(ad: VastAd, wrapperChain: WrapperAd[]): VastAd {
	if (wrapperChain.length === 0) return ad;

	const mergedErrors = [...wrapperChain.flatMap((w) => w.errors), ...ad.errors];
	const mergedImpressions = [
		...wrapperChain.flatMap((w) => w.impressions),
		...ad.impressions,
	];

	const mergedCreatives = ad.creatives.map((creative) => {
		let merged = creative;

		// Merge linear tracking
		if (creative.linear) {
			merged = {
				...merged,
				linear: {
					...creative.linear,
					trackingEvents: mergeTrackingEvents(
						wrapperChain.map((w) => w.trackingEvents),
						creative.linear.trackingEvents,
					),
					clickTracking: [
						...wrapperChain.flatMap((w) => w.clickTracking),
						...creative.linear.clickTracking,
					],
				},
			};
		}

		// Merge companion ads (VAST 4.2 §2.3.5.2):
		// - InLine companions take precedence
		// - If InLine has none, use wrapper closest to InLine (last in chain)
		// - CompanionClickTracking from wrappers merges into InLine companions
		if (creative.companionAds) {
			const wrapperClickTracking = wrapperChain.flatMap(
				(w) => w.companionClickTracking,
			);
			if (wrapperClickTracking.length > 0) {
				merged = {
					...merged,
					companionAds: {
						...creative.companionAds,
						companions: creative.companionAds.companions.map((c) => ({
							...c,
							clickTracking: [...wrapperClickTracking, ...c.clickTracking],
						})),
					},
				};
			}
		} else {
			for (let i = wrapperChain.length - 1; i >= 0; i--) {
				if (wrapperChain[i].companionAds) {
					merged = {
						...merged,
						companionAds: wrapperChain[i].companionAds,
					};
					break;
				}
			}
		}

		return merged;
	});

	return {
		...ad,
		errors: mergedErrors,
		impressions: mergedImpressions,
		creatives: mergedCreatives,
	};
}

function safeInt(value: string | null, fallback: number): number;
function safeInt(value: string | null, fallback: undefined): number | undefined;
function safeInt(
	value: string | null,
	fallback: number | undefined,
): number | undefined {
	if (value == null) return fallback;
	const n = Number.parseInt(value, 10);
	return Number.isNaN(n) ? fallback : n;
}

function safeFloat(
	value: string | null,
	fallback: undefined,
): number | undefined;
function safeFloat(
	value: string | null,
	fallback: number | undefined,
): number | undefined {
	if (value == null) return fallback;
	const n = Number.parseFloat(value);
	return Number.isNaN(n) ? fallback : n;
}
