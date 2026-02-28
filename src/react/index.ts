export { useVidePlayer } from "./use-vide-player.js";
export type { UseVidePlayerReturn } from "./use-vide-player.js";

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

export { VideVideo } from "./video.js";
export type { VideVideoProps } from "./video.js";

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

import { FullscreenButton } from "./components/fullscreen.js";
import { MuteButton } from "./components/mute-button.js";
import { PlayButton } from "./components/play-button.js";
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
import { VideVideo } from "./video.js";

export const Vide = {
	Video: VideVideo,
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
} as const;
