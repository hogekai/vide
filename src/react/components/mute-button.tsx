import { type ReactNode, useCallback, useEffect, useState } from "react";
import { useVideContext } from "../context.js";

export interface MuteButtonProps {
	className?: string;
	children?: ReactNode;
}

export function MuteButton({ className, children }: MuteButtonProps) {
	const player = useVideContext();
	const [muted, setMuted] = useState(false);

	useEffect(() => {
		if (!player) return;
		const sync = () => setMuted(player.muted || player.volume === 0);
		player.el.addEventListener("volumechange", sync);
		sync();
		return () => {
			player.el.removeEventListener("volumechange", sync);
		};
	}, [player]);

	const onClick = useCallback(() => {
		if (!player) return;
		player.muted = !player.muted;
	}, [player]);

	return (
		<button
			type="button"
			className={className}
			aria-label={muted ? "Unmute" : "Mute"}
			onClick={onClick}
			data-muted={muted || undefined}
		>
			{children}
		</button>
	);
}
