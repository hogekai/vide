<script setup lang="ts">
import { computed } from "vue";
import type { PlaygroundConfig } from "./playground-codegen";
import {
	DEFAULT_VAST_TAG_URL,
	PRESETS,
	type PluginToggle,
} from "./playground-presets";

const props = defineProps<{
	config: PlaygroundConfig;
	presetId: string;
}>();

const emit = defineEmits<{
	(e: "update:config", config: PlaygroundConfig): void;
	(e: "update:presetId", id: string): void;
}>();

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

function onSourceUrlChange(e: Event) {
	emit("update:config", {
		...props.config,
		sourceUrl: (e.target as HTMLInputElement).value,
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

function onPluginToggle(pluginId: string, checked: boolean) {
	let enabled = [...props.config.enabledPlugins];

	if (checked) {
		enabled.push(pluginId);
		// HLS and DASH are mutually exclusive
		if (pluginId === "hls") enabled = enabled.filter((p) => p !== "dash");
		if (pluginId === "dash") enabled = enabled.filter((p) => p !== "hls");
	} else {
		enabled = enabled.filter((p) => p !== pluginId);
		// Disable dependents
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

function onVastTagChange(e: Event) {
	emit("update:config", {
		...props.config,
		vastTagUrl: (e.target as HTMLInputElement).value,
	});
}
</script>

<template>
  <div class="pg-controls">
    <label class="pg-controls__label">
      <span>Preset</span>
      <select :value="presetId" class="pg-controls__select" @change="onPresetChange">
        <option v-for="p in PRESETS" :key="p.id" :value="p.id">{{ p.label }}</option>
      </select>
    </label>

    <label class="pg-controls__label">
      <span>Source URL</span>
      <input
        type="text"
        :value="config.sourceUrl"
        class="pg-controls__input"
        @change="onSourceUrlChange"
      />
    </label>

    <fieldset class="pg-controls__fieldset">
      <legend>Plugins</legend>
      <label
        v-for="plugin in pluginToggles"
        :key="plugin.id"
        class="pg-controls__toggle"
        :class="{ 'pg-controls__toggle--disabled': isPluginDisabled(plugin) }"
      >
        <input
          type="checkbox"
          :checked="config.enabledPlugins.includes(plugin.id)"
          :disabled="isPluginDisabled(plugin)"
          @change="onPluginToggle(plugin.id, ($event.target as HTMLInputElement).checked)"
        />
        {{ plugin.label }}
      </label>
    </fieldset>

    <label v-if="config.enabledPlugins.includes('vast')" class="pg-controls__label">
      <span>VAST Tag URL</span>
      <input
        type="text"
        :value="config.vastTagUrl"
        class="pg-controls__input"
        @change="onVastTagChange"
      />
    </label>
  </div>
</template>

<style scoped>
.pg-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 13px;
}

.pg-controls__label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pg-controls__label > span {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.pg-controls__select,
.pg-controls__input {
  padding: 6px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 13px;
  font-family: inherit;
}

.pg-controls__select:focus,
.pg-controls__input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.pg-controls__fieldset {
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 8px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}

.pg-controls__fieldset legend {
  font-weight: 600;
  color: var(--vp-c-text-1);
  padding: 0 4px;
}

.pg-controls__toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: var(--vp-c-text-1);
}

.pg-controls__toggle--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
