import {
	type SlotsType,
	type VNode,
	defineComponent,
	h,
	inject,
	onMounted,
	ref,
} from "vue";
import { VIDE_REGISTER_KEY } from "./context.js";

export const VideVideo = defineComponent({
	name: "VideVideo",
	inheritAttrs: false,
	slots: Object as SlotsType<{ default?: () => VNode[] }>,
	setup(_, { attrs, slots, expose }) {
		const videoRef = ref<HTMLVideoElement | null>(null);
		const registerEl = inject(VIDE_REGISTER_KEY);

		expose({ video: videoRef });

		onMounted(() => {
			if (videoRef.value && registerEl) {
				registerEl(videoRef.value);
			}
		});

		return () => {
			const { class: className, ...videoAttrs } = attrs;
			return h("div", { class: className }, [
				h("video", { ...videoAttrs, ref: videoRef }),
				slots.default?.(),
			]);
		};
	},
});
