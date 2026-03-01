import type { ComponentPropsWithoutRef } from "react";

export interface LoaderProps extends ComponentPropsWithoutRef<"div"> {}

export function Loader({ className, ...divProps }: LoaderProps) {
	return (
		<div
			role="status"
			aria-label="Loading"
			className={["vide-loader", className].filter(Boolean).join(" ")}
			{...divProps}
		>
			<div className="vide-loader__spinner" />
		</div>
	);
}
