import { type ReactNode, useCallback, useState } from "react";
import { useVideContext } from "../context.js";
import { useAdState } from "../use-ad-state.js";
import { useVideEvent } from "../use-vide-event.js";

export interface AdSkipProps {
	className?: string;
	children?: ReactNode;
}

export function AdSkip({ className, children }: AdSkipProps) {
	const player = useVideContext();
	const { active, meta } = useAdState(player);
	const [canSkip, setCanSkip] = useState(false);
	const [countdown, setCountdown] = useState(0);

	useVideEvent(player, "timeupdate", ({ currentTime }) => {
		if (!active || !meta || meta.skipOffset === undefined) return;
		if (currentTime >= meta.skipOffset) {
			setCanSkip(true);
		} else {
			setCanSkip(false);
			setCountdown(Math.max(0, Math.ceil(meta.skipOffset - currentTime)));
		}
	});

	const onClick = useCallback(() => {
		if (!player || !canSkip || !meta) return;
		player.emit("ad:skip", { adId: meta.adId });
	}, [player, canSkip, meta]);

	if (!player || !active || !meta || meta.skipOffset === undefined) return null;

	return (
		<button
			type="button"
			className={[
				"vide-skip",
				!canSkip && "vide-skip--disabled",
				className,
			]
				.filter(Boolean)
				.join(" ")}
			aria-label="Skip ad"
			onClick={onClick}
			disabled={!canSkip}
		>
			{canSkip ? (children ?? "Skip Ad") : `Skip in ${countdown}s`}
		</button>
	);
}
