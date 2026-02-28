import { useEffect, useRef } from "react";
import type {
	EventHandler,
	Player,
	PlayerEvent,
	PlayerEventMap,
} from "../types.js";

export function useVideEvent<K extends PlayerEvent>(
	player: Player | null,
	event: K,
	handler: EventHandler<PlayerEventMap[K]>,
): void {
	const handlerRef = useRef(handler);
	handlerRef.current = handler;

	useEffect(() => {
		if (!player) return;
		const fn: EventHandler<PlayerEventMap[K]> = (data) =>
			handlerRef.current(data);
		player.on(event, fn);
		return () => player.off(event, fn);
	}, [player, event]);
}
