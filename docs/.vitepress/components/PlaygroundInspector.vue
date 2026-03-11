<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";

export interface InspectorEvent {
	id: number;
	event: string;
	data: unknown;
	ts: number;
}

export interface InspectorPlayerState {
	state: string;
	src: string;
	currentTime: number;
	duration: number;
	volume: number;
	muted: boolean;
	paused: boolean;
	loop: boolean;
	playbackRate: number;
	isAutoQuality: boolean | null;
	isLive: boolean;
}

export interface InspectorQuality {
	id: number;
	label: string;
	width?: number;
	height?: number;
	bitrate?: number;
}

const props = defineProps<{
	events: InspectorEvent[];
	playerState: InspectorPlayerState | null;
	stateHistory: Set<string>;
	qualities: InspectorQuality[];
	enabledPlugins: string[];
}>();

const emit = defineEmits<(e: "clearEvents") => void>();

const logEl = ref<HTMLElement>();
const autoScroll = ref(true);

const CORE_STATES = [
	"idle",
	"loading",
	"ready",
	"playing",
	"paused",
	"buffering",
	"ended",
	"error",
];
const AD_STATES = ["ad:loading", "ad:playing", "ad:paused"];

const currentState = computed(() => props.playerState?.state || "idle");

function stateClass(state: string) {
	return {
		"pg-insp__sn--active": currentState.value === state,
		"pg-insp__sn--visited":
			props.stateHistory.has(state) && currentState.value !== state,
	};
}

const fmt = (s: number) => {
	if (!Number.isFinite(s) || s < 0) return "0:00";
	return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

const fmtTs = (ts: number) => {
	const d = new Date(ts);
	return `${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}.${String(d.getMilliseconds()).slice(0, 2).padStart(2, "0")}`;
};

function eventColor(event: string): string {
	if (event.startsWith("ad:")) return "pg-insp__ev--ad";
	if (event === "statechange" || event === "livestatechange")
		return "pg-insp__ev--state";
	if (event.startsWith("quality") || event.startsWith("textrack"))
		return "pg-insp__ev--quality";
	if (event === "error" || event.startsWith("drm:"))
		return "pg-insp__ev--error";
	return "pg-insp__ev--media";
}

function formatData(data: unknown): string {
	if (
		data === null ||
		data === undefined ||
		(typeof data === "object" && Object.keys(data as object).length === 0)
	)
		return "";
	try {
		return JSON.stringify(data);
	} catch {
		return String(data);
	}
}

function onLogScroll() {
	if (!logEl.value) return;
	const el = logEl.value;
	autoScroll.value = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
}

watch(
	() => props.events.length,
	async () => {
		if (!autoScroll.value) return;
		await nextTick();
		if (logEl.value) {
			logEl.value.scrollTop = logEl.value.scrollHeight;
		}
	},
);

const properties = computed(() => {
	const s = props.playerState;
	if (!s) {
		return [
			{ key: "player.src", value: '""' },
			{ key: "currentTime", value: "0", highlight: true },
			{ key: "duration", value: "NaN" },
			{ key: "volume", value: "0.80", highlight: true },
			{ key: "muted", value: "true" },
			{ key: "paused", value: "true" },
			{ key: "loop", value: "false" },
			{ key: "playbackRate", value: "1", highlight: true },
			{ key: "isAutoQuality", value: "—" },
		];
	}
	const src =
		s.src.length > 24
			? `"${s.src.slice(0, 24)}…"`
			: s.src
				? `"${s.src}"`
				: '""';
	const result = [
		{ key: "player.src", value: src },
		{ key: "currentTime", value: s.currentTime.toFixed(1), highlight: true },
		{
			key: "duration",
			value: Number.isFinite(s.duration) ? s.duration.toFixed(1) : "NaN",
		},
		{ key: "volume", value: s.volume.toFixed(2), highlight: true },
		{ key: "muted", value: String(s.muted) },
		{ key: "paused", value: String(s.paused) },
		{ key: "loop", value: String(s.loop) },
		{ key: "playbackRate", value: String(s.playbackRate), highlight: true },
		{
			key: "isAutoQuality",
			value: s.isAutoQuality != null ? String(s.isAutoQuality) : "—",
		},
	];
	if (props.enabledPlugins.some((p) => ["hls", "dash"].includes(p))) {
		result.push({ key: "isLive", value: String(s.isLive) });
	}
	return result;
});

const hasAds = computed(() =>
	props.enabledPlugins.some((p) => ["vast", "vmap", "ima"].includes(p)),
);

const AD_PLUGIN_IDS = ["omid", "simid", "vpaid"];
</script>

<template>
  <div class="pg-insp">
    <div class="pg-insp__scroll">
      <!-- State -->
      <div class="pg-insp__section">
        <div class="pg-insp__title">State</div>
        <div class="pg-insp__states">
          <template v-for="(state, i) in CORE_STATES" :key="state">
            <span class="pg-insp__sn" :class="stateClass(state)">{{ state }}</span>
            <span v-if="i < CORE_STATES.length - 1" class="pg-insp__arrow">
              {{ state === 'playing' ? '⇄' : '›' }}
            </span>
          </template>
        </div>
        <div v-if="hasAds" class="pg-insp__states pg-insp__states--ad">
          <template v-for="(state, i) in AD_STATES" :key="state">
            <span class="pg-insp__sn" :class="stateClass(state)">{{ state }}</span>
            <span v-if="i < AD_STATES.length - 1" class="pg-insp__arrow">
              {{ state === 'ad:playing' ? '⇄' : '›' }}
            </span>
          </template>
        </div>
      </div>

      <!-- Properties -->
      <div class="pg-insp__section">
        <div class="pg-insp__title">Properties</div>
        <div
          v-for="prop in properties"
          :key="prop.key"
          class="pg-insp__prop"
        >
          <span class="pg-insp__pk">{{ prop.key }}</span>
          <span class="pg-insp__pv" :class="{ 'pg-insp__pv--hi': prop.highlight }">{{ prop.value }}</span>
        </div>
      </div>

      <!-- Quality -->
      <div v-if="qualities.length > 0" class="pg-insp__section">
        <div class="pg-insp__title">Quality levels</div>
        <div class="pg-insp__chips">
          <span
            v-if="playerState?.isAutoQuality"
            class="pg-insp__qc pg-insp__qc--on"
          >
            Auto
          </span>
          <span
            v-for="q in qualities"
            :key="q.id"
            class="pg-insp__qc"
          >
            {{ q.label }}
          </span>
        </div>
      </div>

      <!-- Active plugins -->
      <div class="pg-insp__section">
        <div class="pg-insp__title">Active plugins</div>
        <div class="pg-insp__plugins">
          <span v-if="enabledPlugins.length === 0" class="pg-insp__none">None</span>
          <span
            v-for="p in enabledPlugins"
            :key="p"
            class="pg-insp__atag"
            :class="{ 'pg-insp__atag--adplugin': AD_PLUGIN_IDS.includes(p) }"
          >
            {{ p }}
          </span>
        </div>
      </div>

      <!-- Events -->
      <div class="pg-insp__section pg-insp__section--events">
        <div class="pg-insp__ev-header">
          <div class="pg-insp__title" style="margin: 0">Events</div>
          <div class="pg-insp__ev-right">
            <span class="pg-insp__ev-count">{{ events.length }}</span>
            <button class="pg-insp__ev-clear" @click="emit('clearEvents')">Clear</button>
          </div>
        </div>
        <div
          ref="logEl"
          class="pg-insp__log"
          @scroll="onLogScroll"
        >
          <div v-if="events.length === 0" class="pg-insp__empty">Waiting for events…</div>
          <div
            v-for="ev in events"
            :key="ev.id"
            class="pg-insp__ev-row"
          >
            <span class="pg-insp__ev-ts">{{ fmtTs(ev.ts) }}</span>
            <span class="pg-insp__ev-name" :class="eventColor(ev.event)">{{ ev.event }}</span>
            <span class="pg-insp__ev-data">{{ formatData(ev.data) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pg-insp {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--vp-c-bg-soft);
  border-left: 1px solid var(--vp-c-divider);
  overflow: hidden;
}

.pg-insp__scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px 14px;
}

.pg-insp__scroll::-webkit-scrollbar {
  width: 3px;
}

.pg-insp__scroll::-webkit-scrollbar-thumb {
  background: var(--vp-c-divider);
  border-radius: 3px;
}

.pg-insp__section {
  margin-bottom: 20px;
}

.pg-insp__section--events {
  margin-bottom: 0;
}

.pg-insp__title {
  font-size: 11px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

/* State flow */
.pg-insp__states {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 3px;
  row-gap: 5px;
}

.pg-insp__states--ad {
  margin-top: 6px;
  padding-left: 4px;
}

.pg-insp__sn {
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
  transition: all 0.2s;
  white-space: nowrap;
}

.pg-insp__sn--active {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.pg-insp__sn--visited {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-2);
}

.pg-insp__arrow {
  font-size: 11px;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}

/* Properties */
.pg-insp__prop {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid var(--vp-c-bg-elv);
}

.pg-insp__prop:last-child {
  border: none;
}

.pg-insp__pk {
  font-size: 11px;
  color: var(--vp-c-text-2);
  font-family: ui-monospace, monospace;
}

.pg-insp__pv {
  font-size: 11.5px;
  color: var(--vp-c-text-1);
  font-family: ui-monospace, monospace;
  font-weight: 500;
}

.pg-insp__pv--hi {
  color: var(--vp-c-brand-1);
}

/* Quality chips */
.pg-insp__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.pg-insp__qc {
  font-size: 11px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 100px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
}

.pg-insp__qc--on {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

/* Active plugins */
.pg-insp__plugins {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.pg-insp__atag {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 9px;
  border-radius: 100px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border: 1px solid var(--vp-c-brand-1);
}

.pg-insp__atag--adplugin {
  border-style: dashed;
  opacity: 0.8;
}

.pg-insp__none {
  font-size: 12px;
  color: var(--vp-c-text-3);
}

/* Events */
.pg-insp__ev-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.pg-insp__ev-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pg-insp__ev-count {
  font-size: 11px;
  font-weight: 500;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-elv);
  padding: 1px 6px;
  border-radius: 100px;
}

.pg-insp__ev-clear {
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-3);
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 5px;
  font-family: inherit;
  transition: color 0.12s, background 0.12s;
}

.pg-insp__ev-clear:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-elv);
}

.pg-insp__log {
  max-height: 260px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pg-insp__log::-webkit-scrollbar {
  width: 3px;
}

.pg-insp__log::-webkit-scrollbar-thumb {
  background: var(--vp-c-divider);
  border-radius: 3px;
}

.pg-insp__empty {
  font-size: 12px;
  color: var(--vp-c-text-3);
  padding: 6px 0;
}

.pg-insp__ev-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 5px;
  animation: pg-insp-in 0.18s ease;
}

@keyframes pg-insp-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.pg-insp__ev-row:hover {
  background: var(--vp-c-bg-elv);
}

.pg-insp__ev-ts {
  font-size: 10px;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
  min-width: 40px;
  font-family: ui-monospace, monospace;
}

.pg-insp__ev-name {
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
  min-width: 80px;
}

.pg-insp__ev--state { color: var(--vp-c-brand-1); }
.pg-insp__ev--ad { color: #c8703a; }
.pg-insp__ev--media { color: var(--vp-c-text-2); }
.pg-insp__ev--quality { color: #8878c8; }
.pg-insp__ev--error { color: #c85858; }

.pg-insp__ev-data {
  font-size: 10.5px;
  color: var(--vp-c-text-3);
  flex: 1;
  word-break: break-all;
  line-height: 1.4;
  font-family: ui-monospace, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
