import { type VNode, computed, defineComponent, h } from "vue";
import { useVideContext } from "../context.js";
import { IconExternalLink } from "../icons.js";
import { useAdState } from "../use-ad-state.js";

function cx(...classes: (string | false | undefined)[]): string {
	return classes.filter(Boolean).join(" ");
}

function hostname(url: string): string {
	try {
		return new URL(url).hostname;
	} catch {
		return url;
	}
}

export const VideAdLearnMore = defineComponent({
	name: "VideAdLearnMore",
	inheritAttrs: false,
	setup(_, { attrs, slots }) {
		const player = useVideContext();
		const { active, meta } = useAdState(player);

		const host = computed(() =>
			meta.value?.clickThrough ? hostname(meta.value.clickThrough) : "",
		);

		const onClick = () => {
			const p = player.value;
			if (!p || !meta.value?.clickThrough) return;
			p.el.click();
			window.open(meta.value.clickThrough, "_blank");
			p.el.pause();
		};

		return () => {
			if (!active.value || !meta.value?.clickThrough) return null;

			const defaultContent: VNode[] = [
				h("span", { class: "vide-ad-cta__icon" }, [h(IconExternalLink)]),
				h("span", { class: "vide-ad-cta__body" }, [
					...(meta.value.adTitle
						? [h("span", { class: "vide-ad-cta__title" }, meta.value.adTitle)]
						: []),
					h("span", { class: "vide-ad-cta__url" }, host.value),
				]),
			];

			return h(
				"button",
				{
					type: "button",
					class: cx("vide-ad-cta", attrs.class as string),
					onClick,
				},
				slots.default?.() ?? defaultContent,
			);
		};
	},
});
