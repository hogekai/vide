import { defineComponent, h, onScopeDispose, ref, watch } from "vue";
import { useVideContext } from "../context.js";

function cx(...classes: (string | undefined)[]): string {
	return classes.filter(Boolean).join(" ");
}

export const VideErrorDisplay = defineComponent({
	name: "VideErrorDisplay",
	inheritAttrs: false,
	setup(_, { attrs }) {
		const player = useVideContext();
		const message = ref("");

		let offError: (() => void) | undefined;

		watch(
			player,
			(p) => {
				offError?.();
				offError = undefined;
				if (!p) return;
				const handler = ({ message: msg }: { message: string }) => {
					message.value = msg;
				};
				p.on("error", handler);
				offError = () => p.off("error", handler);
			},
			{ immediate: true },
		);

		onScopeDispose(() => {
			offError?.();
		});

		return () =>
			h(
				"div",
				{ class: cx("vide-error", attrs.class as string), role: "alert" },
				[h("span", { class: "vide-error__message" }, message.value)],
			);
	},
});
