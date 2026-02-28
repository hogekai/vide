<script setup lang="ts">
import { ref, computed } from "vue";
import {
  useVidePlayer,
  useHls,
  useVast,
  useVideEvent,
  useAutohide,
  useKeyboard,
  VideVideo,
  VideUI,
  VideControls,
  VidePlayButton,
  VideProgress,
  VideVolume,
  VideFullscreenButton,
  VideTimeDisplay,
  VideLoader,
  VideBigPlayButton,
  VideClickPlay,
} from "@videts/vide/vue";
import "@videts/vide/ui/theme.css";

const HLS_SRC = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

const VAST_TAG =
  "https://pubads.g.doubleclick.net/gampad/ads?" +
  "iu=/21775744923/external/single_preroll_skippable" +
  "&sz=640x480&ciu_szs=300x250,728x90&gdfp_req=1" +
  "&output=vast&unviewed_position_start=1&env=vp&impl=s" +
  "&correlator=" +
  Date.now();

const player = useVidePlayer();
useHls(player);
useVast(player, { tagUrl: VAST_TAG });

const uiComponent = ref<InstanceType<typeof VideUI> | null>(null);
const uiEl = computed(() => (uiComponent.value?.$el as HTMLElement) ?? null);
useAutohide(uiEl, player);
useKeyboard(uiEl, player);

const state = ref("idle");

useVideEvent(player, "statechange", ({ to }) => {
  state.value = to;
});

useVideEvent(player, "ad:start", () => {
  console.log("Ad started");
});
</script>

<template>
  <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem">
    <h1>vide — Vue</h1>
    <p>State: <code>{{ state }}</code></p>

    <VideUI ref="uiComponent">
      <VideVideo
        :src="HLS_SRC"
        autoplay
        style="width: 100%; background: #000; display: block"
      />
      <VideClickPlay />
      <VideBigPlayButton />
      <VideLoader />
      <VideControls>
        <VidePlayButton />
        <VideProgress />
        <VideTimeDisplay separator=" / " />
        <VideVolume />
        <VideFullscreenButton />
      </VideControls>
    </VideUI>
  </div>
</template>
