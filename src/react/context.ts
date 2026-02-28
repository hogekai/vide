import { createContext, useContext } from "react";
import type { Player } from "../types.js";

export const VideContext = createContext<Player | null>(null);

export function useVideContext(): Player {
	const ctx = useContext(VideContext);
	if (ctx === null) {
		throw new Error("useVideContext must be used within <Vide.Video>");
	}
	return ctx;
}
