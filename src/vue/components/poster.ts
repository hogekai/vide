import { defineComponent, h } from "vue";

function cx(...classes: (string | undefined)[]): string {
	return classes.filter(Boolean).join(" ");
}

export const VidePoster = defineComponent({
	name: "VidePoster",
	inheritAttrs: false,
	props: {
		src: { type: String, required: true },
		alt: { type: String, default: "" },
	},
	setup(props, { attrs }) {
		return () =>
			h("div", { class: cx("vide-poster", attrs.class as string) }, [
				h("img", {
					class: "vide-poster__image",
					src: props.src,
					alt: props.alt,
				}),
			]);
	},
});
