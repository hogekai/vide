import { type ReactNode, useCallback, useMemo } from "react";
import { useVideContext } from "../context.js";
import { IconExternalLink } from "../icons.js";
import { useAdState } from "../use-ad-state.js";

function hostname(url: string): string {
	try {
		return new URL(url).hostname;
	} catch {
		return url;
	}
}

export interface AdLearnMoreProps {
	className?: string;
	children?: ReactNode;
}

export function AdLearnMore({ className, children }: AdLearnMoreProps) {
	const player = useVideContext();
	const { active, meta } = useAdState(player);

	const onClick = useCallback(() => {
		if (!player || !meta?.clickThrough) return;
		player.el.click();
		window.open(meta.clickThrough, "_blank");
		player.el.pause();
	}, [player, meta]);

	const host = useMemo(
		() => (meta?.clickThrough ? hostname(meta.clickThrough) : ""),
		[meta?.clickThrough],
	);

	if (!player || !active || !meta?.clickThrough) return null;

	return (
		<button
			type="button"
			className={["vide-ad-cta", className].filter(Boolean).join(" ")}
			onClick={onClick}
		>
			{children ?? (
				<>
					<span className="vide-ad-cta__icon">
						<IconExternalLink />
					</span>
					<span className="vide-ad-cta__body">
						{meta.adTitle && (
							<span className="vide-ad-cta__title">
								{meta.adTitle}
							</span>
						)}
						<span className="vide-ad-cta__url">{host}</span>
					</span>
				</>
			)}
		</button>
	);
}
