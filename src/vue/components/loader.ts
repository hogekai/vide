import { defineComponent, h } from "vue";

function cx(...classes: (string | undefined)[]): string {
	return classes.filter(Boolean).join(" ");
}

export const VideLoader = defineComponent({
	name: "VideLoader",
	inheritAttrs: false,
	setup(_, { attrs }) {
		return () =>
			h("div", { class: cx("vide-loader", attrs.class as string) }, [
				h("div", { class: "vide-loader__spinner" }),
			]);
	},
});
