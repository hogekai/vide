import { type VNode, defineComponent, h } from "vue";
import { useVideContext } from "../context.js";
import { useAdState } from "../use-ad-state.js";

function cx(...classes: (string | false | undefined)[]): string {
	return classes.filter(Boolean).join(" ");
}

export const VideAdLearnMore = defineComponent({
	name: "VideAdLearnMore",
	inheritAttrs: false,
	props: {
		showTitle: { type: Boolean, default: false },
	},
	setup(props, { attrs, slots }) {
		const player = useVideContext();
		const { active, meta } = useAdState(player);

		const onClick = () => {
			const p = player.value;
			if (!p || !meta.value?.clickThrough) return;
			p.el.click();
			window.open(meta.value.clickThrough, "_blank");
			p.el.pause();
		};

		return () => {
			if (!active.value || !meta.value?.clickThrough) return null;

			const children: (VNode | VNode[] | string)[] = [];
			if (props.showTitle && meta.value.adTitle) {
				children.push(
					h("span", { class: "vide-ad-cta__title" }, meta.value.adTitle),
				);
			}
			children.push(slots.default?.() ?? "Learn More");

			return h(
				"button",
				{
					type: "button",
					class: cx("vide-ad-cta", attrs.class as string),
					onClick,
				},
				children,
			);
		};
	},
});
