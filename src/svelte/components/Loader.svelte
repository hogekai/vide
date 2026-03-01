<script lang="ts">
interface Props {
	class?: string;
}

const { class: className }: Props = $props();
</script>

<div role="status" aria-label="Loading" class={["vide-loader", className].filter(Boolean).join(" ")}>
	<div class="vide-loader__spinner"></div>
</div>
