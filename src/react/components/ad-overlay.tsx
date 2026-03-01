import { type ReactNode, useCallback } from "react";
import { useVideContext } from "../context.js";
import { useAdState } from "../use-ad-state.js";

export interface AdOverlayProps {
	className?: string;
	children?: ReactNode;
}

export function AdOverlay({ className, children }: AdOverlayProps) {
	const player = useVideContext();
	const { active, meta } = useAdState(player);

	const handleClick = useCallback(() => {
		if (!player) return;
		player.el.click();
		const url = meta?.clickThrough;
		if (url) {
			window.open(url, "_blank");
			player.el.pause();
		} else {
			if (player.el.paused) {
				Promise.resolve(player.el.play()).catch(() => {});
			} else {
				player.el.pause();
			}
		}
	}, [player, meta]);

	if (!player || !active) return null;

	return (
		/* Overlay is a transparent full-area click target on top of the ad video.
		   Keyboard users interact via the underlying player controls, not the overlay. */
		// biome-ignore lint/a11y/useKeyWithClickEvents: overlay delegates to player controls for keyboard access
		<div
			className={["vide-ad-overlay", className].filter(Boolean).join(" ")}
			onClick={handleClick}
		>
			{children}
		</div>
	);
}
