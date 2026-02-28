import { type PointerEvent, useCallback, useRef, useState } from "react";
import type { PlayerState } from "../../types.js";
import { useVideContext } from "../context.js";
import { useVideEvent } from "../use-vide-event.js";

export interface ProgressProps {
	className?: string;
}

export function Progress({ className }: ProgressProps) {
	const player = useVideContext();
	const [progress, setProgress] = useState(0);
	const [buffered, setBuffered] = useState(0);
	const [disabled, setDisabled] = useState(false);
	const dragging = useRef(false);
	const rootRef = useRef<HTMLDivElement>(null);

	useVideEvent(player, "timeupdate", ({ currentTime, duration }) => {
		if (!dragging.current && duration > 0) {
			setProgress(currentTime / duration);
		}
		if (player && player.el.buffered.length > 0 && duration > 0) {
			const end = player.el.buffered.end(player.el.buffered.length - 1);
			setBuffered(Math.min(1, end / duration));
		}
	});

	useVideEvent(
		player,
		"statechange",
		({ to }: { from: PlayerState; to: PlayerState }) => {
			const isAd =
				to === "ad:loading" || to === "ad:playing" || to === "ad:paused";
			setDisabled(isAd);
		},
	);

	const getRatio = useCallback((e: PointerEvent): number => {
		if (!rootRef.current) return 0;
		const rect = rootRef.current.getBoundingClientRect();
		if (rect.width === 0) return 0;
		return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
	}, []);

	const onPointerDown = useCallback(
		(e: PointerEvent) => {
			if (!player || disabled) return;
			dragging.current = true;
			rootRef.current?.setPointerCapture(e.pointerId);
			setProgress(getRatio(e));
		},
		[player, disabled, getRatio],
	);

	const onPointerMove = useCallback(
		(e: PointerEvent) => {
			if (!dragging.current) return;
			setProgress(getRatio(e));
		},
		[getRatio],
	);

	const onPointerUp = useCallback(
		(e: PointerEvent) => {
			if (!dragging.current || !player) return;
			dragging.current = false;
			rootRef.current?.releasePointerCapture(e.pointerId);
			const ratio = getRatio(e);
			const duration = player.el.duration;
			if (Number.isFinite(duration) && duration > 0) {
				player.currentTime = ratio * duration;
			}
		},
		[player, getRatio],
	);

	return (
		<div
			ref={rootRef}
			className={className}
			role="slider"
			tabIndex={0}
			aria-label="Seek"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.round(progress * 100)}
			data-disabled={disabled || undefined}
			style={
				{
					"--vide-progress": progress,
					"--vide-progress-buffered": buffered,
				} as React.CSSProperties
			}
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
		/>
	);
}
