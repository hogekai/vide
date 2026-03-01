import { type PropType, defineComponent, h, ref } from "vue";
import { useVideContext } from "../context.js";
import { useAdState } from "../use-ad-state.js";
import { useVideEvent } from "../use-vide-event.js";

function cx(...classes: (string | false | undefined)[]): string {
	return classes.filter(Boolean).join(" ");
}

export const VideAdCountdown = defineComponent({
	name: "VideAdCountdown",
	inheritAttrs: false,
	props: {
		format: {
			type: Function as PropType<(remaining: number) => string>,
			default: undefined,
		},
	},
	setup(props, { attrs }) {
		const player = useVideContext();
		const { active, meta } = useAdState(player);
		const remaining = ref(0);

		useVideEvent(player, "timeupdate", ({ currentTime }) => {
			if (!active.value || !meta.value) return;
			const p = player.value;
			const duration =
				meta.value.duration ??
				(p && Number.isFinite(p.duration) ? p.duration : 0);
			remaining.value = Math.max(0, Math.ceil(duration - currentTime));
		});

		return () => {
			if (!active.value) return null;
			return h(
				"div",
				{
					class: cx("vide-ad-countdown", attrs.class as string),
				},
				props.format
					? props.format(remaining.value)
					: `Ad \u00b7 ${remaining.value}s`,
			);
		};
	},
});
