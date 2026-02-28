import type { ComponentPropsWithoutRef } from "react";

export interface PosterProps extends ComponentPropsWithoutRef<"div"> {
	src: string;
	alt?: string;
}

export function Poster({ src, alt = "", className, ...divProps }: PosterProps) {
	return (
		<div
			className={["vide-poster", className].filter(Boolean).join(" ")}
			{...divProps}
		>
			<img className="vide-poster__image" src={src} alt={alt} />
		</div>
	);
}
