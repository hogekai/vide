import { defineConfig } from "vitepress";

export default defineConfig({
	title: "vide",
	description: "Modular video player. Use only what you need.",

	themeConfig: {
		nav: [
			{ text: "Guide", link: "/getting-started" },
			{ text: "Plugins", link: "/plugins/hls" },
			{ text: "API", link: "/api/reference" },
		],

		sidebar: [
			{
				text: "Introduction",
				items: [
					{ text: "Getting Started", link: "/getting-started" },
					{ text: "Browser Support", link: "/browser-support" },
				],
			},
			{
				text: "Plugins",
				items: [
					{ text: "HLS", link: "/plugins/hls" },
					{ text: "DASH", link: "/plugins/dash" },
					{ text: "DRM", link: "/plugins/drm" },
					{ text: "SSAI", link: "/plugins/ssai" },
					{ text: "VAST", link: "/plugins/vast" },
					{ text: "VMAP", link: "/plugins/vmap" },
					{ text: "UI", link: "/plugins/ui" },
					{ text: "OMID", link: "/plugins/omid" },
					{ text: "SIMID", link: "/plugins/simid" },
				],
			},
			{
				text: "Guides",
				items: [
					{ text: "Ads Setup", link: "/guides/ads-setup" },
					{ text: "Custom Plugin", link: "/guides/custom-plugin" },
					{
						text: "Migration from video.js",
						link: "/guides/migration-from-videojs",
					},
				],
			},
			{
				text: "API",
				items: [{ text: "Reference", link: "/api/reference" }],
			},
		],

		socialLinks: [
			{ icon: "github", link: "https://github.com/hogekai/vide" },
		],

		search: {
			provider: "local",
		},
	},
});
