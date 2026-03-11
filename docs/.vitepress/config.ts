import { defineConfig } from "vitepress";

export default defineConfig({
	title: "vide",
	description: "Modular video player. Use only what you need.",
	base: "/vide/",
	lang: "en-US",

	head: [
		["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
		[
			"link",
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossorigin: "",
			},
		],
		[
			"link",
			{
				href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Nunito:wght@400;500;600;700&display=swap",
				rel: "stylesheet",
			},
		],
	],

	themeConfig: {
		nav: [
			{ text: "Guide", link: "/getting-started" },
			{ text: "Plugins", link: "/plugins/hls" },
			{ text: "API", link: "/api-reference/" },
		],

		sidebar: [
			{
				text: "Getting Started",
				items: [
					{ text: "Getting Started", link: "/getting-started" },
					{ text: "CDN / No Build Tool", link: "/cdn" },
					{ text: "Browser Support", link: "/browser-support" },
				],
			},
			{
				text: "Frameworks",
				items: [
					{ text: "React", link: "/frameworks/react" },
					{ text: "Vue", link: "/frameworks/vue" },
					{ text: "Svelte", link: "/frameworks/svelte" },
				],
			},
			{
				text: "Streaming & Playback",
				items: [
					{ text: "HLS", link: "/plugins/hls" },
					{ text: "DASH", link: "/plugins/dash" },
					{ text: "DRM", link: "/plugins/drm" },
					{ text: "Audio", link: "/audio" },
					{ text: "Text Tracks", link: "/guides/text-tracks" },
				],
			},
			{
				text: "Advertising",
				items: [
					{ text: "Ads Overview", link: "/guides/ads-setup" },
					{ text: "VAST", link: "/plugins/vast" },
					{ text: "VMAP", link: "/plugins/vmap" },
					{ text: "SSAI", link: "/plugins/ssai" },
					{ text: "IMA", link: "/plugins/ima" },
					{ text: "OMID", link: "/plugins/omid" },
					{ text: "SIMID", link: "/plugins/simid" },
					{ text: "VPAID", link: "/plugins/vpaid" },
				],
			},
			{
				text: "UI",
				items: [
					{ text: "UI Components", link: "/plugins/ui" },
				],
			},
			{
				text: "Advanced",
				items: [
					{ text: "Custom Plugin", link: "/guides/custom-plugin" },
					{ text: "Troubleshooting", link: "/guides/troubleshooting" },
					{
						text: "Migration from video.js",
						link: "/guides/migration-from-videojs",
					},
				],
			},
			{
				text: "Resources",
				items: [
					{ text: "Playground", link: "/demo" },
					{ text: "API Overview", link: "/api-overview" },
					{ text: "API Reference", link: "/api-reference/" },
				],
			},
		],

		socialLinks: [{ icon: "github", link: "https://github.com/hogekai/vide" }],

		search: {
			provider: "local",
		},
	},
});
