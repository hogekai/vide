import { useState } from "react";
import { formatTime } from "../../ui/utils.js";
import { useVideContext } from "../context.js";
import { useVideEvent } from "../use-vide-event.js";

export interface TimeDisplayProps {
	className?: string;
	separator?: string;
}

export function TimeDisplay({ className, separator = "/" }: TimeDisplayProps) {
	const player = useVideContext();
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);

	useVideEvent(player, "timeupdate", (data) => {
		setCurrentTime(data.currentTime);
		setDuration(data.duration);
	});

	return (
		<div className={className} aria-label="Time">
			<span>{formatTime(currentTime)}</span>
			<span>{separator}</span>
			<span>{formatTime(duration)}</span>
		</div>
	);
}
