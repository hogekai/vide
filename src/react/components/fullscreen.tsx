import { type ReactNode, useCallback, useEffect, useState } from "react";
import { useVideContext } from "../context.js";
import { IconFullscreenEnter, IconFullscreenExit } from "../icons.js";

export interface FullscreenButtonProps {
	className?: string;
	target?: HTMLElement | null;
	children?: ReactNode;
}

export function FullscreenButton({
	className,
	target,
	children,
}: FullscreenButtonProps) {
	const player = useVideContext();
	const [active, setActive] = useState(false);

	useEffect(() => {
		const onChange = () => {
			setActive(
				document.fullscreenElement != null ||
					// biome-ignore lint/suspicious/noExplicitAny: webkit vendor prefix
					(document as any).webkitFullscreenElement != null,
			);
		};
		document.addEventListener("fullscreenchange", onChange);
		document.addEventListener("webkitfullscreenchange", onChange);
		return () => {
			document.removeEventListener("fullscreenchange", onChange);
			document.removeEventListener("webkitfullscreenchange", onChange);
		};
	}, []);

	const onClick = useCallback(() => {
		const fsTarget =
			target ??
			(player?.el.closest(".vide-ui") as HTMLElement | null) ??
			player?.el.parentElement;
		if (!fsTarget) return;
		if (document.fullscreenElement) {
			document.exitFullscreen().catch(() => {});
		} else {
			fsTarget.requestFullscreen().catch(() => {});
		}
	}, [player, target]);

	return (
		<button
			type="button"
			className={["vide-fullscreen", className].filter(Boolean).join(" ")}
			aria-label={active ? "Exit fullscreen" : "Fullscreen"}
			onClick={onClick}
			data-fullscreen={active || undefined}
		>
			{children ?? (active ? <IconFullscreenExit /> : <IconFullscreenEnter />)}
		</button>
	);
}
