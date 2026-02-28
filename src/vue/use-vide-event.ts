import { type ShallowRef, onScopeDispose, watch } from "vue";
import type {
	EventHandler,
	Player,
	PlayerEvent,
	PlayerEventMap,
} from "../types.js";

export function useVideEvent<K extends PlayerEvent>(
	player: ShallowRef<Player | null>,
	event: K,
	handler: EventHandler<PlayerEventMap[K]>,
): void {
	let off: (() => void) | undefined;

	watch(
		player,
		(p) => {
			off?.();
			off = undefined;
			if (!p) return;
			p.on(event, handler);
			off = () => p.off(event, handler);
		},
		{ immediate: true },
	);

	onScopeDispose(() => {
		off?.();
	});
}
