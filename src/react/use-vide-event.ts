import { useEffect, useRef } from "react";
import type {
	EventHandler,
	Player,
	PlayerEvent,
	PlayerEventMap,
} from "../types.js";
import type { VidePlayerHandle } from "./use-vide-player.js";

function resolvePlayer(
	target: VidePlayerHandle | Player | null,
): Player | null {
	if (target === null) return null;
	if ("_registerEl" in target) return target.current;
	return target;
}

export function useVideEvent<K extends PlayerEvent>(
	target: VidePlayerHandle | Player | null,
	event: K,
	handler: EventHandler<PlayerEventMap[K]>,
): void {
	const handlerRef = useRef(handler);
	handlerRef.current = handler;

	const player = resolvePlayer(target);

	useEffect(() => {
		if (!player) return;
		const fn: EventHandler<PlayerEventMap[K]> = (data) =>
			handlerRef.current(data);
		player.on(event, fn);
		return () => player.off(event, fn);
	}, [player, event]);
}
