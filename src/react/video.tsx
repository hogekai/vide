import {
	type ComponentPropsWithoutRef,
	type ReactNode,
	forwardRef,
	useCallback,
} from "react";
import type { Player } from "../types.js";
import { VideContext } from "./context.js";

export interface VideVideoProps extends ComponentPropsWithoutRef<"video"> {
	player: Player | null;
	children?: ReactNode;
}

export const VideVideo = forwardRef<HTMLVideoElement, VideVideoProps>(
	function VideVideo({ player, children, ...videoProps }, forwardedRef) {
		const videoRefCallback = useCallback(
			(el: HTMLVideoElement | null) => {
				if (typeof forwardedRef === "function") {
					forwardedRef(el);
				} else if (forwardedRef) {
					forwardedRef.current = el;
				}
			},
			[forwardedRef],
		);

		return (
			<VideContext.Provider value={player}>
				<video ref={videoRefCallback} {...videoProps} />
				{children}
			</VideContext.Provider>
		);
	},
);
