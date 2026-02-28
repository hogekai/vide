import { defineComponent, h } from "vue";
import { useVideContext } from "../context.js";
import { IconPlay } from "../icons.js";

function cx(...classes: (string | undefined)[]): string {
	return classes.filter(Boolean).join(" ");
}

export const VideBigPlayButton = defineComponent({
	name: "VideBigPlayButton",
	inheritAttrs: false,
	setup(_, { attrs, slots }) {
		const player = useVideContext();

		const onClick = () => {
			const p = player.value;
			if (!p) return;
			if (p.state === "ended") {
				const current = p;
				function onReady({ to }: { from: string; to: string }): void {
					if (to === "ready") {
						current.off("statechange", onReady);
						current.play().catch(() => {});
					}
				}
				current.on("statechange", onReady);
				current.el.currentTime = 0;
				current.el.load();
				return;
			}
			p.play().catch(() => {});
		};

		return () =>
			h(
				"button",
				{
					type: "button",
					class: cx("vide-bigplay", attrs.class as string),
					"aria-label": "Play video",
					onClick,
				},
				slots.default?.() ?? [h(IconPlay)],
			);
	},
});
