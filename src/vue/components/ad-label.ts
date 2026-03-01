import { defineComponent, h } from "vue";
import { useVideContext } from "../context.js";
import { useAdState } from "../use-ad-state.js";

function cx(...classes: (string | false | undefined)[]): string {
	return classes.filter(Boolean).join(" ");
}

export const VideAdLabel = defineComponent({
	name: "VideAdLabel",
	inheritAttrs: false,
	setup(_, { attrs, slots }) {
		const player = useVideContext();
		const { active } = useAdState(player);

		return () => {
			if (!active.value) return null;
			return h(
				"div",
				{
					class: cx("vide-ad-label", attrs.class as string),
				},
				slots.default?.() ?? "Ad",
			);
		};
	},
});
