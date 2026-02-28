import { type ReactNode, useCallback, useEffect, useState } from "react";
import { useVideContext } from "../context.js";
import { IconVolumeHigh, IconVolumeLow, IconVolumeMute } from "../icons.js";

export interface MuteButtonProps {
	className?: string;
	children?: ReactNode;
}

export function MuteButton({ className, children }: MuteButtonProps) {
	const player = useVideContext();
	const [muted, setMuted] = useState(false);
	const [volume, setVolume] = useState(1);

	useEffect(() => {
		if (!player) return;
		const sync = () => {
			setMuted(player.muted || player.volume === 0);
			setVolume(player.volume);
		};
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

	let defaultIcon: ReactNode;
	if (muted) {
		defaultIcon = <IconVolumeMute />;
	} else if (volume < 0.5) {
		defaultIcon = <IconVolumeLow />;
	} else {
		defaultIcon = <IconVolumeHigh />;
	}

	return (
		<button
			type="button"
			className={["vide-mute", className].filter(Boolean).join(" ")}
			aria-label={muted ? "Unmute" : "Mute"}
			onClick={onClick}
			data-muted={muted || undefined}
		>
			{children ?? defaultIcon}
		</button>
	);
}
