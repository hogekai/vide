import { useCallback, useEffect, useState } from "react";
import { createPlayer } from "../core.js";
import type { Player } from "../types.js";

export interface VidePlayerHandle {
	/** Player instance. `null` before `<Vide.Video>` mounts. */
	readonly current: Player | null;
	/** @internal Used by Vide.Video to bind the media element. */
	_registerEl: (el: HTMLVideoElement) => void;
}

/** @deprecated Use `VidePlayerHandle` instead. */
export type UseVidePlayerHandle = VidePlayerHandle;

export function useVidePlayer(): VidePlayerHandle {
	const [player, setPlayer] = useState<Player | null>(null);

	const _registerEl = useCallback((el: HTMLVideoElement) => {
		const p = createPlayer(el);
		setPlayer(p);
	}, []);

	useEffect(() => {
		return () => {
			player?.destroy();
		};
	}, [player]);

	return { current: player, _registerEl };
}
