<script setup lang="ts">
import { computed, ref } from "vue";
import type { PlaygroundConfig } from "./playground-codegen";
import {
	DEFAULT_VAST_TAG_URL,
	PRESETS,
	type PluginToggle,
	UI_COMPONENT_NAMES,
} from "./playground-presets";

const props = defineProps<{
	config: PlaygroundConfig;
	presetId: string;
}>();

const emit = defineEmits<{
	(e: "update:config", config: PlaygroundConfig): void;
	(e: "update:presetId", id: string): void;
	(e: "openNewTab"): void;
	(e: "share"): void;
	(e: "reset"): void;
}>();

const copied = ref(false);
const expandedPlugin = ref<string | null>(null);

// Draft source fields (applied on "Load source" click)
const draftSourceUrl = ref(props.config.sourceUrl);
const draftSourceType = ref(props.config.sourceType);
const draftPosterUrl = ref(props.config.posterUrl || "");

const currentPreset = computed(
	() => PRESETS.find((p) => p.id === props.presetId) ?? PRESETS[0],
);

const pluginToggles = computed(() => currentPreset.value.plugins);

function isPluginDisabled(plugin: PluginToggle): boolean {
	if (plugin.locked) return true;
	if (plugin.requires) {
		if (!plugin.requires.some((r) => props.config.enabledPlugins.includes(r)))
			return true;
	}
	if (plugin.excludes) {
		if (plugin.excludes.some((r) => props.config.enabledPlugins.includes(r)))
			return true;
	}
	return false;
}

function onPresetChange(e: Event) {
	const id = (e.target as HTMLSelectElement).value;
	const preset = PRESETS.find((p) => p.id === id);
	if (!preset) return;

	emit("update:presetId", id);
	const enabledIds = preset.plugins.filter((p) => p.enabled).map((p) => p.id);
	const newConfig: PlaygroundConfig = {
		sourceUrl: preset.sourceUrl,
		sourceType: preset.sourceType,
		enabledPlugins: enabledIds,
		vastTagUrl: enabledIds.includes("vast") ? DEFAULT_VAST_TAG_URL : undefined,
		imaAdTagUrl: enabledIds.includes("ima") ? DEFAULT_VAST_TAG_URL : undefined,
	};
	emit("update:config", newConfig);
	draftSourceUrl.value = preset.sourceUrl;
	draftSourceType.value = preset.sourceType;
	draftPosterUrl.value = "";
}

function onPluginToggle(pluginId: string) {
	const wasEnabled = props.config.enabledPlugins.includes(pluginId);
	let enabled = [...props.config.enabledPlugins];

	if (!wasEnabled) {
		enabled.push(pluginId);
		if (pluginId === "hls") enabled = enabled.filter((p) => p !== "dash");
		if (pluginId === "dash") enabled = enabled.filter((p) => p !== "hls");
		// IMA is mutually exclusive with VAST/VMAP (and their ad plugins)
		if (pluginId === "ima") {
			enabled = enabled.filter(
				(p) => !["vast", "vmap", "omid", "simid", "vpaid"].includes(p),
			);
		}
		if (pluginId === "vast" || pluginId === "vmap") {
			enabled = enabled.filter((p) => p !== "ima");
		}
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
	if (!enabled.includes("drm")) {
		update.drmKeySystem = undefined;
		update.drmLicenseUrl = undefined;
	} else if (!update.drmKeySystem) {
		update.drmKeySystem = "widevine";
	}
	if (!enabled.includes("vmap")) {
		update.vmapUrl = undefined;
	}
	if (enabled.includes("ima") && !update.imaAdTagUrl) {
		update.imaAdTagUrl = DEFAULT_VAST_TAG_URL;
	}
	if (!enabled.includes("ima")) {
		update.imaAdTagUrl = undefined;
		update.imaTimeout = undefined;
	}
	if (!enabled.includes("ssai")) {
		update.ssaiTolerance = undefined;
	}

	emit("update:config", update);
}

function toggleExpand(pluginId: string) {
	expandedPlugin.value = expandedPlugin.value === pluginId ? null : pluginId;
}

function hasOptions(pluginId: string): boolean {
	return ["vast", "vmap", "ui", "drm", "ima", "ssai"].includes(pluginId);
}

function applySource() {
	const url = draftSourceUrl.value.trim();
	if (!url) return;
	emit("update:config", {
		...props.config,
		sourceUrl: url,
		sourceType: draftSourceType.value,
		posterUrl: draftPosterUrl.value.trim() || undefined,
	});
}

function onToggleSwitch(key: "autoplay" | "muted" | "loop" | "playsinline") {
	emit("update:config", {
		...props.config,
		[key]: !props.config[key],
	});
}

function onVastTagChange(e: Event) {
	emit("update:config", {
		...props.config,
		vastTagUrl: (e.target as HTMLInputElement).value,
	});
}

function onVastTimeoutChange(e: Event) {
	emit("update:config", {
		...props.config,
		vastTimeout: Number.parseInt((e.target as HTMLInputElement).value) || 5000,
	});
}

function onVastSkipChange(e: Event) {
	emit("update:config", {
		...props.config,
		vastAllowSkip: (e.target as HTMLSelectElement).value === "true",
	});
}

function onVmapUrlChange(e: Event) {
	emit("update:config", {
		...props.config,
		vmapUrl: (e.target as HTMLInputElement).value,
	});
}

function onDrmKeySystemChange(e: Event) {
	emit("update:config", {
		...props.config,
		drmKeySystem: (e.target as HTMLSelectElement)
			.value as PlaygroundConfig["drmKeySystem"],
	});
}

function onDrmUrlChange(e: Event) {
	emit("update:config", {
		...props.config,
		drmLicenseUrl: (e.target as HTMLInputElement).value,
	});
}

function onImaTagChange(e: Event) {
	emit("update:config", {
		...props.config,
		imaAdTagUrl: (e.target as HTMLInputElement).value,
	});
}

function onImaTimeoutChange(e: Event) {
	emit("update:config", {
		...props.config,
		imaTimeout: Number.parseInt((e.target as HTMLInputElement).value) || 6000,
	});
}

function onSsaiToleranceChange(e: Event) {
	emit("update:config", {
		...props.config,
		ssaiTolerance:
			Number.parseFloat((e.target as HTMLInputElement).value) || 0.5,
	});
}

function toggleUiExclude(comp: string) {
	const current = props.config.uiExclude || [];
	const next = current.includes(comp)
		? current.filter((c) => c !== comp)
		: [...current, comp];
	emit("update:config", {
		...props.config,
		uiExclude: next.length ? next : undefined,
	});
}

function onShare() {
	emit("share");
	copied.value = true;
	setTimeout(() => {
		copied.value = false;
	}, 2000);
}

function fillExample() {
	draftSourceUrl.value = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
	draftSourceType.value = "hls";
}
</script>

<template>
  <div class="pg-sidebar">
    <div class="pg-sidebar__scroll">
      <!-- Source -->
      <div class="pg-sidebar__section">
        <div class="pg-sidebar__title">Source</div>
        <div class="pg-sidebar__field">
          <input
            v-model="draftSourceUrl"
            type="url"
            class="pg-sidebar__input"
            placeholder="https://… video.mp4 or .m3u8"
          />
        </div>
        <div class="pg-sidebar__row">
          <div class="pg-sidebar__field pg-sidebar__field--half">
            <div class="pg-sidebar__label">Type</div>
            <select v-model="draftSourceType" class="pg-sidebar__select">
              <option value="mp4">MP4 / WebM</option>
              <option value="hls">HLS (.m3u8)</option>
              <option value="dash">DASH (.mpd)</option>
            </select>
          </div>
          <div class="pg-sidebar__field pg-sidebar__field--half">
            <div class="pg-sidebar__label">Poster <span class="pg-sidebar__opt">optional</span></div>
            <input
              v-model="draftPosterUrl"
              type="url"
              class="pg-sidebar__input"
              placeholder="https://…"
            />
          </div>
        </div>
        <div class="pg-sidebar__hint">
          Try: <button class="pg-sidebar__hint-link" @click="fillExample">test-streams.mux.dev/x36xhzz/x36xhzz.m3u8</button>
        </div>
        <button class="pg-sidebar__go" @click="applySource">Load source</button>
      </div>

      <div class="pg-sidebar__divider" />

      <!-- Plugins -->
      <div class="pg-sidebar__section">
        <div class="pg-sidebar__title">Plugins</div>
        <div
          v-for="plugin in pluginToggles"
          :key="plugin.id"
          class="pg-sidebar__plugin"
        >
          <div
            class="pg-sidebar__plugin-row"
            :class="{ 'pg-sidebar__plugin-row--disabled': isPluginDisabled(plugin) }"
            @click="!isPluginDisabled(plugin) && onPluginToggle(plugin.id)"
          >
            <div
              class="pg-sidebar__dot"
              :class="{ 'pg-sidebar__dot--on': config.enabledPlugins.includes(plugin.id) }"
            />
            <span class="pg-sidebar__plugin-name">{{ plugin.label }}</span>
            <span class="pg-sidebar__plugin-size">{{ plugin.gzipSize }}</span>
            <button
              v-if="hasOptions(plugin.id) && config.enabledPlugins.includes(plugin.id)"
              class="pg-sidebar__expand-btn"
              :class="{ 'pg-sidebar__expand-btn--open': expandedPlugin === plugin.id }"
              @click.stop="toggleExpand(plugin.id)"
            >
              ›
            </button>
          </div>

          <!-- VAST options -->
          <div
            v-if="plugin.id === 'vast' && config.enabledPlugins.includes('vast') && expandedPlugin === 'vast'"
            class="pg-sidebar__plugin-opts"
          >
            <div
              v-if="config.enabledPlugins.includes('vmap')"
              class="pg-sidebar__warn"
            >
              vmap already includes vast internally
            </div>
            <div class="pg-sidebar__field">
              <div class="pg-sidebar__opt-label">tagUrl</div>
              <input
                type="url"
                class="pg-sidebar__input"
                :value="config.vastTagUrl"
                placeholder="https://…/vast.xml"
                @change="onVastTagChange"
              />
            </div>
            <div class="pg-sidebar__row">
              <div class="pg-sidebar__field pg-sidebar__field--half">
                <div class="pg-sidebar__opt-label">timeout (ms)</div>
                <input
                  type="number"
                  class="pg-sidebar__input"
                  :value="config.vastTimeout || 5000"
                  @change="onVastTimeoutChange"
                />
              </div>
              <div class="pg-sidebar__field pg-sidebar__field--half">
                <div class="pg-sidebar__opt-label">allowSkip</div>
                <select
                  class="pg-sidebar__select"
                  :value="config.vastAllowSkip !== false ? 'true' : 'false'"
                  @change="onVastSkipChange"
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              </div>
            </div>
          </div>

          <!-- VMAP options -->
          <div
            v-if="plugin.id === 'vmap' && config.enabledPlugins.includes('vmap') && expandedPlugin === 'vmap'"
            class="pg-sidebar__plugin-opts"
          >
            <div class="pg-sidebar__field">
              <div class="pg-sidebar__opt-label">url</div>
              <input
                type="url"
                class="pg-sidebar__input"
                :value="config.vmapUrl"
                placeholder="https://…/vmap.xml"
                @change="onVmapUrlChange"
              />
            </div>
          </div>

          <!-- UI options -->
          <div
            v-if="plugin.id === 'ui' && config.enabledPlugins.includes('ui') && expandedPlugin === 'ui'"
            class="pg-sidebar__plugin-opts"
          >
            <div class="pg-sidebar__opt-label" style="margin-bottom: 6px">exclude components</div>
            <div class="pg-sidebar__chips">
              <button
                v-for="comp in UI_COMPONENT_NAMES"
                :key="comp"
                class="pg-sidebar__chip"
                :class="{ 'pg-sidebar__chip--excluded': config.uiExclude?.includes(comp) }"
                @click="toggleUiExclude(comp)"
              >
                {{ comp }}
              </button>
            </div>
          </div>

          <!-- DRM options -->
          <div
            v-if="plugin.id === 'drm' && config.enabledPlugins.includes('drm') && expandedPlugin === 'drm'"
            class="pg-sidebar__plugin-opts"
          >
            <div class="pg-sidebar__field">
              <div class="pg-sidebar__opt-label">Key system</div>
              <select
                class="pg-sidebar__select"
                :value="config.drmKeySystem || 'widevine'"
                @change="onDrmKeySystemChange"
              >
                <option value="widevine">Widevine</option>
                <option value="fairplay">FairPlay</option>
                <option value="playready">PlayReady</option>
                <option value="clearkey">ClearKey</option>
              </select>
            </div>
            <div class="pg-sidebar__field">
              <div class="pg-sidebar__opt-label">License URL</div>
              <input
                type="url"
                class="pg-sidebar__input"
                :value="config.drmLicenseUrl"
                placeholder="https://license.example.com/…"
                @change="onDrmUrlChange"
              />
            </div>
          </div>

          <!-- IMA options -->
          <div
            v-if="plugin.id === 'ima' && config.enabledPlugins.includes('ima') && expandedPlugin === 'ima'"
            class="pg-sidebar__plugin-opts"
          >
            <div class="pg-sidebar__field">
              <div class="pg-sidebar__opt-label">adTagUrl</div>
              <input
                type="url"
                class="pg-sidebar__input"
                :value="config.imaAdTagUrl"
                placeholder="https://…/vast.xml or vmap.xml"
                @change="onImaTagChange"
              />
            </div>
            <div class="pg-sidebar__field">
              <div class="pg-sidebar__opt-label">timeout (ms)</div>
              <input
                type="number"
                class="pg-sidebar__input"
                :value="config.imaTimeout || 6000"
                @change="onImaTimeoutChange"
              />
            </div>
          </div>

          <!-- SSAI options -->
          <div
            v-if="plugin.id === 'ssai' && config.enabledPlugins.includes('ssai') && expandedPlugin === 'ssai'"
            class="pg-sidebar__plugin-opts"
          >
            <div class="pg-sidebar__field">
              <div class="pg-sidebar__opt-label">tolerance (seconds)</div>
              <input
                type="number"
                class="pg-sidebar__input"
                :value="config.ssaiTolerance || 0.5"
                step="0.1"
                @change="onSsaiToleranceChange"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="pg-sidebar__footer">
      <div class="pg-sidebar__switches">
        <div class="pg-sidebar__switch-row" @click="onToggleSwitch('autoplay')">
          <span class="pg-sidebar__switch-label">autoplay</span>
          <div class="pg-sidebar__toggle" :class="{ 'pg-sidebar__toggle--on': config.autoplay }" />
        </div>
        <div class="pg-sidebar__switch-row" @click="onToggleSwitch('muted')">
          <span class="pg-sidebar__switch-label">muted</span>
          <div class="pg-sidebar__toggle" :class="{ 'pg-sidebar__toggle--on': config.muted !== false }" />
        </div>
        <div class="pg-sidebar__switch-row" @click="onToggleSwitch('loop')">
          <span class="pg-sidebar__switch-label">loop</span>
          <div class="pg-sidebar__toggle" :class="{ 'pg-sidebar__toggle--on': config.loop }" />
        </div>
        <div class="pg-sidebar__switch-row" @click="onToggleSwitch('playsinline')">
          <span class="pg-sidebar__switch-label">playsinline</span>
          <div class="pg-sidebar__toggle" :class="{ 'pg-sidebar__toggle--on': config.playsinline !== false }" />
        </div>
      </div>

      <div class="pg-sidebar__divider" />

      <div class="pg-sidebar__actions-row">
        <select :value="presetId" class="pg-sidebar__preset-select" @change="onPresetChange">
          <option v-for="p in PRESETS" :key="p.id" :value="p.id">{{ p.label }}</option>
        </select>
        <div class="pg-sidebar__actions">
          <button class="pg-sidebar__action-btn" :title="copied ? 'Copied!' : 'Share'" @click="onShare">
            <svg v-if="!copied" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="3" r="2" /><circle cx="4" cy="8" r="2" /><circle cx="12" cy="13" r="2" />
              <path d="m6 9 4 3M10 4 6 7" />
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 8 4 4 6-8" />
            </svg>
          </button>
          <button class="pg-sidebar__action-btn" title="Open in new tab" @click="$emit('openNewTab')">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 2h4v4M14 2 8 8M6 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3" />
            </svg>
          </button>
          <button class="pg-sidebar__action-btn" title="Reset" @click="$emit('reset')">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 8a6 6 0 0 1 10.2-4.2M14 2v4h-4M14 8a6 6 0 0 1-10.2 4.2M2 14v-4h4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pg-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--vp-c-bg-soft);
  border-right: 1px solid var(--vp-c-divider);
  overflow: hidden;
}

.pg-sidebar__scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px 14px;
}

.pg-sidebar__scroll::-webkit-scrollbar {
  width: 3px;
}

.pg-sidebar__scroll::-webkit-scrollbar-thumb {
  background: var(--vp-c-divider);
  border-radius: 3px;
}

.pg-sidebar__section {
  margin-bottom: 4px;
}

.pg-sidebar__title {
  font-size: 11px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.pg-sidebar__field {
  margin-bottom: 8px;
}

.pg-sidebar__field--half {
  flex: 1;
  min-width: 0;
}

.pg-sidebar__label {
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  margin-bottom: 3px;
}

.pg-sidebar__opt {
  font-weight: 400;
  color: var(--vp-c-text-3);
}

.pg-sidebar__opt-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-bottom: 3px;
}

.pg-sidebar__input,
.pg-sidebar__select {
  width: 100%;
  font-family: inherit;
  font-size: 12px;
  padding: 6px 9px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  outline: none;
  transition: border-color 0.13s;
}

.pg-sidebar__input:focus,
.pg-sidebar__select:focus {
  border-color: var(--vp-c-brand-1);
}

.pg-sidebar__input::placeholder {
  color: var(--vp-c-text-3);
}

.pg-sidebar__row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.pg-sidebar__hint {
  font-size: 11px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  margin-bottom: 10px;
}

.pg-sidebar__hint-link {
  font-size: 11px;
  color: var(--vp-c-brand-1);
  font-family: ui-monospace, monospace;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  word-break: break-all;
  text-align: left;
}

.pg-sidebar__hint-link:hover {
  text-decoration: underline;
}

.pg-sidebar__go {
  width: 100%;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #071210;
  background: var(--vp-c-brand-1);
  border: none;
  cursor: pointer;
  padding: 7px;
  border-radius: 8px;
  transition: opacity 0.13s;
}

.pg-sidebar__go:hover {
  opacity: 0.85;
}

.pg-sidebar__divider {
  height: 1px;
  background: var(--vp-c-divider);
  margin: 14px 0;
}

/* Plugin rows */
.pg-sidebar__plugin {
  border-bottom: 1px solid var(--vp-c-bg-elv);
}

.pg-sidebar__plugin:last-child {
  border: none;
}

.pg-sidebar__plugin-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 0;
  cursor: pointer;
  transition: opacity 0.12s;
}

.pg-sidebar__plugin-row:hover {
  opacity: 0.8;
}

.pg-sidebar__plugin-row--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pg-sidebar__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1.5px solid var(--vp-c-text-3);
  flex-shrink: 0;
  transition: border-color 0.14s, background 0.14s;
}

.pg-sidebar__dot--on {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
}

.pg-sidebar__plugin-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  flex: 1;
}

.pg-sidebar__plugin-size {
  font-size: 11px;
  color: var(--vp-c-text-3);
}

.pg-sidebar__expand-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--vp-c-text-3);
  padding: 0 2px;
  transition: transform 0.15s;
  line-height: 1;
}

.pg-sidebar__expand-btn--open {
  transform: rotate(90deg);
}

.pg-sidebar__plugin-opts {
  padding: 6px 0 10px 16px;
  border-top: 1px solid var(--vp-c-bg-elv);
}

.pg-sidebar__warn {
  font-size: 11px;
  color: var(--vp-c-warning-1);
  background: var(--vp-c-warning-soft);
  border: 1px solid var(--vp-c-warning-2, var(--vp-c-warning-1));
  border-radius: 6px;
  padding: 5px 8px;
  margin-bottom: 8px;
}

.pg-sidebar__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.pg-sidebar__chip {
  font-size: 11px;
  font-weight: 500;
  font-family: inherit;
  padding: 2px 8px;
  border-radius: 100px;
  cursor: pointer;
  border: 1px solid var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  transition: all 0.12s;
}

.pg-sidebar__chip--excluded {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
  background: transparent;
  text-decoration: line-through;
}

/* Footer */
.pg-sidebar__footer {
  border-top: 1px solid var(--vp-c-divider);
  padding: 10px 14px;
  flex-shrink: 0;
}

.pg-sidebar__switches {
  margin-bottom: 4px;
}

.pg-sidebar__switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  cursor: pointer;
}

.pg-sidebar__switch-label {
  font-size: 12px;
  color: var(--vp-c-text-1);
}

.pg-sidebar__toggle {
  width: 30px;
  height: 16px;
  border-radius: 100px;
  background: var(--vp-c-divider);
  position: relative;
  flex-shrink: 0;
  transition: background 0.14s;
}

.pg-sidebar__toggle--on {
  background: var(--vp-c-brand-1);
}

.pg-sidebar__toggle::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.14s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.pg-sidebar__toggle--on::after {
  transform: translateX(14px);
}

.pg-sidebar__actions-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pg-sidebar__preset-select {
  flex: 1;
  min-width: 0;
  font-family: inherit;
  font-size: 12px;
  padding: 4px 6px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
}

.pg-sidebar__actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.pg-sidebar__action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 26px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.15s;
}

.pg-sidebar__action-btn:hover {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}
</style>
