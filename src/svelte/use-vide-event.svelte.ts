import type { PlayerGetter } from "./context.js";
import type { EventHandler, PlayerEvent, PlayerEventMap } from "./helpers.js";

export function useVideEvent<K extends PlayerEvent>(
	getPlayer: PlayerGetter,
	event: K,
	handler: EventHandler<PlayerEventMap[K]>,
): void {
	$effect(() => {
		const p = getPlayer();
		if (!p) return;
		p.on(event, handler);
		return () => p.off(event, handler);
	});
}
