<script lang="ts">
import { setContext } from "svelte";
import VideVideo from "../../src/svelte/Video.svelte";
import {
	type PlayerGetter,
	type RegisterFn,
	VIDE_PLAYER_KEY,
	VIDE_REGISTER_KEY,
} from "../../src/svelte/context.js";

interface Props {
	onRegister?: (el: HTMLVideoElement) => void;
}

const { onRegister }: Props = $props();

const getPlayer: PlayerGetter = () => null;
const registerEl: RegisterFn = (el) => {
	onRegister?.(el as HTMLVideoElement);
};

setContext(VIDE_PLAYER_KEY, getPlayer);
setContext(VIDE_REGISTER_KEY, registerEl);
</script>

<VideVideo src="video.mp4" />
