import type {
	VastAd,
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
		return { version: "", ads: [], errors: [] };
	}

	const vastEl = doc.documentElement;
	if (vastEl.tagName !== "VAST") {
		return { version: "", ads: [], errors: [] };
	}

	const version = vastEl.getAttribute("version") ?? "";

	// Root-level errors (no-ad response)
	const rootErrors = textContents(vastEl, ":scope > Error");

	const adEls = vastEl.querySelectorAll(":scope > Ad");
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
	const inlineEl = adEl.querySelector(":scope > InLine");
	if (!inlineEl) {
		// Wrapper ads not supported in v0.1
		return null;
	}

	const id = adEl.getAttribute("id") ?? "";
	const sequenceAttr = adEl.getAttribute("sequence");
	const sequence =
		sequenceAttr !== null ? Number.parseInt(sequenceAttr, 10) : undefined;

	const adSystem = textContent(inlineEl, "AdSystem");
	const adTitle = textContent(inlineEl, "AdTitle");
	const impressions = textContents(inlineEl, "Impression");
	const errors = textContents(inlineEl, ":scope > Error");

	const creativesEl = inlineEl.querySelector("Creatives");
	const creatives: VastCreative[] = [];

	if (creativesEl) {
		const creativeEls = creativesEl.querySelectorAll(":scope > Creative");
		for (const creativeEl of creativeEls) {
			creatives.push(parseCreative(creativeEl));
		}
	}

	return {
		id,
		sequence,
		adSystem,
		adTitle,
		impressions,
		creatives,
		errors,
	};
}

function parseCreative(creativeEl: Element): VastCreative {
	const id = creativeEl.getAttribute("id") ?? undefined;
	const sequenceAttr = creativeEl.getAttribute("sequence");
	const sequence =
		sequenceAttr !== null ? Number.parseInt(sequenceAttr, 10) : undefined;

	const linearEl = creativeEl.querySelector("Linear");
	const linear = linearEl ? parseLinear(linearEl) : null;

	return { id, sequence, linear };
}

function parseLinear(linearEl: Element): VastLinear {
	const durationStr = textContent(linearEl, "Duration");
	const duration = parseDuration(durationStr);

	const skipOffsetStr = linearEl.getAttribute("skipoffset");
	const skipOffset =
		skipOffsetStr !== null ? parseOffset(skipOffsetStr, duration) : undefined;

	const mediaFiles = parseMediaFiles(linearEl);
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
		trackingEvents,
		clickThrough,
		clickTracking,
	};
}

function parseMediaFiles(linearEl: Element): VastMediaFile[] {
	const mediaFilesEl = linearEl.querySelector("MediaFiles");
	if (!mediaFilesEl) return [];

	const files: VastMediaFile[] = [];
	const mediaFileEls = mediaFilesEl.querySelectorAll(":scope > MediaFile");

	for (const mf of mediaFileEls) {
		const url = (mf.textContent ?? "").trim();
		if (!url) continue;

		files.push({
			url,
			mimeType: mf.getAttribute("type") ?? "",
			width: Number.parseInt(mf.getAttribute("width") ?? "0", 10),
			height: Number.parseInt(mf.getAttribute("height") ?? "0", 10),
			bitrate: mf.getAttribute("bitrate")
				? Number.parseInt(mf.getAttribute("bitrate")!, 10)
				: undefined,
			delivery:
				(mf.getAttribute("delivery") as "progressive" | "streaming") ??
				"progressive",
		});
	}

	return files;
}

function parseTrackingEvents(linearEl: Element): VastTrackingEvents {
	const events: VastTrackingEvents = {
		start: [],
		firstQuartile: [],
		midpoint: [],
		thirdQuartile: [],
		complete: [],
		pause: [],
		resume: [],
		skip: [],
	};

	const trackingEventsEl = linearEl.querySelector("TrackingEvents");
	if (!trackingEventsEl) return events;

	const trackingEls = trackingEventsEl.querySelectorAll("Tracking");
	for (const t of trackingEls) {
		const eventName = t.getAttribute("event");
		const url = (t.textContent ?? "").trim();
		if (!eventName || !url) continue;

		if (eventName in events) {
			events[eventName as keyof VastTrackingEvents].push(url);
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
