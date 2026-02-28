import {
	type PointerEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { useVideContext } from "../context.js";

export interface VolumeProps {
	className?: string;
	children?: ReactNode;
}

export function Volume({ className, children }: VolumeProps) {
	const player = useVideContext();
	const [volume, setVolume] = useState(1);
	const [muted, setMuted] = useState(false);
	const dragging = useRef(false);
	const sliderRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!player) return;
		const sync = () => {
			if (!dragging.current) {
				setVolume(player.muted ? 0 : player.volume);
			}
			setMuted(player.muted || player.volume === 0);
		};
		player.el.addEventListener("volumechange", sync);
		sync();
		return () => {
			player.el.removeEventListener("volumechange", sync);
		};
	}, [player]);

	const onMuteClick = useCallback(() => {
		if (!player) return;
		player.muted = !player.muted;
	}, [player]);

	const getRatio = useCallback((e: PointerEvent): number => {
		if (!sliderRef.current) return 0;
		const rect = sliderRef.current.getBoundingClientRect();
		if (rect.width === 0) return 0;
		return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
	}, []);

	const onPointerDown = useCallback(
		(e: PointerEvent) => {
			if (!player) return;
			dragging.current = true;
			sliderRef.current?.setPointerCapture(e.pointerId);
			const vol = getRatio(e);
			player.volume = vol;
			if (player.muted && vol > 0) player.muted = false;
			setVolume(vol);
			setMuted(vol === 0);
		},
		[player, getRatio],
	);

	const onPointerMove = useCallback(
		(e: PointerEvent) => {
			if (!dragging.current || !player) return;
			const vol = getRatio(e);
			player.volume = vol;
			if (player.muted && vol > 0) player.muted = false;
			setVolume(vol);
			setMuted(vol === 0);
		},
		[player, getRatio],
	);

	const onPointerUp = useCallback((e: PointerEvent) => {
		if (!dragging.current) return;
		dragging.current = false;
		sliderRef.current?.releasePointerCapture(e.pointerId);
	}, []);

	return (
		<div
			className={className}
			data-muted={muted || undefined}
			style={{ "--vide-volume": volume } as React.CSSProperties}
		>
			<button
				type="button"
				aria-label={muted ? "Unmute" : "Mute"}
				onClick={onMuteClick}
			>
				{children}
			</button>
			<div
				ref={sliderRef}
				role="slider"
				tabIndex={0}
				aria-label="Volume"
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={Math.round(volume * 100)}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
			/>
		</div>
	);
}
