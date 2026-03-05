export interface PluginToggle {
	id: string;
	label: string;
	enabled: boolean;
	locked?: boolean;
	requires?: string[];
}

export interface PlaygroundPreset {
	id: string;
	label: string;
	plugins: PluginToggle[];
	sourceUrl: string;
	sourceType: "hls" | "dash" | "mp4";
}

const VAST_TAG_URL =
	"https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_preroll_skippable&sz=640x480&ciu_szs=300x250,728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=";

export const PRESETS: PlaygroundPreset[] = [
	{
		id: "hls-ui",
		label: "HLS + UI",
		sourceUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
		sourceType: "hls",
		plugins: [
			{ id: "hls", label: "HLS", enabled: true, locked: true },
			{ id: "ui", label: "UI", enabled: true },
		],
	},
	{
		id: "dash-ui",
		label: "DASH + UI",
		sourceUrl: "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd",
		sourceType: "dash",
		plugins: [
			{ id: "dash", label: "DASH", enabled: true, locked: true },
			{ id: "ui", label: "UI", enabled: true },
		],
	},
	{
		id: "hls-vast",
		label: "HLS + VAST Pre-Roll",
		sourceUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
		sourceType: "hls",
		plugins: [
			{ id: "hls", label: "HLS", enabled: true, locked: true },
			{ id: "ui", label: "UI", enabled: true, locked: true },
			{ id: "vast", label: "VAST", enabled: true, locked: true },
		],
	},
	{
		id: "mp4",
		label: "MP4 (No Streaming)",
		sourceUrl:
			"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
		sourceType: "mp4",
		plugins: [{ id: "ui", label: "UI", enabled: true }],
	},
	{
		id: "custom",
		label: "Custom",
		sourceUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
		sourceType: "hls",
		plugins: [
			{ id: "hls", label: "HLS", enabled: true },
			{ id: "dash", label: "DASH", enabled: false },
			{ id: "ui", label: "UI", enabled: true },
			{ id: "vast", label: "VAST", enabled: false },
			{ id: "ssai", label: "SSAI", enabled: false, requires: ["hls"] },
		],
	},
];

export const DEFAULT_VAST_TAG_URL = VAST_TAG_URL;
