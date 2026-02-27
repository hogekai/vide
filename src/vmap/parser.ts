import type {
	AdBreak,
	AdBreakTimeOffset,
	AdSource,
	VmapResponse,
} from "./types.js";

/**
 * Parse a VMAP XML string into a VmapResponse object.
 * Pure function — no side effects, no network access.
 */
export function parseVmap(xml: string): VmapResponse {
	const parser = new DOMParser();
	const doc = parser.parseFromString(xml, "text/xml");

	const parseError = doc.querySelector("parsererror");
	if (parseError) {
		return { version: "", adBreaks: [] };
	}

	const root = doc.documentElement;
	const rootName = root.localName || root.tagName;
	if (rootName !== "VMAP") {
		return { version: "", adBreaks: [] };
	}

	const version = root.getAttribute("version") ?? "";

	const adBreaks: AdBreak[] = [];
	for (let i = 0; i < root.children.length; i++) {
		const child = root.children[i];
		const childName = child.localName || child.tagName;
		if (childName === "AdBreak") {
			const adBreak = parseAdBreak(child);
			if (adBreak) {
				adBreaks.push(adBreak);
			}
		}
	}

	return { version, adBreaks };
}

function parseAdBreak(el: Element): AdBreak | null {
	const timeOffsetStr = el.getAttribute("timeOffset");
	if (!timeOffsetStr) return null;

	const timeOffset = parseTimeOffset(timeOffsetStr);
	const breakTypeAttr = el.getAttribute("breakType");
	const breakType: AdBreak["breakType"] =
		breakTypeAttr === "nonlinear"
			? "nonlinear"
			: breakTypeAttr === "display"
				? "display"
				: "linear";
	const breakId = el.getAttribute("breakId") ?? undefined;

	let adSource: AdSource | null = null;
	for (let i = 0; i < el.children.length; i++) {
		const child = el.children[i];
		const name = child.localName || child.tagName;
		if (name === "AdSource") {
			adSource = parseAdSource(child);
			break;
		}
	}

	return { timeOffset, breakType, breakId, adSource };
}

function parseAdSource(el: Element): AdSource {
	const id = el.getAttribute("id") ?? undefined;
	const allowMultipleAdsAttr = el.getAttribute("allowMultipleAds");
	const allowMultipleAds =
		allowMultipleAdsAttr != null ? allowMultipleAdsAttr === "true" : undefined;
	const followRedirectsAttr = el.getAttribute("followRedirects");
	const followRedirects =
		followRedirectsAttr != null ? followRedirectsAttr === "true" : undefined;

	let vastData: string | undefined;
	let vastUrl: string | undefined;

	for (let i = 0; i < el.children.length; i++) {
		const child = el.children[i];
		const name = child.localName || child.tagName;
		if (name === "VASTAdData") {
			const vastEl = child.querySelector("VAST");
			if (vastEl) {
				vastData = new XMLSerializer().serializeToString(vastEl);
			}
		} else if (name === "AdTagURI") {
			vastUrl = (child.textContent ?? "").trim();
		}
	}

	return { id, allowMultipleAds, followRedirects, vastUrl, vastData };
}

export function parseTimeOffset(str: string): AdBreakTimeOffset {
	if (str === "start") return { type: "start" };
	if (str === "end") return { type: "end" };
	if (str.endsWith("%")) {
		const pct = Number.parseFloat(str);
		return Number.isNaN(pct)
			? { type: "time", seconds: 0 }
			: { type: "percentage", pct };
	}
	return { type: "time", seconds: parseHms(str) };
}

/** Parse HH:MM:SS or HH:MM:SS.mmm to seconds. */
function parseHms(str: string): number {
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
