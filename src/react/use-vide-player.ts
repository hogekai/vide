import { useCallback, useEffect, useState } from "react";
import { createPlayer } from "../core.js";
import type { Player } from "../types.js";

export interface UseVidePlayerHandle {
	player: Player | null;
	/** @internal Used by Vide.Video to bind the media element. */
	_registerEl: (el: HTMLVideoElement) => void;
}

export function useVidePlayer(): UseVidePlayerHandle {
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

	return { player, _registerEl };
}
