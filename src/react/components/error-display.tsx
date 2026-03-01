import { useContext, useState } from "react";
import { VideContext } from "../context.js";
import { useVideEvent } from "../use-vide-event.js";

export interface ErrorDisplayProps {
	className?: string;
}

export function ErrorDisplay({ className }: ErrorDisplayProps) {
	const player = useContext(VideContext)?.player ?? null;
	const [message, setMessage] = useState("");

	useVideEvent(player, "error", ({ message }: { message: string }) => {
		setMessage(message);
	});

	return (
		<div
			role="alert"
			className={["vide-error", className].filter(Boolean).join(" ")}
		>
			<span className="vide-error__message">{message}</span>
		</div>
	);
}
