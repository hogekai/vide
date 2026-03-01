import { defineComponent, h, ref } from "vue";
import { useVideContext } from "../context.js";
import { useAdState } from "../use-ad-state.js";
import { useVideEvent } from "../use-vide-event.js";

function cx(...classes: (string | false | undefined)[]): string {
	return classes.filter(Boolean).join(" ");
}

export const VideAdSkip = defineComponent({
	name: "VideAdSkip",
	inheritAttrs: false,
	setup(_, { attrs, slots }) {
		const player = useVideContext();
		const { active, meta } = useAdState(player);
		const canSkip = ref(false);
		const countdown = ref(0);

		useVideEvent(player, "timeupdate", ({ currentTime }) => {
			if (!active.value || !meta.value || meta.value.skipOffset === undefined)
				return;
			if (currentTime >= meta.value.skipOffset) {
				canSkip.value = true;
			} else {
				canSkip.value = false;
				countdown.value = Math.max(
					0,
					Math.ceil(meta.value.skipOffset - currentTime),
				);
			}
		});

		const onClick = () => {
			const p = player.value;
			if (!p || !canSkip.value || !meta.value) return;
			p.emit("ad:skip", { adId: meta.value.adId });
		};

		return () => {
			if (!active.value || !meta.value || meta.value.skipOffset === undefined)
				return null;

			return h(
				"button",
				{
					type: "button",
					class: cx(
						"vide-skip",
						!canSkip.value && "vide-skip--disabled",
						attrs.class as string,
					),
					"aria-label": "Skip ad",
					onClick,
					disabled: !canSkip.value,
				},
				canSkip.value
					? (slots.default?.() ?? "Skip Ad")
					: `Skip in ${countdown.value}s`,
			);
		};
	},
});
