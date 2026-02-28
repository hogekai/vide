import {
	type ComponentPropsWithoutRef,
	type ReactNode,
	useCallback,
} from "react";
import { VideContext } from "./context.js";
import type { UseVidePlayerHandle } from "./use-vide-player.js";

export interface VideVideoProps extends ComponentPropsWithoutRef<"video"> {
	player: UseVidePlayerHandle;
	children?: ReactNode;
}

export function VideVideo({
	player: { player, _registerEl },
	children,
	...videoProps
}: VideVideoProps) {
	const ref = useCallback(
		(el: HTMLVideoElement | null) => {
			if (el) _registerEl(el);
		},
		[_registerEl],
	);

	return (
		<VideContext.Provider value={player}>
			<video ref={ref} {...videoProps} />
			{player && children}
		</VideContext.Provider>
	);
}
