<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

const props = defineProps<{
  vast?: boolean;
}>();

const container = ref<HTMLDivElement>();
const video = ref<HTMLVideoElement>();
let player: any = null;
let observer: IntersectionObserver | null = null;
let initialized = false;

async function initPlayer() {
  if (initialized || !video.value || !container.value) return;
  initialized = true;

  // Load theme.css from CDN
  const linkId = "vide-theme-css";
  if (!document.getElementById(linkId)) {
    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = "https://esm.sh/@videts/vide@0.8/ui/theme.css";
    document.head.appendChild(link);
  }

  const imports: Promise<any>[] = [
    import("https://esm.sh/@videts/vide@0.8"),
    import("https://esm.sh/@videts/vide@0.8/hls"),
    import("https://esm.sh/@videts/vide@0.8/ui"),
  ];
  if (props.vast) {
    imports.push(import("https://esm.sh/@videts/vide@0.8/vast"));
  }

  const modules = await Promise.all(imports);
  const { createPlayer } = modules[0];
  const { hls } = modules[1];
  const { ui } = modules[2];

  player = createPlayer(video.value);
  player.use(hls());

  const uiPlugin = ui({ container: container.value });
  player.use(uiPlugin);

  if (props.vast && modules[3]) {
    const { vast } = modules[3];
    player.use(vast({
      tagUrl: "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_preroll_skippable&sz=640x480&ciu_szs=300x250,728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=" + Date.now(),
      adPlugins: uiPlugin.getAdPlugin(),
    }));
  }

  player.src = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
}

onMounted(() => {
  if (!container.value) return;

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        initPlayer();
        observer?.disconnect();
        observer = null;
      }
    },
    { threshold: 0.25 },
  );
  observer.observe(container.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
  player?.destroy();
  player = null;
  initialized = false;
});
</script>

<template>
  <div class="live-demo">
    <div ref="container" class="live-demo__player">
      <video ref="video" playsinline autoplay muted />
    </div>
  </div>
</template>

<style scoped>
.live-demo {
  margin: 1rem 0;
}

.live-demo__player {
  position: relative;
  width: 100%;
  background: #000;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  overflow: hidden;
}

.live-demo__player video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
