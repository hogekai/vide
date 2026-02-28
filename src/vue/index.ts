export { useVidePlayer } from "./use-vide-player.js";

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

export { VIDE_PLAYER_KEY, useVideContext } from "./context.js";

export { VideVideo } from "./video.js";

export {
	VideDashPlugin,
	VideDrmPlugin,
	VideHlsPlugin,
	VideSsaiPlugin,
	VideVastPlugin,
	VideVmapPlugin,
} from "./plugins.js";

export { VidePlayButton } from "./components/play-button.js";
export { VideMuteButton } from "./components/mute-button.js";
export { VideProgress } from "./components/progress.js";
export { VideVolume } from "./components/volume.js";
export { VideFullscreenButton } from "./components/fullscreen.js";
export { VideTimeDisplay } from "./components/time-display.js";
export { VideLoader } from "./components/loader.js";
export { VidePoster } from "./components/poster.js";
export { VideErrorDisplay } from "./components/error-display.js";
export { VideBigPlayButton } from "./components/big-play-button.js";
export { VideClickPlay } from "./components/click-play.js";

export { useAutohide } from "./use-autohide.js";
export { useKeyboard } from "./use-keyboard.js";
export type { UseKeyboardOptions } from "./use-keyboard.js";

export { VideUI, VideControls } from "./ui.js";

import { VideBigPlayButton } from "./components/big-play-button.js";
import { VideClickPlay } from "./components/click-play.js";
import { VideErrorDisplay } from "./components/error-display.js";
import { VideFullscreenButton } from "./components/fullscreen.js";
import { VideLoader } from "./components/loader.js";
import { VideMuteButton } from "./components/mute-button.js";
import { VidePlayButton } from "./components/play-button.js";
import { VidePoster } from "./components/poster.js";
import { VideProgress } from "./components/progress.js";
import { VideTimeDisplay } from "./components/time-display.js";
import { VideVolume } from "./components/volume.js";
import {
	VideDashPlugin,
	VideDrmPlugin,
	VideHlsPlugin,
	VideSsaiPlugin,
	VideVastPlugin,
	VideVmapPlugin,
} from "./plugins.js";
import { VideUI, VideControls } from "./ui.js";
import { VideVideo } from "./video.js";

export const Vide = {
	Video: VideVideo,
	HlsPlugin: VideHlsPlugin,
	DashPlugin: VideDashPlugin,
	DrmPlugin: VideDrmPlugin,
	VastPlugin: VideVastPlugin,
	VmapPlugin: VideVmapPlugin,
	SsaiPlugin: VideSsaiPlugin,
	PlayButton: VidePlayButton,
	MuteButton: VideMuteButton,
	Progress: VideProgress,
	Volume: VideVolume,
	FullscreenButton: VideFullscreenButton,
	TimeDisplay: VideTimeDisplay,
	Loader: VideLoader,
	Poster: VidePoster,
	ErrorDisplay: VideErrorDisplay,
	BigPlayButton: VideBigPlayButton,
	ClickPlay: VideClickPlay,
	UI: VideUI,
	Controls: VideControls,
} as const;
