import type { VastMediaFile } from "./types.js";

/** Hints for context-aware media selection. All fields optional. */
export interface MediaSelectionHints {
	/** Player element width in CSS pixels. */
	width?: number;
	/** Player element height in CSS pixels. */
	height?: number;
	/** Device pixel ratio (e.g. 2 for Retina). Defaults to 1. */
	devicePixelRatio?: number;
	/** Maximum acceptable bitrate in kbps (e.g. from network conditions). */
	maxBitrate?: number;
	/** Preferred delivery method. */
	delivery?: "progressive" | "streaming";
}

function mimeScore(mime: string): number {
	if (mime === "video/mp4") return 3;
	if (mime === "video/webm") return 2;
	if (mime === "application/x-mpegURL" || mime === "application/dash+xml")
		return 1;
	return 0;
}

function resolutionScore(
	fileHeight: number,
	hintsHeight: number | undefined,
): number {
	if (!hintsHeight || fileHeight <= 0) return 5;

	const ratio = fileHeight / hintsHeight;

	if (ratio >= 0.8 && ratio <= 1.5) {
		// Sweet spot — close to player size
		return 10 - Math.abs(1 - ratio) * 5;
	}
	if (ratio > 1.5) {
		// Too large — wastes bandwidth, mild penalty
		return Math.max(0, 7 - (ratio - 1.5) * 3);
	}
	// Too small — visible quality loss, heavier penalty
	return Math.max(0, 5 - (0.8 - ratio) * 10);
}

function bitrateScore(
	fileBitrate: number | undefined,
	maxBitrate: number | undefined,
	maxInSet: number,
): number {
	const br = fileBitrate ?? 0;
	if (br === 0) return 5;

	if (maxBitrate != null) {
		if (br <= maxBitrate) return (br / maxBitrate) * 10;
		return Math.max(0, 5 - ((br - maxBitrate) / maxBitrate) * 10);
	}

	return maxInSet === 0 ? 5 : (br / maxInSet) * 10;
}

function deliveryScore(
	fileDelivery: string,
	preferred: "progressive" | "streaming" | undefined,
): number {
	const target = preferred ?? "progressive";
	return fileDelivery === target ? 1 : 0;
}

/**
 * Select the best media file using a multi-factor scoring algorithm.
 *
 * Scoring priority: MIME type > resolution fit > bitrate > delivery method.
 * Pass optional `hints` for context-aware selection (player size, bandwidth cap).
 * Without hints, behavior is equivalent to the classic mp4-prefer + highest-bitrate logic.
 */
export function selectMediaFile(
	files: VastMediaFile[],
	hints?: MediaSelectionHints,
): { url: string; mimeType: string } | null {
	if (files.length === 0) return null;

	const playable = files.filter((f) => f.apiFramework !== "VPAID");
	if (playable.length === 0) return null;

	const maxInSet = Math.max(...playable.map((f) => f.bitrate ?? 0), 1);
	const dpr = hints?.devicePixelRatio ?? 1;
	const effectiveHeight =
		hints?.height != null ? hints.height * dpr : undefined;

	let best: VastMediaFile | null = null;
	let bestScore = -1;

	for (const f of playable) {
		const score =
			mimeScore(f.mimeType) * 1000 +
			resolutionScore(f.height, effectiveHeight) * 100 +
			bitrateScore(f.bitrate, hints?.maxBitrate, maxInSet) * 10 +
			deliveryScore(f.delivery, hints?.delivery);

		if (score > bestScore) {
			bestScore = score;
			best = f;
		}
	}

	return best ? { url: best.url, mimeType: best.mimeType } : null;
}
