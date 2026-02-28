<script lang="ts">
interface Props {
	src: string;
	alt?: string;
	class?: string;
}

const { src, alt = "", class: className }: Props = $props();
</script>

<div class={["vide-poster", className].filter(Boolean).join(" ")}>
	<img class="vide-poster__image" {src} {alt} />
</div>
