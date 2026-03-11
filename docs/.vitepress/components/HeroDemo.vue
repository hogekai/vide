<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

const container = ref<HTMLElement>();
const visible = ref(false);
const loading = ref(true);
let observer: IntersectionObserver | null = null;

const CDN_VERSION = "0.9";
const CDN_BASE = `https://esm.sh/@videts/vide@${CDN_VERSION}`;
const HLS_SOURCE = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

function buildSrcdoc(): string {
  const js = [
    `import { createPlayer } from "${CDN_BASE}";`,
    `import { hls } from "${CDN_BASE}/hls";`,
    `import { ui } from "${CDN_BASE}/ui";`,
    "",
    'const player = createPlayer(document.querySelector("video"));',
    "player.use(hls());",
    "player.use(ui({ container: document.getElementById('player') }));",
    `player.src = "${HLS_SOURCE}";`,
  ].join("\n    ");

  // Concat script tags to avoid Vue SFC parser conflict
  const sOpen = "<" + 'script type="module">';
  const sClose = "</" + "script>";

  return [
    "<!doctype html><html><head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    `<link rel="stylesheet" href="${CDN_BASE}/ui/theme.css">`,
    "<style>*{margin:0;padding:0;box-sizing:border-box}",
    "html,body{width:100%;height:100%;background:#000}",
    "#player{position:relative;width:100%;height:100%}",
    "video{position:absolute;top:0;left:0;width:100%;height:100%}</style>",
    "</head><body>",
    '<div id="player"><video playsinline muted></video></div>',
    `${sOpen}\n    ${js}\n  ${sClose}`,
    "</body></html>",
  ].join("");
}

const srcdoc = buildSrcdoc();

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

function onLoad() {
  loading.value = false;
}
</script>

<template>
  <div ref="container" class="hero-demo">
    <div class="hero-demo__player">
      <iframe
        v-if="visible"
        :srcdoc="srcdoc"
        sandbox="allow-scripts allow-same-origin"
        class="hero-demo__frame"
        @load="onLoad"
      />
      <div v-if="!visible || loading" class="hero-demo__loading">
        <div class="hero-demo__spinner" />
      </div>
    </div>
    <div class="hero-demo__footer">
      <span class="hero-demo__badge">HLS + UI — 10 KB gzip total</span>
    </div>
  </div>
</template>

<style scoped>
.hero-demo {
  width: 100%;
}

.hero-demo__player {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.hero-demo__frame {
  width: 100%;
  height: 100%;
  border: none;
}

.hero-demo__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.hero-demo__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.15);
  border-top-color: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.hero-demo__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding: 0 4px;
  font-size: 13px;
}

.hero-demo__badge {
  color: var(--vp-c-text-2);
}
</style>
