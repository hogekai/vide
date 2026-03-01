import {
	type ComponentPropsWithRef,
	type ReactNode,
	forwardRef,
	useContext,
	useEffect,
	useState,
} from "react";
import type { PlayerState } from "../types.js";
import { stateToClass } from "../ui/state.js";
import { VideContext } from "./context.js";

function cx(...classes: (string | undefined)[]): string {
	return classes.filter(Boolean).join(" ");
}

export interface VideUIProps extends ComponentPropsWithRef<"section"> {
	children: ReactNode;
}

export const VideUI = forwardRef<HTMLElement, VideUIProps>(function VideUI(
	{ children, className, ...sectionProps },
	ref,
) {
	const ctx = useContext(VideContext);
	const player = ctx?.player ?? null;
	const [stateClass, setStateClass] = useState("");

	useEffect(() => {
		if (!player) {
			setStateClass("");
			return;
		}
		setStateClass(stateToClass(player.state));
		const onStateChange = ({ to }: { from: PlayerState; to: PlayerState }) => {
			setStateClass(stateToClass(to));
		};
		player.on("statechange", onStateChange);
		return () => {
			player.off("statechange", onStateChange);
		};
	}, [player]);

	return (
		<section
			ref={ref}
			className={cx("vide-ui", stateClass, className)}
			aria-label="Video player"
			{...sectionProps}
		>
			{children}
		</section>
	);
});

export interface VideControlsProps extends ComponentPropsWithRef<"div"> {
	children: ReactNode;
}

export function VideControls({
	children,
	className,
	...divProps
}: VideControlsProps) {
	const ctx = useContext(VideContext);

	if (!ctx?.player) return null;

	return (
		<div className={cx("vide-controls", className)} {...divProps}>
			{children}
		</div>
	);
}
