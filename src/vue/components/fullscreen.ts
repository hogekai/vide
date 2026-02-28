import { defineComponent, h, onMounted, onScopeDispose, ref } from "vue";
import { useVideContext } from "../context.js";
import { IconFullscreenEnter, IconFullscreenExit } from "../icons.js";

function cx(...classes: (string | undefined)[]): string {
	return classes.filter(Boolean).join(" ");
}

export const VideFullscreenButton = defineComponent({
	name: "VideFullscreenButton",
	inheritAttrs: false,
	props: {
		target: { type: Object as () => HTMLElement | null, default: null },
	},
	setup(props, { attrs, slots }) {
		const player = useVideContext();
		const active = ref(false);

		const onChange = () => {
			active.value =
				document.fullscreenElement != null ||
				// biome-ignore lint/suspicious/noExplicitAny: webkit vendor prefix
				(document as any).webkitFullscreenElement != null;
		};

		onMounted(() => {
			document.addEventListener("fullscreenchange", onChange);
			document.addEventListener("webkitfullscreenchange", onChange);
		});

		onScopeDispose(() => {
			document.removeEventListener("fullscreenchange", onChange);
			document.removeEventListener("webkitfullscreenchange", onChange);
		});

		const onClick = () => {
			const fsTarget =
				props.target ??
				(player.value?.el.closest(".vide-ui") as HTMLElement | null) ??
				player.value?.el.parentElement;
			if (!fsTarget) return;
			if (document.fullscreenElement) {
				document.exitFullscreen().catch(() => {});
			} else {
				fsTarget.requestFullscreen().catch(() => {});
			}
		};

		return () =>
			h(
				"button",
				{
					type: "button",
					class: cx("vide-fullscreen", attrs.class as string),
					"aria-label": active.value ? "Exit fullscreen" : "Fullscreen",
					"data-fullscreen": active.value || undefined,
					onClick,
				},
				slots.default?.() ??
					[h(active.value ? IconFullscreenExit : IconFullscreenEnter)],
			);
	},
});
