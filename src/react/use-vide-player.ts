import { useCallback, useRef, useState } from "react";
import { createPlayer } from "../core.js";
import type { MediaElement, Player } from "../types.js";

export interface UseVidePlayerReturn {
	player: Player | null;
	ref: (el: MediaElement | null) => void;
}

export function useVidePlayer(): UseVidePlayerReturn {
	const [player, setPlayer] = useState<Player | null>(null);
	const playerRef = useRef<Player | null>(null);

	const ref = useCallback((el: MediaElement | null) => {
		if (playerRef.current) {
			playerRef.current.destroy();
			playerRef.current = null;
			setPlayer(null);
		}
		if (el) {
			const p = createPlayer(el);
			playerRef.current = p;
			setPlayer(p);
		}
	}, []);

	return { player, ref };
}
