<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

const props = defineProps<{
	code: string;
}>();

const highlighted = ref("");
const copied = ref(false);
let highlighter: {
	codeToHtml: (
		code: string,
		options: Record<string, unknown>,
	) => Promise<string>;
} | null = null;

async function loadHighlighter() {
	try {
		const { codeToHtml } = await import(
			/* @vite-ignore */ "https://esm.sh/shiki@3/bundle/web"
		);
		highlighter = { codeToHtml };
		highlight();
	} catch {
		// Fallback: no highlighting
	}
}

async function highlight() {
	if (!highlighter) {
		highlighted.value = "";
		return;
	}
	highlighted.value = await highlighter.codeToHtml(props.code, {
		lang: "typescript",
		themes: { light: "github-light", dark: "github-dark" },
	});
}

watch(() => props.code, highlight);
onMounted(loadHighlighter);

async function copy() {
	try {
		await navigator.clipboard.writeText(props.code);
		copied.value = true;
		setTimeout(() => {
			copied.value = false;
		}, 2000);
	} catch {
		// ignore
	}
}
</script>

<template>
  <div class="pg-code">
    <button class="pg-code__copy" @click="copy">
      {{ copied ? "Copied!" : "Copy" }}
    </button>
    <div v-if="highlighted" class="pg-code__highlighted" v-html="highlighted" />
    <pre v-else class="pg-code__fallback"><code>{{ code }}</code></pre>
  </div>
</template>

<style scoped>
.pg-code {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.pg-code__copy {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  padding: 4px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}

.pg-code__copy:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-text-2);
}

.pg-code :deep(pre) {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.6;
}

.pg-code__fallback {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}
</style>
