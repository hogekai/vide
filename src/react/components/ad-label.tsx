import type { ReactNode } from "react";
import { useVideContext } from "../context.js";
import { useAdState } from "../use-ad-state.js";

export interface AdLabelProps {
	className?: string;
	children?: ReactNode;
}

export function AdLabel({ className, children }: AdLabelProps) {
	const player = useVideContext();
	const { active } = useAdState(player);

	if (!player || !active) return null;

	return (
		<div className={["vide-ad-label", className].filter(Boolean).join(" ")}>
			{children ?? "Ad"}
		</div>
	);
}
