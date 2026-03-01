import { type ReactNode, useCallback } from "react";
import { useVideContext } from "../context.js";
import { useAdState } from "../use-ad-state.js";

export interface AdLearnMoreProps {
	className?: string;
	children?: ReactNode;
	showTitle?: boolean;
}

export function AdLearnMore({
	className,
	children,
	showTitle,
}: AdLearnMoreProps) {
	const player = useVideContext();
	const { active, meta } = useAdState(player);

	const onClick = useCallback(() => {
		if (!player || !meta?.clickThrough) return;
		player.el.click();
		window.open(meta.clickThrough, "_blank");
		player.el.pause();
	}, [player, meta]);

	if (!player || !active || !meta?.clickThrough) return null;

	return (
		<button
			type="button"
			className={["vide-ad-cta", className].filter(Boolean).join(" ")}
			onClick={onClick}
		>
			{showTitle && meta.adTitle ? (
				<>
					<span className="vide-ad-cta__title">{meta.adTitle}</span>
					{children ?? "Learn More"}
				</>
			) : (
				(children ?? "Learn More")
			)}
		</button>
	);
}
