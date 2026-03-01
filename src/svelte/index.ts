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
	useIma,
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
export { default as Ima } from "./Ima.svelte";
export { default as ImaPlugin } from "./ImaPlugin.svelte";

export { default as VideUI } from "./VideUI.svelte";
export { default as VideControls } from "./VideControls.svelte";

export { default as PlayButton } from "./components/PlayButton.svelte";
export { default as MuteButton } from "./components/MuteButton.svelte";
export { default as Progress } from "./components/Progress.svelte";
export { default as Volume } from "./components/Volume.svelte";
export { default as FullscreenButton } from "./components/FullscreenButton.svelte";
export { default as TimeDisplay } from "./components/TimeDisplay.svelte";
export { default as Loader } from "./components/Loader.svelte";
export { default as Poster } from "./components/Poster.svelte";
export { default as ErrorDisplay } from "./components/ErrorDisplay.svelte";
export { default as BigPlayButton } from "./components/BigPlayButton.svelte";
export { default as ClickPlay } from "./components/ClickPlay.svelte";

export { default as IconPlay } from "./icons/IconPlay.svelte";
export { default as IconPause } from "./icons/IconPause.svelte";
export { default as IconVolumeHigh } from "./icons/IconVolumeHigh.svelte";
export { default as IconVolumeLow } from "./icons/IconVolumeLow.svelte";
export { default as IconVolumeMute } from "./icons/IconVolumeMute.svelte";
export { default as IconFullscreenEnter } from "./icons/IconFullscreenEnter.svelte";
export { default as IconFullscreenExit } from "./icons/IconFullscreenExit.svelte";
export { default as IconExternalLink } from "./icons/IconExternalLink.svelte";
export { default as IconSkipForward } from "./icons/IconSkipForward.svelte";

export { useAdState } from "./use-ad-state.svelte.js";
export type { AdState } from "./use-ad-state.svelte.js";

export { default as AdOverlay } from "./components/AdOverlay.svelte";
export { default as AdSkip } from "./components/AdSkip.svelte";
export { default as AdCountdown } from "./components/AdCountdown.svelte";
export { default as AdLabel } from "./components/AdLabel.svelte";
export { default as AdLearnMore } from "./components/AdLearnMore.svelte";

export { useAutohide } from "./use-autohide.svelte.js";
export { useKeyboard } from "./use-keyboard.svelte.js";
export type { UseKeyboardOptions } from "./use-keyboard.svelte.js";
