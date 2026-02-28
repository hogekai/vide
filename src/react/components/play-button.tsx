import { type ReactNode, useCallback, useState } from "react";
import type { PlayerState } from "../../types.js";
import { useVideContext } from "../context.js";
import { useVideEvent } from "../use-vide-event.js";

export interface PlayButtonProps {
	className?: string;
	children?: ReactNode;
}

export function PlayButton({ className, children }: PlayButtonProps) {
	const player = useVideContext();
	const [playing, setPlaying] = useState(false);

	useVideEvent(
		player,
		"statechange",
		({ to }: { from: PlayerState; to: PlayerState }) => {
			if (to === "playing" || to === "ad:playing") {
				setPlaying(true);
			} else if (
				to === "paused" ||
				to === "ready" ||
				to === "ended" ||
				to === "ad:paused"
			) {
				setPlaying(false);
			}
		},
	);

	const onClick = useCallback(() => {
		if (!player) return;
		if (player.state === "playing" || player.state === "ad:playing") {
			player.pause();
		} else {
			player.play().catch(() => {});
		}
	}, [player]);

	return (
		<button
			type="button"
			className={className}
			aria-label={playing ? "Pause" : "Play"}
			onClick={onClick}
			data-playing={playing || undefined}
		>
			{children}
		</button>
	);
}
