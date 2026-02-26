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

	return (currentTime: number) => {
		const quartile = getQuartile(currentTime, duration);
		if (quartile && !fired.has(quartile)) {
			fired.add(quartile);
			// Also fire any earlier quartiles that haven't been fired
			// (e.g., if we jump from 0 to 60%, fire start, firstQuartile, midpoint)
			const order: QuartileEvent[] = [
				"start",
				"firstQuartile",
				"midpoint",
				"thirdQuartile",
				"complete",
			];
			for (const q of order) {
				if (fired.has(q)) continue;
				const idx = order.indexOf(q);
				const quartileIdx = order.indexOf(quartile);
				if (idx <= quartileIdx) {
					fired.add(q);
					onQuartile(q);
				}
			}
			if (!fired.has(quartile)) {
				fired.add(quartile);
			}
			onQuartile(quartile);
		}
	};
}
