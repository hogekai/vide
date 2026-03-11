<script setup lang="ts">
import { computed, ref } from "vue";
import type { PlaygroundConfig } from "./playground-codegen";
import {
	DEFAULT_VAST_TAG_URL,
	PRESETS,
	type PluginToggle,
} from "./playground-presets";

const props = defineProps<{
	config: PlaygroundConfig;
	presetId: string;
	customCode: string | null;
}>();

const emit = defineEmits<{
	(e: "update:config", config: PlaygroundConfig): void;
	(e: "update:presetId", id: string): void;
	(e: "openNewTab"): void;
	(e: "share"): void;
	(e: "reset"): void;
}>();

const showSettings = ref(false);
const copied = ref(false);

const currentPreset = computed(
	() => PRESETS.find((p) => p.id === props.presetId) ?? PRESETS[0],
);

const pluginToggles = computed(() => currentPreset.value.plugins);

function onPresetChange(e: Event) {
	const id = (e.target as HTMLSelectElement).value;
	const preset = PRESETS.find((p) => p.id === id);
	if (!preset) return;

	emit("update:presetId", id);
	emit("update:config", {
		sourceUrl: preset.sourceUrl,
		sourceType: preset.sourceType,
		enabledPlugins: preset.plugins.filter((p) => p.enabled).map((p) => p.id),
		vastTagUrl: preset.plugins.some((p) => p.id === "vast" && p.enabled)
			? DEFAULT_VAST_TAG_URL
			: undefined,
	});
}

function isPluginDisabled(plugin: PluginToggle): boolean {
	if (plugin.locked) return true;
	if (plugin.requires) {
		return !plugin.requires.some((r) =>
			props.config.enabledPlugins.includes(r),
		);
	}
	return false;
}

function onPluginToggle(pluginId: string) {
	const wasEnabled = props.config.enabledPlugins.includes(pluginId);
	let enabled = [...props.config.enabledPlugins];

	if (!wasEnabled) {
		enabled.push(pluginId);
		if (pluginId === "hls") enabled = enabled.filter((p) => p !== "dash");
		if (pluginId === "dash") enabled = enabled.filter((p) => p !== "hls");
	} else {
		enabled = enabled.filter((p) => p !== pluginId);
		for (const t of pluginToggles.value) {
			if (t.requires?.includes(pluginId)) {
				enabled = enabled.filter((p) => p !== t.id);
			}
		}
	}

	const update: PlaygroundConfig = {
		...props.config,
		enabledPlugins: enabled,
	};

	if (enabled.includes("vast") && !props.config.vastTagUrl) {
		update.vastTagUrl = DEFAULT_VAST_TAG_URL;
	}
	if (!enabled.includes("vast")) {
		update.vastTagUrl = undefined;
	}

	emit("update:config", update);
}

function onSourceUrlChange(e: Event) {
	emit("update:config", {
		...props.config,
		sourceUrl: (e.target as HTMLInputElement).value,
	});
}

function onVastTagChange(e: Event) {
	emit("update:config", {
		...props.config,
		vastTagUrl: (e.target as HTMLInputElement).value,
	});
}

function onShare() {
	emit("share");
	copied.value = true;
	setTimeout(() => {
		copied.value = false;
	}, 2000);
}
</script>

<template>
  <div class="pg-toolbar">
    <div class="pg-toolbar__row">
      <div class="pg-toolbar__left">
        <select
          :value="presetId"
          class="pg-toolbar__select"
          :class="{ 'pg-toolbar__select--dimmed': customCode != null }"
          @change="onPresetChange"
        >
          <option v-for="p in PRESETS" :key="p.id" :value="p.id">{{ p.label }}</option>
        </select>

        <div class="pg-toolbar__pills">
          <button
            v-for="plugin in pluginToggles"
            :key="plugin.id"
            class="pg-toolbar__pill"
            :class="{
              'pg-toolbar__pill--active': config.enabledPlugins.includes(plugin.id),
              'pg-toolbar__pill--disabled': isPluginDisabled(plugin),
            }"
            :disabled="isPluginDisabled(plugin)"
            @click="onPluginToggle(plugin.id)"
          >
            {{ plugin.label }}
          </button>
        </div>

        <span v-if="customCode != null" class="pg-toolbar__badge">Edited</span>
      </div>

      <div class="pg-toolbar__actions">
        <button
          class="pg-toolbar__btn"
          title="Settings"
          @click="showSettings = !showSettings"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="8" cy="8" r="2.5" />
            <path d="M13.5 8a5.5 5.5 0 0 0-.1-.8l1.3-1-.7-1.2-1.5.5a5.5 5.5 0 0 0-1.2-.7L11 3.3h-1.4l-.3 1.5c-.5.1-.9.4-1.2.7L6.6 5l-.7 1.2 1.3 1a5.5 5.5 0 0 0 0 1.6l-1.3 1 .7 1.2 1.5-.5c.3.3.7.5 1.2.7l.3 1.5H11l.3-1.5c.5-.2.9-.4 1.2-.7l1.5.5.7-1.2-1.3-1a5.5 5.5 0 0 0 .1-.8Z" />
          </svg>
        </button>
        <button class="pg-toolbar__btn" title="Open in new tab" @click="$emit('openNewTab')">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 2h4v4M14 2 8 8M6 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3" />
          </svg>
        </button>
        <button class="pg-toolbar__btn" :title="copied ? 'Copied!' : 'Share'" @click="onShare">
          <svg v-if="!copied" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="3" r="2" /><circle cx="4" cy="8" r="2" /><circle cx="12" cy="13" r="2" />
            <path d="m6 9 4 3M10 4 6 7" />
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 8 4 4 6-8" />
          </svg>
        </button>
        <button class="pg-toolbar__btn" title="Reset" @click="$emit('reset')">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 8a6 6 0 0 1 10.2-4.2M14 2v4h-4M14 8a6 6 0 0 1-10.2 4.2M2 14v-4h4" />
          </svg>
        </button>
      </div>
    </div>

    <div v-if="showSettings" class="pg-toolbar__settings">
      <label class="pg-toolbar__field">
        <span>Source URL</span>
        <input
          type="text"
          :value="config.sourceUrl"
          class="pg-toolbar__input"
          @change="onSourceUrlChange"
        />
      </label>
      <label v-if="config.enabledPlugins.includes('vast')" class="pg-toolbar__field">
        <span>VAST Tag URL</span>
        <input
          type="text"
          :value="config.vastTagUrl"
          class="pg-toolbar__input"
          @change="onVastTagChange"
        />
      </label>
    </div>
  </div>
</template>

<style scoped>
.pg-toolbar {
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 13px;
}

.pg-toolbar__row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  flex-wrap: wrap;
}

.pg-toolbar__left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
}

.pg-toolbar__select {
  padding: 4px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
}

.pg-toolbar__select:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.pg-toolbar__select--dimmed {
  opacity: 0.5;
}

.pg-toolbar__pills {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.pg-toolbar__pill {
  padding: 2px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
  line-height: 1.4;
}

.pg-toolbar__pill:hover:not(:disabled) {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
}

.pg-toolbar__pill--active {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.pg-toolbar__pill--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pg-toolbar__badge {
  padding: 1px 8px;
  border-radius: 8px;
  background: var(--vp-c-warning-soft);
  color: var(--vp-c-warning-1);
  font-size: 11px;
  font-weight: 600;
}

.pg-toolbar__actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.pg-toolbar__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.15s;
}

.pg-toolbar__btn:hover {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.pg-toolbar__settings {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 12px;
  border-top: 1px solid var(--vp-c-divider);
}

.pg-toolbar__field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pg-toolbar__field > span {
  font-weight: 600;
  color: var(--vp-c-text-2);
  font-size: 12px;
  white-space: nowrap;
  min-width: 80px;
}

.pg-toolbar__input {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 12px;
  font-family: inherit;
  min-width: 0;
}

.pg-toolbar__input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

@media (max-width: 767px) {
  .pg-toolbar__actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
