import { createContext, useContext } from "react";
import type { Player } from "../types.js";

export interface VideContextValue {
	player: Player | null;
	registerEl: (el: HTMLVideoElement) => void;
}

export const VideContext = createContext<VideContextValue | null>(null);

export function useVideContext(): Player {
	const ctx = useContext(VideContext);
	if (ctx === null) {
		throw new Error("useVideContext must be used within <Vide.Root>");
	}
	if (ctx.player === null) {
		throw new Error(
			"useVideContext: player is not ready. Ensure <Vide.Video> is rendered inside <Vide.Root>.",
		);
	}
	return ctx.player;
}

/** @internal Returns the full context value. Used by Vide.Video to access registerEl. */
export function useVideInternalContext(): VideContextValue {
	const ctx = useContext(VideContext);
	if (ctx === null) {
		throw new Error("Vide.Video must be used within <Vide.Root>");
	}
	return ctx;
}
