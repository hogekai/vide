import type { AdBreakMetadata, MetadataParser, RawMetadata } from "./types.js";

/** Minimal dash.js interface — avoids compile-time dependency. */
interface DashPlayerLike {
	on(event: string, handler: (e: unknown) => void): void;
	off(event: string, handler: (e: unknown) => void): void;
}

interface DashEventStreamEvent {
	event: {
		schemeIdUri: string;
		value: string;
		calculatedPresentationTime: number;
		duration: number;
		messageData?: string;
		id?: string;
	};
}

const SCTE35_SCHEME = "urn:scte:scte35:2013:xml";
const SCTE35_SCHEME_BIN = "urn:scte:scte35:2014:xml+bin";

/** Parse a dash.js EventStream event. Returns null if not an ad marker. */
export function parseEventStream(
	schemeIdUri: string,
	value: string,
	startTime: number,
	duration: number,
	messageData?: string,
	id?: string,
): AdBreakMetadata | null {
	const isScte35 =
		schemeIdUri === SCTE35_SCHEME ||
		schemeIdUri === SCTE35_SCHEME_BIN ||
		schemeIdUri.startsWith("urn:scte:scte35:");

	if (!isScte35) return null;

	return {
		id: id ?? `dash-event-${startTime}`,
		startTime,
		duration,
		customData: {
			schemeIdUri,
			value,
			...(messageData ? { messageData } : {}),
		},
	};
}

/**
 * Subscribe to dash.js EventStream events and invoke onMetadata
 * for each parsed ad break. Returns a cleanup function.
 */
export function createDashMonitor(
	dashPlayer: DashPlayerLike,
	parser: MetadataParser | undefined,
	onMetadata: (breaks: AdBreakMetadata[]) => void,
): () => void {
	function onEvent(e: unknown): void {
		const ev = e as DashEventStreamEvent;
		const event = ev?.event;
		if (!event) return;

		if (parser) {
			const raw: RawMetadata = {
				source: "eventstream",
				schemeIdUri: event.schemeIdUri,
				value: event.value,
				startTime: event.calculatedPresentationTime,
				duration: event.duration,
				messageData: event.messageData,
			};
			const results = parser(raw);
			if (results.length > 0) onMetadata(results);
		} else {
			const result = parseEventStream(
				event.schemeIdUri,
				event.value,
				event.calculatedPresentationTime,
				event.duration,
				event.messageData,
				event.id,
			);
			if (result) onMetadata([result]);
		}
	}

	dashPlayer.on("eventModeOnReceive", onEvent);
	dashPlayer.on("eventModeOnStart", onEvent);

	return () => {
		dashPlayer.off("eventModeOnReceive", onEvent);
		dashPlayer.off("eventModeOnStart", onEvent);
	};
}
