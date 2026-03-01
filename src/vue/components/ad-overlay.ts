import { defineComponent, h } from "vue";
import { useVideContext } from "../context.js";
import { useAdState } from "../use-ad-state.js";

function cx(...classes: (string | false | undefined)[]): string {
	return classes.filter(Boolean).join(" ");
}

export const VideAdOverlay = defineComponent({
	name: "VideAdOverlay",
	inheritAttrs: false,
	setup(_, { attrs, slots }) {
		const player = useVideContext();
		const { active, meta } = useAdState(player);

		const onClick = () => {
			const p = player.value;
			if (!p) return;
			p.el.click();
			const url = meta.value?.clickThrough;
			if (url) {
				window.open(url, "_blank");
				p.el.pause();
			} else {
				if (p.el.paused) {
					Promise.resolve(p.el.play()).catch(() => {});
				} else {
					p.el.pause();
				}
			}
		};

		return () => {
			if (!active.value) return null;
			return h(
				"div",
				{
					class: cx("vide-ad-overlay", attrs.class as string),
					onClick,
				},
				slots.default?.(),
			);
		};
	},
});
