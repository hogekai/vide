import type { Player } from "../types.js";

/** A single UI component that can be independently mounted and connected. */
export interface UIComponent {
	/** Create DOM elements and append them to the container. */
	mount(container: HTMLElement): void;
	/** Subscribe to player events and start reacting. */
	connect(player: Player): void;
	/** Remove DOM elements and unsubscribe from all events. */
	destroy(): void;
}

/** Shared mutable state for ad UI components. Set by uiAdPlugin, read by ad components. */
export interface AdUIState {
	adId: string;
	skipOffset: number | undefined;
	clickThrough: string | undefined;
	duration: number;
}

/** Mutable holder for AdUIState, shared between ad-plugin and ad UI components. */
export interface AdUIStateRef {
	current: AdUIState | null;
	set(state: AdUIState): void;
	clear(): void;
}

/** Component names that can be excluded from the ui() convenience plugin. */
export type UIComponentName =
	| "play"
	| "progress"
	| "time"
	| "volume"
	| "fullscreen"
	| "loader"
	| "error"
	| "bigplay"
	| "poster"
	| "ad-countdown"
	| "ad-skip"
	| "ad-overlay"
	| "ad-label"
	| "keyboard"
	| "clickplay"
	| "autohide";

/** Options for the ui() convenience plugin. */
export interface UiPluginOptions {
	/** Container element to mount UI controls into. */
	container: HTMLElement;

	/** Components to exclude (default: none — all enabled). */
	exclude?: UIComponentName[] | undefined;

	/** Poster image URL. */
	poster?: string | undefined;
}
