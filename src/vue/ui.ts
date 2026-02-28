import { defineComponent, h, ref, watch } from "vue";
import type { PlayerState } from "../types.js";
import { stateToClass } from "../ui/state.js";
import { useVideContext } from "./context.js";

function cx(...classes: (string | undefined)[]): string {
	return classes.filter(Boolean).join(" ");
}

export const VideUI = defineComponent({
	name: "VideUI",
	inheritAttrs: false,
	setup(_, { attrs, slots }) {
		const player = useVideContext();
		const stateClass = ref("");

		watch(
			player,
			(p, _, onCleanup) => {
				if (!p) {
					stateClass.value = "";
					return;
				}
				stateClass.value = stateToClass(p.state);
				const handler = ({ to }: { from: PlayerState; to: PlayerState }) => {
					stateClass.value = stateToClass(to);
				};
				p.on("statechange", handler);
				onCleanup(() => p.off("statechange", handler));
			},
			{ immediate: true },
		);

		return () =>
			h(
				"div",
				{
					class: cx("vide-ui", stateClass.value, attrs.class as string),
					role: "region",
					"aria-label": "Video player",
				},
				slots.default?.(),
			);
	},
});

export const VideControls = defineComponent({
	name: "VideControls",
	inheritAttrs: false,
	setup(_, { attrs, slots }) {
		const player = useVideContext();

		return () => {
			if (!player.value) return null;
			return h(
				"div",
				{
					class: cx("vide-controls", attrs.class as string),
				},
				slots.default?.(),
			);
		};
	},
});
