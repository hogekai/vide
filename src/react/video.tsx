import { type ComponentPropsWithoutRef, useCallback } from "react";
import { useVideInternalContext } from "./context.js";

export interface VideVideoProps extends ComponentPropsWithoutRef<"video"> {}

export function VideVideo(videoProps: VideVideoProps) {
	const { registerEl } = useVideInternalContext();

	const ref = useCallback(
		(el: HTMLVideoElement | null) => {
			if (el) registerEl(el);
		},
		[registerEl],
	);

	return <video ref={ref} {...videoProps} />;
}
