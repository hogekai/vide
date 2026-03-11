<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";

const props = defineProps<{
	code: string;
}>();

const emit = defineEmits<{
	(e: "update:code", code: string): void;
}>();

const textareaEl = ref<HTMLTextAreaElement>();
const highlightEl = ref<HTMLElement>();
const highlighted = ref("");
const highlighterReady = ref(false);
let highlighter: {
	codeToHtml: (
		code: string,
		options: Record<string, unknown>,
	) => Promise<string>;
} | null = null;

let highlightTimer: ReturnType<typeof setTimeout> | undefined;

const textareaClass = computed(() => ({
	"pg-editor__textarea": true,
	"pg-editor__textarea--fallback": !highlighterReady.value,
}));

async function loadHighlighter() {
	try {
		const { codeToHtml } = await import(
			/* @vite-ignore */ "https://esm.sh/shiki@3/bundle/web"
		);
		highlighter = { codeToHtml };
		await highlight(props.code);
		highlighterReady.value = true;
	} catch {
		// Fallback: show raw text in textarea
	}
}

async function highlight(code: string) {
	if (!highlighter) {
		highlighted.value = "";
		return;
	}
	highlighted.value = await highlighter.codeToHtml(code, {
		lang: "typescript",
		themes: { light: "github-light", dark: "github-dark" },
	});
}

function scheduleHighlight(code: string) {
	clearTimeout(highlightTimer);
	highlightTimer = setTimeout(() => highlight(code), 150);
}

watch(() => props.code, scheduleHighlight);
onMounted(loadHighlighter);

function onInput(e: Event) {
	const value = (e.target as HTMLTextAreaElement).value;
	emit("update:code", value);
}

function onScroll() {
	if (!textareaEl.value || !highlightEl.value) return;
	highlightEl.value.scrollTop = textareaEl.value.scrollTop;
	highlightEl.value.scrollLeft = textareaEl.value.scrollLeft;
}
</script>

<template>
  <div class="pg-editor">
    <div class="pg-editor__header">
      <span class="pg-editor__label">Code</span>
    </div>
    <div class="pg-editor__container">
      <div
        v-if="highlighterReady"
        ref="highlightEl"
        class="pg-editor__highlight"
        v-html="highlighted"
        aria-hidden="true"
      />
      <textarea
        ref="textareaEl"
        :class="textareaClass"
        :value="code"
        spellcheck="false"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        @input="onInput"
        @scroll="onScroll"
      />
    </div>
  </div>
</template>

<style scoped>
.pg-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--vp-c-bg-soft);
}

.pg-editor__header {
  display: flex;
  align-items: center;
  padding: 6px 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  user-select: none;
}

.pg-editor__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pg-editor__container {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.pg-editor__highlight,
.pg-editor__textarea {
  position: absolute;
  inset: 0;
  padding: 16px;
  font-family: ui-monospace, "SF Mono", Menlo, Monaco, "Cascadia Mono",
    "Segoe UI Mono", "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace",
    "Source Code Pro", "Droid Sans Mono", "Courier New", monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre;
  word-wrap: normal;
  overflow: auto;
  tab-size: 2;
}

.pg-editor__textarea {
  color: transparent;
  caret-color: var(--vp-c-text-1);
  background: transparent;
  border: none;
  resize: none;
  z-index: 1;
  outline: none;
  -webkit-text-fill-color: transparent;
}

/* Show raw text when Shiki hasn't loaded */
.pg-editor__textarea--fallback {
  color: var(--vp-c-text-1);
  -webkit-text-fill-color: var(--vp-c-text-1);
}

.pg-editor__highlight {
  pointer-events: none;
  z-index: 0;
}

.pg-editor__highlight :deep(pre) {
  margin: 0;
  padding: 0;
  background: transparent !important;
  font: inherit;
  line-height: inherit;
  white-space: pre;
}

.pg-editor__highlight :deep(code) {
  font: inherit;
  line-height: inherit;
}
</style>
