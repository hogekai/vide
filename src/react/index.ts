export { useVidePlayer } from "./use-vide-player.js";
export type {
	VidePlayerHandle,
	UseVidePlayerHandle,
} from "./use-vide-player.js";

export { useVideEvent } from "./use-vide-event.js";

export {
	useHls,
	useDash,
	useDrm,
	useVast,
	useVmap,
	useSsai,
	useUi,
} from "./use-plugin.js";

export { VideContext, useVideContext } from "./context.js";
export type { VideContextValue } from "./context.js";

export { VideRoot } from "./root.js";
export type { VideRootProps } from "./root.js";

export { VideVideo } from "./video.js";
export type { VideVideoProps } from "./video.js";

export { VideUI, VideControls } from "./ui.js";
export type { VideUIProps, VideControlsProps } from "./ui.js";

export {
	DashPlugin,
	DrmPlugin,
	HlsPlugin,
	SsaiPlugin,
	VastPlugin,
	VmapPlugin,
} from "./plugins.js";

export { PlayButton } from "./components/play-button.js";
export type { PlayButtonProps } from "./components/play-button.js";
export { MuteButton } from "./components/mute-button.js";
export type { MuteButtonProps } from "./components/mute-button.js";
export { Progress } from "./components/progress.js";
export type { ProgressProps } from "./components/progress.js";
export { Volume } from "./components/volume.js";
export type { VolumeProps } from "./components/volume.js";
export { FullscreenButton } from "./components/fullscreen.js";
export type { FullscreenButtonProps } from "./components/fullscreen.js";
export { TimeDisplay } from "./components/time-display.js";
export type { TimeDisplayProps } from "./components/time-display.js";

export { Loader } from "./components/loader.js";
export type { LoaderProps } from "./components/loader.js";
export { Poster } from "./components/poster.js";
export type { PosterProps } from "./components/poster.js";
export { ErrorDisplay } from "./components/error-display.js";
export type { ErrorDisplayProps } from "./components/error-display.js";
export { BigPlayButton } from "./components/big-play-button.js";
export type { BigPlayButtonProps } from "./components/big-play-button.js";
export { ClickPlay } from "./components/click-play.js";
export type { ClickPlayProps } from "./components/click-play.js";

export { useAdState } from "./use-ad-state.js";
export type { AdState } from "./use-ad-state.js";

export { AdOverlay } from "./components/ad-overlay.js";
export type { AdOverlayProps } from "./components/ad-overlay.js";
export { AdSkip } from "./components/ad-skip.js";
export type { AdSkipProps } from "./components/ad-skip.js";
export { AdCountdown } from "./components/ad-countdown.js";
export type { AdCountdownProps } from "./components/ad-countdown.js";
export { AdLabel } from "./components/ad-label.js";
export type { AdLabelProps } from "./components/ad-label.js";
export { AdLearnMore } from "./components/ad-learn-more.js";
export type { AdLearnMoreProps } from "./components/ad-learn-more.js";

export { useAutohide } from "./use-autohide.js";
export { useKeyboard } from "./use-keyboard.js";
export type { UseKeyboardOptions } from "./use-keyboard.js";

import { AdCountdown } from "./components/ad-countdown.js";
import { AdLabel } from "./components/ad-label.js";
import { AdLearnMore } from "./components/ad-learn-more.js";
import { AdOverlay } from "./components/ad-overlay.js";
import { AdSkip } from "./components/ad-skip.js";
import { BigPlayButton } from "./components/big-play-button.js";
import { ClickPlay } from "./components/click-play.js";
import { ErrorDisplay } from "./components/error-display.js";
import { FullscreenButton } from "./components/fullscreen.js";
import { Loader } from "./components/loader.js";
import { MuteButton } from "./components/mute-button.js";
import { PlayButton } from "./components/play-button.js";
import { Poster } from "./components/poster.js";
import { Progress } from "./components/progress.js";
import { TimeDisplay } from "./components/time-display.js";
import { Volume } from "./components/volume.js";
import {
	DashPlugin,
	DrmPlugin,
	HlsPlugin,
	SsaiPlugin,
	VastPlugin,
	VmapPlugin,
} from "./plugins.js";
import { VideRoot } from "./root.js";
import { VideControls, VideUI } from "./ui.js";
import { VideVideo } from "./video.js";

export const Vide = {
	Root: VideRoot,
	Video: VideVideo,
	UI: VideUI,
	Controls: VideControls,
	HlsPlugin,
	DashPlugin,
	DrmPlugin,
	VastPlugin,
	VmapPlugin,
	SsaiPlugin,
	PlayButton,
	MuteButton,
	Progress,
	Volume,
	FullscreenButton,
	TimeDisplay,
	Loader,
	Poster,
	ErrorDisplay,
	BigPlayButton,
	ClickPlay,
	AdOverlay,
	AdSkip,
	AdCountdown,
	AdLabel,
	AdLearnMore,
} as const;
