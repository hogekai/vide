import { defineComponent, h, ref } from "vue";
import type { PlayerState } from "../../types.js";
import { useVideContext } from "../context.js";
import { IconPause, IconPlay } from "../icons.js";
import { useVideEvent } from "../use-vide-event.js";

function cx(...classes: (string | undefined)[]): string {
	return classes.filter(Boolean).join(" ");
}

export const VidePlayButton = defineComponent({
	name: "VidePlayButton",
	inheritAttrs: false,
	setup(_, { attrs, slots }) {
		const player = useVideContext();
		const playing = ref(false);

		useVideEvent(
			player,
			"statechange",
			({ to }: { from: PlayerState; to: PlayerState }) => {
				if (to === "playing" || to === "ad:playing") {
					playing.value = true;
				} else if (
					to === "paused" ||
					to === "ready" ||
					to === "ended" ||
					to === "ad:paused"
				) {
					playing.value = false;
				}
			},
		);

		const onClick = () => {
			const p = player.value;
			if (!p) return;
			if (p.state === "playing" || p.state === "ad:playing") {
				p.pause();
			} else {
				p.play().catch(() => {});
			}
		};

		return () =>
			h(
				"button",
				{
					type: "button",
					class: cx("vide-play", attrs.class as string),
					"aria-label": playing.value ? "Pause" : "Play",
					"data-playing": playing.value || undefined,
					onClick,
				},
				slots.default?.() ?? [h(playing.value ? IconPause : IconPlay)],
			);
	},
});
