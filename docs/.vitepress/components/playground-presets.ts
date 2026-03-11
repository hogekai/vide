export interface PluginToggle {
	id: string;
	label: string;
	enabled: boolean;
	locked?: boolean;
	requires?: string[];
	excludes?: string[];
	gzipSize?: string;
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
			{
				id: "hls",
				label: "HLS",
				enabled: true,
				locked: true,
				gzipSize: "1.4 KB",
			},
			{ id: "ui", label: "UI", enabled: true, gzipSize: "5.7 KB" },
		],
	},
	{
		id: "dash-ui",
		label: "DASH + UI",
		sourceUrl: "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd",
		sourceType: "dash",
		plugins: [
			{
				id: "dash",
				label: "DASH",
				enabled: true,
				locked: true,
				gzipSize: "1.4 KB",
			},
			{ id: "ui", label: "UI", enabled: true, gzipSize: "5.7 KB" },
		],
	},
	{
		id: "hls-vast",
		label: "HLS + VAST Pre-Roll",
		sourceUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
		sourceType: "hls",
		plugins: [
			{
				id: "hls",
				label: "HLS",
				enabled: true,
				locked: true,
				gzipSize: "1.4 KB",
			},
			{
				id: "ui",
				label: "UI",
				enabled: true,
				locked: true,
				gzipSize: "5.7 KB",
			},
			{
				id: "vast",
				label: "VAST",
				enabled: true,
				locked: true,
				gzipSize: "7.9 KB",
			},
		],
	},
	{
		id: "hls-ima",
		label: "HLS + IMA",
		sourceUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
		sourceType: "hls",
		plugins: [
			{
				id: "hls",
				label: "HLS",
				enabled: true,
				locked: true,
				gzipSize: "1.4 KB",
			},
			{
				id: "ui",
				label: "UI",
				enabled: true,
				locked: true,
				gzipSize: "5.7 KB",
			},
			{
				id: "ima",
				label: "IMA",
				enabled: true,
				locked: true,
				gzipSize: "3.4 KB",
			},
		],
	},
	{
		id: "hls-drm",
		label: "HLS + DRM",
		sourceUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
		sourceType: "hls",
		plugins: [
			{
				id: "hls",
				label: "HLS",
				enabled: true,
				locked: true,
				gzipSize: "1.4 KB",
			},
			{ id: "ui", label: "UI", enabled: true, gzipSize: "5.7 KB" },
			{
				id: "drm",
				label: "DRM",
				enabled: true,
				locked: true,
				requires: ["hls", "dash"],
				gzipSize: "2.6 KB",
			},
		],
	},
	{
		id: "hls-ssai",
		label: "HLS + SSAI",
		sourceUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
		sourceType: "hls",
		plugins: [
			{
				id: "hls",
				label: "HLS",
				enabled: true,
				locked: true,
				gzipSize: "1.4 KB",
			},
			{ id: "ui", label: "UI", enabled: true, gzipSize: "5.7 KB" },
			{
				id: "ssai",
				label: "SSAI",
				enabled: true,
				locked: true,
				requires: ["hls"],
				gzipSize: "2.3 KB",
			},
		],
	},
	{
		id: "mp4",
		label: "MP4 (No Streaming)",
		sourceUrl:
			"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
		sourceType: "mp4",
		plugins: [{ id: "ui", label: "UI", enabled: true, gzipSize: "5.7 KB" }],
	},
	{
		id: "custom",
		label: "Custom",
		sourceUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
		sourceType: "hls",
		plugins: [
			{ id: "hls", label: "HLS", enabled: true, gzipSize: "1.4 KB" },
			{ id: "dash", label: "DASH", enabled: false, gzipSize: "1.4 KB" },
			{ id: "ui", label: "UI", enabled: true, gzipSize: "5.7 KB" },
			{ id: "vast", label: "VAST", enabled: false, gzipSize: "7.9 KB" },
			{ id: "vmap", label: "VMAP", enabled: false, gzipSize: "8.8 KB" },
			{
				id: "ima",
				label: "IMA",
				enabled: false,
				excludes: ["vast", "vmap"],
				gzipSize: "3.4 KB",
			},
			{
				id: "drm",
				label: "DRM",
				enabled: false,
				requires: ["hls", "dash"],
				gzipSize: "2.6 KB",
			},
			{
				id: "ssai",
				label: "SSAI",
				enabled: false,
				requires: ["hls"],
				gzipSize: "2.3 KB",
			},
			{
				id: "omid",
				label: "OMID",
				enabled: false,
				requires: ["vast", "vmap"],
				gzipSize: "1.7 KB",
			},
			{
				id: "simid",
				label: "SIMID",
				enabled: false,
				requires: ["vast", "vmap"],
				gzipSize: "2.4 KB",
			},
			{
				id: "vpaid",
				label: "VPAID",
				enabled: false,
				requires: ["vast", "vmap"],
				gzipSize: "1.8 KB",
			},
		],
	},
];

export const UI_COMPONENT_NAMES = [
	"play",
	"progress",
	"time",
	"volume",
	"fullscreen",
	"loader",
	"error",
	"bigplay",
	"poster",
	"ad-countdown",
	"ad-skip",
	"ad-overlay",
	"ad-label",
	"ad-learn-more",
	"keyboard",
	"clickplay",
	"autohide",
] as const;

export const DEFAULT_VAST_TAG_URL = VAST_TAG_URL;
