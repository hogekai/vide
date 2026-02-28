import type { ComponentPropsWithoutRef } from "react";

export interface LoaderProps extends ComponentPropsWithoutRef<"div"> {}

export function Loader({ className, ...divProps }: LoaderProps) {
	return (
		<div
			className={["vide-loader", className].filter(Boolean).join(" ")}
			{...divProps}
		>
			<div className="vide-loader__spinner" />
		</div>
	);
}
