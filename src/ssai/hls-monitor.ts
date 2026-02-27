import type { AdBreakMetadata, MetadataParser, RawMetadata } from "./types.js";

/** Minimal hls.js interface — avoids compile-time dependency. */
interface HlsLike {
	on(event: string, handler: (...args: unknown[]) => void): void;
	off(event: string, handler: (...args: unknown[]) => void): void;
	levels?: Array<{ details?: LevelDetails | null }>;
	currentLevel?: number;
}

interface LevelDetails {
	dateRanges: Record<string, { attr: Record<string, string> }>;
	fragments: Array<{ programDateTime: number | null; start: number }>;
}

interface LevelUpdatedData {
	details: LevelDetails;
}

interface FragParsingMetadataData {
	samples: Array<{
		type: string;
		data: Uint8Array;
		pts: number;
		dts: number;
	}>;
}

const HLS_INTERSTITIAL_CLASS = "com.apple.hls.interstitial";
const SCTE35_OUT_ATTR = "SCTE35-OUT";

/**
 * Parse a DATERANGE into an ad break. Returns null if not an ad marker.
 *
 * @param pdtAnchorMs - The PROGRAM-DATE-TIME epoch (ms) of the first
 *   fragment. When provided, START-DATE is converted to a stream-relative
 *   offset so it can be compared against `currentTime`.
 */
export function parseDateRange(
	attributes: Record<string, string>,
	pdtAnchorMs?: number,
): AdBreakMetadata | null {
	const id = attributes.ID;
	if (!id) return null;

	const className = attributes.CLASS;
	const isInterstitial = className === HLS_INTERSTITIAL_CLASS;
	const isScte35 = SCTE35_OUT_ATTR in attributes;

	if (!isInterstitial && !isScte35) return null;

	const startDate = attributes["START-DATE"];
	const durationStr = attributes.DURATION ?? attributes["PLANNED-DURATION"];

	let startTime = 0;
	if (startDate) {
		const absMs = new Date(startDate).getTime();
		startTime =
			pdtAnchorMs != null ? (absMs - pdtAnchorMs) / 1000 : absMs / 1000;
	}
	const duration = durationStr ? Number.parseFloat(durationStr) : 0;

	return { id, startTime, duration, customData: { ...attributes } };
}

function tryDecodeUtf8(data: Uint8Array): string | null {
	try {
		return new TextDecoder().decode(data);
	} catch {
		return null;
	}
}

/** Parse ID3 timed metadata samples. Returns null if no SCTE-35 signal. */
export function parseId3Samples(
	samples: Array<{ type: string; data: Uint8Array }>,
	pts: number,
): AdBreakMetadata | null {
	for (const sample of samples) {
		const text = tryDecodeUtf8(sample.data);
		if (text?.includes("SCTE35")) {
			return {
				id: `id3-${pts}`,
				startTime: pts,
				duration: 0,
				customData: { raw: text },
			};
		}
	}
	return null;
}

/**
 * Subscribe to hls.js metadata events and invoke onMetadata
 * for each parsed ad break. Returns a cleanup function.
 */
export function createHlsMonitor(
	hls: HlsLike,
	parser: MetadataParser | undefined,
	onMetadata: (breaks: AdBreakMetadata[]) => void,
): () => void {
	const seenDateRanges = new Set<string>();

	function processDetails(details: LevelDetails): void {
		const dateranges = details?.dateRanges;
		if (!dateranges) return;

		// Derive the PDT anchor from the first fragment that carries a
		// programDateTime value. This lets us convert absolute START-DATE
		// values into stream-relative offsets.
		let pdtAnchorMs: number | undefined;
		const frags = details?.fragments;
		if (frags) {
			for (const f of frags) {
				if (f.programDateTime != null) {
					pdtAnchorMs = f.programDateTime - f.start * 1000;
					break;
				}
			}
		}

		for (const [key, dr] of Object.entries(dateranges)) {
			if (seenDateRanges.has(key)) continue;
			seenDateRanges.add(key);

			const attrs = dr.attr ?? (dr as unknown as Record<string, string>);
			if (parser) {
				const raw: RawMetadata = {
					source: "daterange",
					attributes: attrs as Record<string, string>,
				};
				const results = parser(raw);
				if (results.length > 0) onMetadata(results);
			} else {
				const result = parseDateRange(
					attrs as Record<string, string>,
					pdtAnchorMs,
				);
				if (result) onMetadata([result]);
			}
		}
	}

	function onLevelUpdated(_event: unknown, data: unknown): void {
		const d = data as LevelUpdatedData;
		if (d?.details) processDetails(d.details);
	}

	function onFragParsingMetadata(_event: unknown, data: unknown): void {
		const d = data as FragParsingMetadataData;
		if (!d?.samples?.length) return;

		const pts = d.samples[0]?.pts ?? 0;

		if (parser) {
			const raw: RawMetadata = {
				source: "id3",
				samples: d.samples.map((s) => ({ type: s.type, data: s.data })),
			};
			const results = parser(raw);
			if (results.length > 0) onMetadata(results);
		} else {
			const simpleSamples = d.samples.map((s) => ({
				type: s.type,
				data: s.data,
			}));
			const result = parseId3Samples(simpleSamples, pts);
			if (result) onMetadata([result]);
		}
	}

	// hls.js event name strings (avoids importing Hls.Events)
	hls.on("hlsLevelUpdated", onLevelUpdated);
	hls.on("hlsFragParsingMetadata", onFragParsingMetadata);

	// Process any level details that were already loaded before we
	// attached (race between async hls.js init and SSAI plugin attach).
	if (hls.levels && hls.currentLevel != null && hls.currentLevel >= 0) {
		const existing = hls.levels[hls.currentLevel]?.details;
		if (existing) processDetails(existing);
	}

	return () => {
		hls.off("hlsLevelUpdated", onLevelUpdated);
		hls.off("hlsFragParsingMetadata", onFragParsingMetadata);
	};
}
