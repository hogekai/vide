export { createVidePlayer } from "./create-vide-player.svelte.js";

export { useVideEvent } from "./use-vide-event.svelte.js";

export {
	useHls,
	useDash,
	useDrm,
	useVast,
	useVmap,
	useSsai,
	useUi,
} from "./use-plugin.svelte.js";

export { VIDE_PLAYER_KEY, useVideContext } from "./context.js";
export type { PlayerGetter } from "./context.js";

export { default as VideVideo } from "./Video.svelte";

export { default as HlsPlugin } from "./HlsPlugin.svelte";
export { default as DashPlugin } from "./DashPlugin.svelte";
export { default as DrmPlugin } from "./DrmPlugin.svelte";
export { default as VastPlugin } from "./VastPlugin.svelte";
export { default as VmapPlugin } from "./VmapPlugin.svelte";
export { default as SsaiPlugin } from "./SsaiPlugin.svelte";

export { default as PlayButton } from "./components/PlayButton.svelte";
export { default as MuteButton } from "./components/MuteButton.svelte";
export { default as Progress } from "./components/Progress.svelte";
export { default as Volume } from "./components/Volume.svelte";
export { default as FullscreenButton } from "./components/FullscreenButton.svelte";
export { default as TimeDisplay } from "./components/TimeDisplay.svelte";
