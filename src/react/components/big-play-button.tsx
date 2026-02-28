import { type ReactNode, useCallback, useContext } from "react";
import { VideContext } from "../context.js";
import { IconPlay } from "../icons.js";

export interface BigPlayButtonProps {
	className?: string;
	children?: ReactNode;
}

export function BigPlayButton({ className, children }: BigPlayButtonProps) {
	const player = useContext(VideContext)?.player ?? null;

	const onClick = useCallback(() => {
		if (!player) return;
		if (player.state === "ended") {
			const p = player;
			function onReady({ to }: { from: string; to: string }): void {
				if (to === "ready") {
					p.off("statechange", onReady);
					p.play().catch(() => {});
				}
			}
			p.on("statechange", onReady);
			p.el.currentTime = 0;
			p.el.load();
			return;
		}
		player.play().catch(() => {});
	}, [player]);

	return (
		<button
			type="button"
			className={["vide-bigplay", className].filter(Boolean).join(" ")}
			aria-label="Play video"
			onClick={onClick}
		>
			{children ?? <IconPlay />}
		</button>
	);
}
