import { useCallback, useContext, useRef } from "react";
import { isAdState } from "../../ui/state.js";
import { VideContext } from "../context.js";

const DBLCLICK_DELAY = 200;

export interface ClickPlayProps {
	className?: string;
	enableFullscreen?: boolean;
}

export function ClickPlay({
	className,
	enableFullscreen = true,
}: ClickPlayProps) {
	const player = useContext(VideContext)?.player ?? null;
	const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const togglePlay = useCallback(() => {
		if (!player) return;
		if (player.state === "playing" || player.state === "ad:playing") {
			player.pause();
		} else {
			player.play().catch(() => {});
		}
	}, [player]);

	const toggleFullscreen = useCallback(() => {
		if (!enableFullscreen) return;
		const target =
			(player?.el.closest(".vide-ui") as HTMLElement | null) ??
			player?.el.parentElement;
		if (!target) return;
		if (document.fullscreenElement != null) {
			document.exitFullscreen().catch(() => {});
		} else if (target.requestFullscreen) {
			target.requestFullscreen().catch(() => {});
		}
	}, [player, enableFullscreen]);

	const onClick = useCallback(() => {
		if (!player) return;

		if (isAdState(player.state)) {
			player.el.click();
			togglePlay();
			return;
		}

		if (clickTimer.current !== null) {
			clearTimeout(clickTimer.current);
			clickTimer.current = null;
			toggleFullscreen();
			return;
		}

		clickTimer.current = setTimeout(() => {
			clickTimer.current = null;
			togglePlay();
		}, DBLCLICK_DELAY);
	}, [player, togglePlay, toggleFullscreen]);

	return (
		<div
			className={["vide-clickplay", className].filter(Boolean).join(" ")}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick();
				}
			}}
		/>
	);
}
