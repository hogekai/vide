import { defineComponent, h, inject, onMounted, ref } from "vue";
import { VIDE_REGISTER_KEY } from "./context.js";

export const VideVideo = defineComponent({
	name: "VideVideo",
	inheritAttrs: false,
	setup(_, { attrs, expose }) {
		const videoRef = ref<HTMLVideoElement | null>(null);
		const registerEl = inject(VIDE_REGISTER_KEY);

		expose({ video: videoRef });

		onMounted(() => {
			if (videoRef.value && registerEl) {
				registerEl(videoRef.value);
			}
		});

		return () => h("video", { ...attrs, ref: videoRef });
	},
});
