import { type ReactNode, useMemo } from "react";
import { VideContext, type VideContextValue } from "./context.js";
import type { VidePlayerHandle } from "./use-vide-player.js";

export interface VideRootProps {
	player: VidePlayerHandle;
	children: ReactNode;
}

export function VideRoot({ player: handle, children }: VideRootProps) {
	const value = useMemo<VideContextValue>(
		() => ({
			player: handle.current,
			registerEl: handle._registerEl,
		}),
		[handle.current, handle._registerEl],
	);

	return <VideContext.Provider value={value}>{children}</VideContext.Provider>;
}
