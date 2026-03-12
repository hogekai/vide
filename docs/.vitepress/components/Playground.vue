<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import PlaygroundCodePanel from "./PlaygroundCodePanel.vue";
import PlaygroundInspector from "./PlaygroundInspector.vue";
import type {
	InspectorEvent,
	InspectorPlayerState,
	InspectorQuality,
} from "./PlaygroundInspector.vue";
import PlaygroundPreview from "./PlaygroundPreview.vue";
import PlaygroundSidebar from "./PlaygroundSidebar.vue";
import {
	type FrameworkType,
	type PlaygroundConfig,
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
	muted: true,
	playsinline: true,
});

const framework = ref<FrameworkType>("vanilla");
const iframeError = ref<string | null>(null);

// Inspector state
const inspectorEvents = ref<InspectorEvent[]>([]);
const inspectorState = ref<InspectorPlayerState | null>(null);
const inspectorQualities = ref<InspectorQuality[]>([]);
const stateHistory = ref(new Set<string>(["idle"]));
let nextEventId = 0;

const displayCode = computed(() => generateCode(config.value, framework.value));
const iframeHtml = computed(() => generateIframeHtml(config.value));

// Reset inspector data when iframe HTML changes
watch(iframeHtml, () => {
	inspectorEvents.value = [];
	inspectorState.value = null;
	inspectorQualities.value = [];
	stateHistory.value = new Set(["idle"]);
	nextEventId = 0;
});

// --- URL state ---

let urlTimer: ReturnType<typeof setTimeout> | undefined;

function syncToUrl() {
	clearTimeout(urlTimer);
	urlTimer = setTimeout(() => {
		saveToUrl({
			presetId: presetId.value,
			config: config.value,
		});
	}, 300);
}

watch(config, syncToUrl, { deep: true });

function restoreFromUrl() {
	const state = decodeState(location.hash);
	if (!state) return;
	presetId.value = state.presetId;
	config.value = state.config;
}

// --- Message handling ---

function onMessage(e: MessageEvent) {
	const d = e.data;
	if (!d?.type) return;

	if (d.type === "vide-playground-error") {
		iframeError.value = d.message || "Unknown error";
	} else if (d.type === "vide-pg-event") {
		inspectorEvents.value.push({
			id: nextEventId++,
			event: d.event,
			data: d.data,
			ts: d.ts,
		});
		// Cap at 200 entries
		if (inspectorEvents.value.length > 200) {
			inspectorEvents.value = inspectorEvents.value.slice(-200);
		}
	} else if (d.type === "vide-pg-state") {
		inspectorState.value = {
			state: d.state,
			src: d.src,
			currentTime: d.currentTime,
			duration: d.duration,
			volume: d.volume,
			muted: d.muted,
			paused: d.paused,
			loop: d.loop,
			playbackRate: d.playbackRate,
			isAutoQuality: d.isAutoQuality,
			isLive: d.isLive,
		};
	} else if (d.type === "vide-pg-statechange") {
		stateHistory.value.add(d.to);
	} else if (d.type === "vide-pg-qualities") {
		inspectorQualities.value = d.qualities;
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
	iframeError.value = null;
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
		muted: true,
		playsinline: true,
	};
	iframeError.value = null;
}

function onClearEvents() {
	inspectorEvents.value = [];
	nextEventId = 0;
}
</script>

<template>
  <div ref="container" class="playground">
    <template v-if="visible">
      <PlaygroundSidebar
        :config="config"
        :preset-id="presetId"
        class="playground__sidebar"
        @update:config="onConfigUpdate"
        @update:preset-id="onPresetIdUpdate"
        @open-new-tab="onOpenNewTab"
        @share="onShare"
        @reset="onReset"
      />
      <div class="playground__center">
        <div class="playground__preview-zone">
          <PlaygroundPreview
            :html="iframeHtml"
            :error="iframeError"
            class="playground__preview"
            @dismiss-error="iframeError = null"
          />
        </div>
        <PlaygroundCodePanel
          :code="displayCode"
          :framework="framework"
          class="playground__code"
          @update:framework="framework = $event"
        />
      </div>
      <PlaygroundInspector
        :events="inspectorEvents"
        :player-state="inspectorState"
        :state-history="stateHistory"
        :qualities="inspectorQualities"
        :enabled-plugins="config.enabledPlugins"
        class="playground__inspector"
        @clear-events="onClearEvents"
      />
    </template>
    <div v-else class="playground__placeholder" />
  </div>
</template>

<style scoped>
.playground {
  display: flex;
  height: 100%;
  min-height: 500px;
  background: var(--vp-c-bg);
  overflow: hidden;
}

.playground__sidebar {
  width: 260px;
  flex-shrink: 0;
}

.playground__center {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.playground__preview-zone {
  flex: 1;
  min-height: 0;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.playground__preview {
  width: 100%;
  max-height: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.06);
}

.playground__code {
  flex-shrink: 0;
}

.playground__inspector {
  width: 300px;
  flex-shrink: 0;
}

.playground__placeholder {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--vp-c-bg-soft);
}

@media (max-width: 1023px) {
  .playground {
    flex-direction: column;
    height: auto;
    min-height: unset;
  }

  .playground__sidebar {
    width: 100%;
    max-height: 240px;
    border-right: none;
    border-bottom: 1px solid var(--vp-c-divider);
    overflow-y: auto;
  }

  .playground__center {
    min-height: 300px;
  }

  .playground__inspector {
    width: 100%;
    max-height: 280px;
    border-left: none;
    border-top: 1px solid var(--vp-c-divider);
    overflow-y: auto;
  }
}

@media (max-width: 480px) {
  .playground__sidebar {
    max-height: 200px;
  }

  .playground__center {
    min-height: 250px;
  }

  .playground__inspector {
    max-height: 240px;
  }
}
</style>
