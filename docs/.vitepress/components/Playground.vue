<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import PlaygroundCode from "./PlaygroundCode.vue";
import PlaygroundControls from "./PlaygroundControls.vue";
import PlaygroundPreview from "./PlaygroundPreview.vue";
import {
	type PlaygroundConfig,
	generateCode,
	generateIframeHtml,
} from "./playground-codegen";
import { DEFAULT_VAST_TAG_URL, PRESETS } from "./playground-presets";

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

const displayCode = computed(() => generateCode(config.value));
const iframeHtml = computed(() => generateIframeHtml(config.value));

function onConfigUpdate(newConfig: PlaygroundConfig) {
	config.value = newConfig;
}

function onPresetIdUpdate(id: string) {
	presetId.value = id;
}

onMounted(() => {
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
});
</script>

<template>
  <div ref="container" class="playground">
    <template v-if="visible">
      <div class="playground__top">
        <PlaygroundPreview :html="iframeHtml" class="playground__preview" />
        <PlaygroundControls
          :config="config"
          :preset-id="presetId"
          class="playground__controls"
          @update:config="onConfigUpdate"
          @update:preset-id="onPresetIdUpdate"
        />
      </div>
      <PlaygroundCode :code="displayCode" class="playground__code" />
    </template>
    <div v-else class="playground__placeholder" />
  </div>
</template>

<style scoped>
.playground {
  margin: 1rem 0;
}

.playground__top {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 768px) {
  .playground__top {
    flex-direction: row;
  }

  .playground__preview {
    flex: 1;
    min-width: 0;
  }

  .playground__controls {
    width: 220px;
    flex-shrink: 0;
  }
}

.playground__code {
  margin-top: 16px;
}

.playground__placeholder {
  aspect-ratio: 16 / 9;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
}
</style>
