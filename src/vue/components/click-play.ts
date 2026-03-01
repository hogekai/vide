import { defineComponent, h, onScopeDispose } from "vue";
import { isAdState } from "../../ui/state.js";
import { useVideContext } from "../context.js";

const DBLCLICK_DELAY = 200;

function cx(...classes: (string | undefined)[]): string {
	return classes.filter(Boolean).join(" ");
}

export const VideClickPlay = defineComponent({
	name: "VideClickPlay",
	inheritAttrs: false,
	props: {
		enableFullscreen: { type: Boolean, default: true },
	},
	setup(props, { attrs }) {
		const player = useVideContext();
		let clickTimer: ReturnType<typeof setTimeout> | null = null;

		const togglePlay = () => {
			const p = player.value;
			if (!p) return;
			if (p.state === "playing" || p.state === "ad:playing") {
				p.pause();
			} else {
				p.play().catch(() => {});
			}
		};

		const toggleFullscreen = () => {
			if (!props.enableFullscreen) return;
			const p = player.value;
			const target =
				(p?.el.closest(".vide-ui") as HTMLElement | null) ??
				p?.el.parentElement;
			if (!target) return;
			if (document.fullscreenElement != null) {
				document.exitFullscreen().catch(() => {});
			} else if (target.requestFullscreen) {
				target.requestFullscreen().catch(() => {});
			}
		};

		const onClick = () => {
			const p = player.value;
			if (!p) return;

			if (isAdState(p.state)) {
				p.el.click();
				togglePlay();
				return;
			}

			if (clickTimer !== null) {
				clearTimeout(clickTimer);
				clickTimer = null;
				toggleFullscreen();
				return;
			}

			clickTimer = setTimeout(() => {
				clickTimer = null;
				togglePlay();
			}, DBLCLICK_DELAY);
		};

		onScopeDispose(() => {
			if (clickTimer !== null) {
				clearTimeout(clickTimer);
				clickTimer = null;
			}
		});

		return () =>
			h("div", {
				class: cx("vide-clickplay", attrs.class as string),
				role: "presentation",
				onClick,
			});
	},
});
