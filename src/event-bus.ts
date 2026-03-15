import type {
	EventHandler,
	MediaElement,
	PlayerEvent,
	PlayerEventMap,
} from "./types.js";

export const PLAYER_EVENTS = new Set<string>([
	"statechange",
	"play",
	"pause",
	"ended",
	"timeupdate",
	"livestatechange",
	"error",
	"ad:companions",
	"ad:nonlinears",
	"ad:start",
	"ad:end",
	"ad:skip",
	"ad:click",
	"ad:error",
	"ad:impression",
	"ad:loaded",
	"ad:quartile",
	"ad:mute",
	"ad:unmute",
	"ad:volumeChange",
	"ad:fullscreen",
	"ad:breakStart",
	"ad:breakEnd",
	"ad:pod:start",
	"ad:pod:end",
	"ad:pod:adstart",
	"ad:pod:adend",
	"qualitiesavailable",
	"qualitychange",
	"texttrackchange",
	"texttracksavailable",
	"cuechange",
	"drm:keystatus",
	"drm:ready",
	"destroy",
]);

export interface EventBus {
	emit<K extends PlayerEvent>(event: K, data: PlayerEventMap[K]): void;
	getHandlers(event: string): Set<EventHandler<unknown>>;
	handlers: Map<string, Set<EventHandler<unknown>>>;
}

export function createEventBus(): EventBus {
	const handlers = new Map<string, Set<EventHandler<unknown>>>();

	function getHandlers(event: string): Set<EventHandler<unknown>> {
		let set = handlers.get(event);
		if (!set) {
			set = new Set();
			handlers.set(event, set);
		}
		return set;
	}

	function emit<K extends PlayerEvent>(
		event: K,
		data: PlayerEventMap[K],
	): void {
		const set = handlers.get(event);
		if (!set) return;
		for (const handler of set) {
			try {
				handler(data);
			} catch (err) {
				console.error("[vide] Event handler error:", err);
			}
		}
	}

	return { emit, getHandlers, handlers };
}

export function onEvent(
	bus: EventBus,
	el: MediaElement,
	event: string,
	// biome-ignore lint/suspicious/noExplicitAny: implementation signature covers both overloads
	handler: any,
): void {
	if (PLAYER_EVENTS.has(event)) {
		bus.getHandlers(event).add(handler as EventHandler<unknown>);
	} else {
		el.addEventListener(event, handler as EventListener);
	}
}

export function offEvent(
	bus: EventBus,
	el: MediaElement,
	event: string,
	// biome-ignore lint/suspicious/noExplicitAny: implementation signature covers both overloads
	handler: any,
): void {
	if (PLAYER_EVENTS.has(event)) {
		bus.getHandlers(event).delete(handler as EventHandler<unknown>);
	} else {
		el.removeEventListener(event, handler as EventListener);
	}
}
