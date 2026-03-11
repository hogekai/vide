<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
	html: string;
	error?: string | null;
}>();

defineEmits<{
	(e: "dismissError"): void;
}>();

const iframeKey = ref(0);
const loading = ref(true);

let debounceTimer: ReturnType<typeof setTimeout> | undefined;

watch(
	() => props.html,
	() => {
		loading.value = true;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			iframeKey.value++;
		}, 500);
	},
);

function onLoad() {
	loading.value = false;
}
</script>

<template>
  <div class="pg-preview">
    <iframe
      :key="iframeKey"
      :srcdoc="html"
      sandbox="allow-scripts allow-same-origin"
      class="pg-preview__frame"
      @load="onLoad"
    />
    <div v-if="loading" class="pg-preview__loading">Loading...</div>
    <div v-if="error" class="pg-preview__error">
      <span class="pg-preview__error-text">{{ error }}</span>
      <button class="pg-preview__error-dismiss" @click="$emit('dismissError')">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <path d="m3 3 8 8M11 3 3 11" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.pg-preview {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
}

.pg-preview__frame {
  width: 100%;
  height: 100%;
  border: none;
}

.pg-preview__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 14px;
  pointer-events: none;
}

.pg-preview__error {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(220, 38, 38, 0.9);
  color: #fff;
  font-size: 12px;
  font-family: ui-monospace, "SF Mono", Menlo, Monaco, monospace;
  backdrop-filter: blur(4px);
}

.pg-preview__error-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pg-preview__error-dismiss {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  cursor: pointer;
}

.pg-preview__error-dismiss:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
