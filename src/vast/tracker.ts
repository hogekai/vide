import type { VastCompanionAd, VastNonLinearAds } from "./types.js";

/**
 * Fire error tracking URLs, replacing the [ERRORCODE] macro with the given code.
 * Per VAST 4.2 Section 2.3.6.
 */
export function trackError(urls: string[], errorCode: number): void {
	const replaced = urls.map((url) =>
		url.replace("[ERRORCODE]", String(errorCode)),
	);
	track(replaced);
}

/** Fire-and-forget tracking. Response is ignored. */
export function track(urls: string[]): void {
	for (const url of urls) {
		if (
			typeof navigator !== "undefined" &&
			typeof navigator.sendBeacon === "function"
		) {
			navigator.sendBeacon(url);
		} else {
			new Image().src = url;
		}
	}
}

export type QuartileEvent =
	| "start"
	| "firstQuartile"
	| "midpoint"
	| "thirdQuartile"
	| "complete";

/** Determine which quartile the current playback position represents. */
export function getQuartile(
	currentTime: number,
	duration: number,
): QuartileEvent | null {
	if (duration <= 0) return null;

	const pct = currentTime / duration;

	if (pct >= 1) return "complete";
	if (pct >= 0.75) return "thirdQuartile";
	if (pct >= 0.5) return "midpoint";
	if (pct >= 0.25) return "firstQuartile";
	if (currentTime >= 0) return "start";

	return null;
}

/**
 * Create a quartile tracker that fires each event only once.
 * Returns a function to call on each timeupdate.
 */
export function createQuartileTracker(
	duration: number,
	onQuartile: (event: QuartileEvent) => void,
): (currentTime: number) => void {
	const fired = new Set<QuartileEvent>();

	const order: QuartileEvent[] = [
		"start",
		"firstQuartile",
		"midpoint",
		"thirdQuartile",
		"complete",
	];

	return (currentTime: number) => {
		const quartile = getQuartile(currentTime, duration);
		if (!quartile || fired.has(quartile)) return;

		// Fire all quartiles up to and including the current one.
		// Catches up missed quartiles on seek (e.g., jump from 0 to 60%
		// fires start, firstQuartile, midpoint).
		const targetIdx = order.indexOf(quartile);
		for (let i = 0; i <= targetIdx; i++) {
			const q = order[i];
			if (!fired.has(q)) {
				fired.add(q);
				onQuartile(q);
			}
		}
	};
}

/** Fire creativeView tracking beacons for a companion ad.
 *  Call when the companion is actually displayed to the user. */
export function trackCompanionView(companion: VastCompanionAd): void {
	track(companion.trackingEvents.creativeView);
}

/** Fire a tracking event for a NonLinear ad container.
 *  Looks up the event name in the container-level trackingEvents. */
export function trackNonLinear(
	nonLinearAds: VastNonLinearAds,
	event: string,
): void {
	const urls = nonLinearAds.trackingEvents[event];
	if (urls) track(urls);
}
