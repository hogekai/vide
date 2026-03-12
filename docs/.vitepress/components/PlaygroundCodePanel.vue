<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { type FrameworkType, frameworkToLang } from "./playground-codegen";

const FRAMEWORK_OPTIONS: { value: FrameworkType; label: string }[] = [
	{ value: "vanilla", label: "Vanilla" },
	{ value: "react", label: "React" },
	{ value: "vue", label: "Vue" },
	{ value: "svelte", label: "Svelte" },
];

const props = defineProps<{
	code: string;
	framework: FrameworkType;
}>();

const emit =
	defineEmits<(e: "update:framework", value: FrameworkType) => void>();

const codeOpen = ref(true);
const highlighted = ref("");
const highlighterReady = ref(false);
const copyLabel = ref("Copy");

let highlighter: {
	codeToHtml: (
		code: string,
		options: Record<string, unknown>,
	) => Promise<string>;
} | null = null;

let highlightTimer: ReturnType<typeof setTimeout> | undefined;

async function loadHighlighter() {
	try {
		const { codeToHtml } = await import(
			/* @vite-ignore */ "https://esm.sh/shiki@3/bundle/web"
		);
		highlighter = { codeToHtml };
		await highlight(props.code);
		highlighterReady.value = true;
	} catch {
		// Fallback: show raw text
	}
}

async function highlight(code: string) {
	if (!highlighter) {
		highlighted.value = "";
		return;
	}
	highlighted.value = await highlighter.codeToHtml(code, {
		lang: frameworkToLang(props.framework),
		themes: { light: "github-light", dark: "github-dark" },
	});
}

function scheduleHighlight(code: string) {
	clearTimeout(highlightTimer);
	highlightTimer = setTimeout(() => highlight(code), 150);
}

watch(() => props.code, scheduleHighlight);
watch(
	() => props.framework,
	() => scheduleHighlight(props.code),
);
onMounted(loadHighlighter);

function toggleCode() {
	codeOpen.value = !codeOpen.value;
}

function copyCode() {
	navigator.clipboard.writeText(props.code).then(() => {
		copyLabel.value = "Copied!";
		setTimeout(() => {
			copyLabel.value = "Copy";
		}, 1800);
	});
}
</script>

<template>
  <div class="pg-code">
    <div class="pg-code__body" :class="{ 'pg-code__body--open': codeOpen }">
      <div class="pg-code__tabs">
        <button
          v-for="opt in FRAMEWORK_OPTIONS"
          :key="opt.value"
          class="pg-code__tab"
          :class="{ 'pg-code__tab--active': framework === opt.value }"
          @click="emit('update:framework', opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
      <div class="pg-code__scroll">
        <div
          v-if="highlighterReady"
          class="pg-code__highlight"
          v-html="highlighted"
        />
        <pre v-else class="pg-code__raw">{{ code }}</pre>
      </div>
    </div>
    <div class="pg-code__toggle" :class="{ 'pg-code__toggle--open': codeOpen }" @click="toggleCode">
      <div class="pg-code__toggle-left">
        <span class="pg-code__label">Generated code</span>
        <span class="pg-code__arrow">&#x25B2;</span>
      </div>
      <button class="pg-code__copy" @click.stop="copyCode">{{ copyLabel }}</button>
    </div>
  </div>
</template>

<style scoped>
.pg-code {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--vp-c-divider);
}

.pg-code__body {
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.26s ease;
  background: var(--vp-c-bg);
}

.pg-code__body--open {
  max-height: 260px;
}

.pg-code__tabs {
  display: flex;
  gap: 0;
  padding: 6px 16px 0;
  border-bottom: 1px solid var(--vp-c-divider);
  flex-shrink: 0;
}

.pg-code__tab {
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  color: var(--vp-c-text-3);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  padding: 4px 10px 6px;
  transition: color 0.12s, border-color 0.12s;
}

.pg-code__tab:hover {
  color: var(--vp-c-text-2);
}

.pg-code__tab--active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
}

.pg-code__scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px 16px;
}

.pg-code__scroll::-webkit-scrollbar {
  width: 3px;
}

.pg-code__scroll::-webkit-scrollbar-thumb {
  background: var(--vp-c-divider);
  border-radius: 3px;
}

.pg-code__highlight :deep(pre) {
  margin: 0;
  padding: 0;
  background: transparent !important;
  font-family: ui-monospace, "SF Mono", Menlo, Monaco, "Cascadia Mono",
    "Segoe UI Mono", "Roboto Mono", monospace;
  font-size: 12px;
  line-height: 1.8;
  white-space: pre;
}

.pg-code__highlight :deep(code) {
  font: inherit;
  line-height: inherit;
}

.pg-code__raw {
  margin: 0;
  font-family: ui-monospace, "SF Mono", Menlo, Monaco, monospace;
  font-size: 12px;
  line-height: 1.8;
  color: var(--vp-c-text-2);
  white-space: pre;
}

.pg-code__toggle {
  flex-shrink: 0;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  cursor: pointer;
  background: var(--vp-c-bg-soft);
  border-top: 1px solid var(--vp-c-divider);
  transition: background 0.12s;
  user-select: none;
}

.pg-code__toggle:hover {
  background: var(--vp-c-bg-elv);
}

.pg-code__toggle-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pg-code__label {
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.pg-code__arrow {
  font-size: 10px;
  color: var(--vp-c-text-3);
  transition: transform 0.22s;
}

.pg-code__toggle--open .pg-code__arrow {
  transform: rotate(180deg);
}

.pg-code__copy {
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-3);
  background: none;
  border: none;
  cursor: pointer;
  padding: 3px 8px;
  border-radius: 5px;
  font-family: inherit;
  transition: color 0.12s, background 0.12s;
}

.pg-code__copy:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-elv);
}
</style>
