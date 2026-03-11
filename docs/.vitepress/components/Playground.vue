<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import PlaygroundEditor from "./PlaygroundEditor.vue";
import PlaygroundPreview from "./PlaygroundPreview.vue";
import PlaygroundToolbar from "./PlaygroundToolbar.vue";
import {
	type PlaygroundConfig,
	codeToIframeHtml,
	generateCode,
	generateIframeHtml,
} from "./playground-codegen";
import { DEFAULT_VAST_TAG_URL, PRESETS } from "./playground-presets";
import { decodeState, saveToUrl } from "./playground-url-state";

const container = ref<HTMLElement>();
let observer: IntersectionObserver | null = null;
const visible = ref(false);

const defaultPreset = PRESETS[0];
const presetId = ref(defaultPreset.id);
const config = ref<PlaygroundConfig>({
	sourceUrl: defaultPreset.sourceUrl,
	sourceType: defaultPreset.sourceType,
	enabledPlugins: defaultPreset.plugins
		.filter((p) => p.enabled)
		.map((p) => p.id),
	vastTagUrl: defaultPreset.plugins.some((p) => p.id === "vast" && p.enabled)
		? DEFAULT_VAST_TAG_URL
		: undefined,
});

const customCode = ref<string | null>(null);
const iframeError = ref<string | null>(null);

const displayCode = computed(() =>
	customCode.value ?? generateCode(config.value),
);

const iframeHtml = computed(() =>
	customCode.value
		? codeToIframeHtml(customCode.value)
		: generateIframeHtml(config.value),
);

// --- URL state ---

let urlTimer: ReturnType<typeof setTimeout> | undefined;

function syncToUrl() {
	clearTimeout(urlTimer);
	urlTimer = setTimeout(() => {
		saveToUrl({
			presetId: presetId.value,
			config: config.value,
			customCode: customCode.value ?? undefined,
		});
	}, 300);
}

watch([config, customCode], syncToUrl, { deep: true });

function restoreFromUrl() {
	const state = decodeState(location.hash);
	if (!state) return;
	presetId.value = state.presetId;
	config.value = state.config;
	customCode.value = state.customCode ?? null;
}

// --- iframe error handling ---

function onMessage(e: MessageEvent) {
	if (e.data?.type === "vide-playground-error") {
		iframeError.value = e.data.message || "Unknown error";
	}
}

// --- Lifecycle ---

onMounted(() => {
	restoreFromUrl();
	window.addEventListener("message", onMessage);

	if (!container.value) return;
	observer = new IntersectionObserver(
		(entries) => {
			if (entries[0].isIntersecting) {
				visible.value = true;
				observer?.disconnect();
				observer = null;
			}
		},
		{ threshold: 0.1 },
	);
	observer.observe(container.value);
});

onBeforeUnmount(() => {
	observer?.disconnect();
	observer = null;
	window.removeEventListener("message", onMessage);
	clearTimeout(urlTimer);
});

// --- Event handlers ---

function onConfigUpdate(newConfig: PlaygroundConfig) {
	config.value = newConfig;
}

function onPresetIdUpdate(id: string) {
	presetId.value = id;
	customCode.value = null;
	iframeError.value = null;
}

function onCodeEdit(code: string) {
	customCode.value = code;
}

function onOpenNewTab() {
	const blob = new Blob([iframeHtml.value], { type: "text/html" });
	const url = URL.createObjectURL(blob);
	window.open(url, "_blank");
}

async function onShare() {
	syncToUrl();
	try {
		await navigator.clipboard.writeText(location.href);
	} catch {
		// ignore
	}
}

function onReset() {
	const preset = PRESETS[0];
	presetId.value = preset.id;
	config.value = {
		sourceUrl: preset.sourceUrl,
		sourceType: preset.sourceType,
		enabledPlugins: preset.plugins.filter((p) => p.enabled).map((p) => p.id),
		vastTagUrl: preset.plugins.some((p) => p.id === "vast" && p.enabled)
			? DEFAULT_VAST_TAG_URL
			: undefined,
	};
	customCode.value = null;
	iframeError.value = null;
}
</script>

<template>
  <div ref="container" class="playground">
    <template v-if="visible">
      <PlaygroundToolbar
        :config="config"
        :preset-id="presetId"
        :custom-code="customCode"
        @update:config="onConfigUpdate"
        @update:preset-id="onPresetIdUpdate"
        @open-new-tab="onOpenNewTab"
        @share="onShare"
        @reset="onReset"
      />
      <div class="playground__panels">
        <PlaygroundEditor
          :code="displayCode"
          class="playground__editor"
          @update:code="onCodeEdit"
        />
        <div class="playground__divider" />
        <PlaygroundPreview
          :html="iframeHtml"
          :error="iframeError"
          class="playground__preview"
          @dismiss-error="iframeError = null"
        />
      </div>
    </template>
    <div v-else class="playground__placeholder" />
  </div>
</template>

<style scoped>
.playground {
  margin: 1rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.playground__panels {
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.playground__editor {
  min-height: 200px;
}

.playground__divider {
  height: 1px;
  background: var(--vp-c-divider);
  flex-shrink: 0;
}

.playground__preview {
  min-height: 200px;
  flex: 1;
}

@media (min-width: 768px) {
  .playground__panels {
    flex-direction: row;
    min-height: 480px;
  }

  .playground__editor {
    flex: 1;
    min-width: 0;
    min-height: unset;
  }

  .playground__divider {
    width: 1px;
    height: auto;
    flex-shrink: 0;
  }

  .playground__preview {
    flex: 1;
    min-width: 0;
    min-height: unset;
  }
}

.playground__placeholder {
  aspect-ratio: 16 / 9;
  background: var(--vp-c-bg-soft);
}
</style>
