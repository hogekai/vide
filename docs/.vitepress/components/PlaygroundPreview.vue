<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
	html: string;
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
  </div>
</template>

<style scoped>
.pg-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
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
</style>
