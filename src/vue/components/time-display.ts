import { defineComponent, h, ref } from "vue";
import { formatTime } from "../../ui/utils.js";
import { useVideContext } from "../context.js";
import { useVideEvent } from "../use-vide-event.js";

function cx(...classes: (string | undefined)[]): string {
	return classes.filter(Boolean).join(" ");
}

export const VideTimeDisplay = defineComponent({
	name: "VideTimeDisplay",
	inheritAttrs: false,
	props: {
		separator: { type: String, default: "/" },
	},
	setup(props, { attrs }) {
		const player = useVideContext();
		const currentTime = ref(0);
		const duration = ref(0);

		useVideEvent(player, "timeupdate", (data) => {
			currentTime.value = data.currentTime;
			duration.value = data.duration;
		});

		return () =>
			h("div", { class: cx("vide-time", attrs.class as string), "aria-label": "Time" }, [
				h("span", formatTime(currentTime.value)),
				h("span", props.separator),
				h("span", formatTime(duration.value)),
			]);
	},
});
