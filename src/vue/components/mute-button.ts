import { defineComponent, h, onScopeDispose, ref, watch } from "vue";
import { useVideContext } from "../context.js";
import { IconVolumeHigh, IconVolumeLow, IconVolumeMute } from "../icons.js";

export const VideMuteButton = defineComponent({
	name: "VideMuteButton",
	inheritAttrs: false,
	setup(_, { attrs, slots }) {
		const player = useVideContext();
		const muted = ref(false);
		const volume = ref(1);

		let offVolumeChange: (() => void) | undefined;

		watch(
			player,
			(p) => {
				offVolumeChange?.();
				offVolumeChange = undefined;
				if (!p) return;
				const sync = () => {
					muted.value = p.muted || p.volume === 0;
					volume.value = p.volume;
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

		const onClick = () => {
			const p = player.value;
			if (!p) return;
			p.muted = !p.muted;
		};

		return () =>
			h(
				"button",
				{
					type: "button",
					class: attrs.class,
					"aria-label": muted.value ? "Unmute" : "Mute",
					"data-muted": muted.value || undefined,
					onClick,
				},
				slots.default?.() ??
					[
						h(
							muted.value
								? IconVolumeMute
								: volume.value < 0.5
									? IconVolumeLow
									: IconVolumeHigh,
						),
					],
			);
	},
});
