/** VAST-equivalent tracking URL map for SSAI ad breaks. */
export interface AdTrackingMap {
	impression?: string[];
	start?: string[];
	firstQuartile?: string[];
	midpoint?: string[];
	thirdQuartile?: string[];
	complete?: string[];
	pause?: string[];
	resume?: string[];
	skip?: string[];
}

/** Parsed ad break metadata from stream signals. */
export interface AdBreakMetadata {
	id: string;
	/** Absolute start time in seconds relative to stream timeline. */
	startTime: number;
	/** Duration of the ad break in seconds. */
	duration: number;
	/** Timing-specific tracking URLs. */
	tracking?: AdTrackingMap;
	clickThrough?: string;
	customData?: Record<string, string>;
}

/** Discriminated union of raw metadata from different stream sources. */
export type RawMetadata =
	| { source: "daterange"; attributes: Record<string, string> }
	| {
			source: "id3";
			samples: Array<{ type: string; data: Uint8Array }>;
	  }
	| {
			source: "eventstream";
			schemeIdUri: string;
			value: string;
			startTime: number;
			duration: number;
			messageData?: string | undefined;
	  };

/** Custom parser: receives raw metadata, returns zero or more ad breaks. */
export type MetadataParser = (raw: RawMetadata) => AdBreakMetadata[];

export interface SsaiPluginOptions {
	/** Custom metadata parser. Overrides default auto-detection. */
	parser?: MetadataParser;
	/** Tolerance in seconds for time-based ad break matching. Default: 0.5. */
	tolerance?: number;
}
