import { defineComponent, h, ref } from "vue";
import type { PlayerState } from "../../types.js";
import { useVideContext } from "../context.js";
import { useVideEvent } from "../use-vide-event.js";

function cx(...classes: (string | undefined)[]): string {
	return classes.filter(Boolean).join(" ");
}

export const VideProgress = defineComponent({
	name: "VideProgress",
	inheritAttrs: false,
	setup(_, { attrs }) {
		const player = useVideContext();
		const progress = ref(0);
		const buffered = ref(0);
		const disabled = ref(false);
		const dragging = ref(false);
		const rootRef = ref<HTMLDivElement | null>(null);

		useVideEvent(player, "timeupdate", ({ currentTime, duration }) => {
			if (!dragging.value && duration > 0) {
				progress.value = currentTime / duration;
			}
			const p = player.value;
			if (p && p.el.buffered.length > 0 && duration > 0) {
				const end = p.el.buffered.end(p.el.buffered.length - 1);
				buffered.value = Math.min(1, end / duration);
			}
		});

		useVideEvent(
			player,
			"statechange",
			({ to }: { from: PlayerState; to: PlayerState }) => {
				const isAd =
					to === "ad:loading" || to === "ad:playing" || to === "ad:paused";
				disabled.value = isAd;
			},
		);

		const getRatio = (e: PointerEvent): number => {
			if (!rootRef.value) return 0;
			const rect = rootRef.value.getBoundingClientRect();
			if (rect.width === 0) return 0;
			return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
		};

		const onPointerDown = (e: PointerEvent) => {
			if (!player.value || disabled.value) return;
			dragging.value = true;
			rootRef.value?.setPointerCapture(e.pointerId);
			progress.value = getRatio(e);
		};

		const onPointerMove = (e: PointerEvent) => {
			if (!dragging.value) return;
			progress.value = getRatio(e);
		};

		const onPointerUp = (e: PointerEvent) => {
			if (!dragging.value || !player.value) return;
			dragging.value = false;
			rootRef.value?.releasePointerCapture(e.pointerId);
			const ratio = getRatio(e);
			const duration = player.value.el.duration;
			if (Number.isFinite(duration) && duration > 0) {
				player.value.currentTime = ratio * duration;
			}
		};

		return () =>
			h(
				"div",
				{
					ref: rootRef,
					class: cx("vide-progress", attrs.class as string),
					role: "slider",
					tabindex: 0,
					"aria-label": "Seek",
					"aria-valuemin": 0,
					"aria-valuemax": 100,
					"aria-valuenow": Math.round(progress.value * 100),
					"data-disabled": disabled.value || undefined,
					style: {
						"--vide-progress": progress.value,
						"--vide-progress-buffered": buffered.value,
					},
					onPointerdown: onPointerDown,
					onPointermove: onPointerMove,
					onPointerup: onPointerUp,
				},
				[
					h("div", { class: "vide-progress__buffered" }),
					h("div", { class: "vide-progress__bar" }),
					h("div", { class: "vide-progress__handle" }),
				],
			);
	},
});
