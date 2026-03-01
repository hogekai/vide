import { defineComponent, h, onScopeDispose, ref, watch } from "vue";
import { useVideContext } from "../context.js";
import { IconVolumeHigh, IconVolumeLow, IconVolumeMute } from "../icons.js";

function cx(...classes: (string | undefined)[]): string {
	return classes.filter(Boolean).join(" ");
}

export const VideVolume = defineComponent({
	name: "VideVolume",
	inheritAttrs: false,
	setup(_, { attrs, slots }) {
		const player = useVideContext();
		const volume = ref(1);
		const muted = ref(false);
		const dragging = ref(false);
		const sliderRef = ref<HTMLDivElement | null>(null);

		let offVolumeChange: (() => void) | undefined;

		watch(
			player,
			(p) => {
				offVolumeChange?.();
				offVolumeChange = undefined;
				if (!p) return;
				const sync = () => {
					if (!dragging.value) {
						volume.value = p.muted ? 0 : p.volume;
					}
					muted.value = p.muted || p.volume === 0;
				};
				p.el.addEventListener("volumechange", sync);
				sync();
				offVolumeChange = () => p.el.removeEventListener("volumechange", sync);
			},
			{ immediate: true },
		);

		onScopeDispose(() => {
			offVolumeChange?.();
		});

		const onMuteClick = () => {
			const p = player.value;
			if (!p) return;
			p.muted = !p.muted;
		};

		const getRatio = (e: PointerEvent): number => {
			if (!sliderRef.value) return 0;
			const rect = sliderRef.value.getBoundingClientRect();
			if (rect.width === 0) return 0;
			return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
		};

		const onPointerDown = (e: PointerEvent) => {
			const p = player.value;
			if (!p) return;
			dragging.value = true;
			sliderRef.value?.setPointerCapture(e.pointerId);
			const vol = getRatio(e);
			p.volume = vol;
			if (p.muted && vol > 0) p.muted = false;
			volume.value = vol;
			muted.value = vol === 0;
		};

		const onPointerMove = (e: PointerEvent) => {
			const p = player.value;
			if (!dragging.value || !p) return;
			const vol = getRatio(e);
			p.volume = vol;
			if (p.muted && vol > 0) p.muted = false;
			volume.value = vol;
			muted.value = vol === 0;
		};

		const onPointerUp = (e: PointerEvent) => {
			if (!dragging.value) return;
			dragging.value = false;
			sliderRef.value?.releasePointerCapture(e.pointerId);
		};

		return () =>
			h(
				"div",
				{
					class: cx("vide-volume", attrs.class as string),
					"data-muted": muted.value || undefined,
					style: { "--vide-volume": volume.value },
				},
				[
					h(
						"button",
						{
							type: "button",
							class: "vide-volume__button",
							"aria-label": muted.value ? "Unmute" : "Mute",
							onClick: onMuteClick,
						},
						slots.default?.() ?? [
							h(
								muted.value
									? IconVolumeMute
									: volume.value < 0.5
										? IconVolumeLow
										: IconVolumeHigh,
							),
						],
					),
					h(
						"div",
						{
							ref: sliderRef,
							class: "vide-volume__slider",
							role: "slider",
							tabindex: 0,
							"aria-label": "Volume",
							"aria-valuemin": 0,
							"aria-valuemax": 100,
							"aria-valuenow": Math.round(volume.value * 100),
							onPointerdown: onPointerDown,
							onPointermove: onPointerMove,
							onPointerup: onPointerUp,
						},
						[
							h("div", { class: "vide-volume__track" }),
							h("div", { class: "vide-volume__filled" }),
						],
					),
				],
			);
	},
});
