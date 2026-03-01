import { type ReactNode, useState } from "react";
import { useVideContext } from "../context.js";
import { useAdState } from "../use-ad-state.js";
import { useVideEvent } from "../use-vide-event.js";

export interface AdCountdownProps {
	className?: string;
	format?: (remaining: number) => ReactNode;
}

export function AdCountdown({ className, format }: AdCountdownProps) {
	const player = useVideContext();
	const { active, meta } = useAdState(player);
	const [remaining, setRemaining] = useState(0);

	useVideEvent(player, "timeupdate", ({ currentTime }) => {
		if (!active || !meta) return;
		const duration =
			meta.duration ??
			(player && Number.isFinite(player.duration) ? player.duration : 0);
		setRemaining(Math.max(0, Math.ceil(duration - currentTime)));
	});

	if (!player || !active) return null;

	return (
		<div
			aria-label="Ad countdown"
			aria-live="off"
			className={["vide-ad-countdown", className].filter(Boolean).join(" ")}
		>
			{format ? format(remaining) : `Ad \u00b7 ${remaining}s`}
		</div>
	);
}
