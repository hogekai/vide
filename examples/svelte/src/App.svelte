<script lang="ts">
import {
	AdCountdown,
	AdLabel,
	AdLearnMore,
	AdSkip,
	BigPlayButton,
	ClickPlay,
	FullscreenButton,
	Loader,
	PlayButton,
	Progress,
	TimeDisplay,
	VideControls,
	VideUI,
	VideVideo,
	Volume,
	createVidePlayer,
	useAutohide,
	useHls,
	useKeyboard,
	useVast,
	useVideEvent,
} from "@videts/vide/svelte";
import "@videts/vide/ui/theme.css";

const HLS_SRC = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

const VAST_TAG = `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_preroll_skippable&sz=640x480&ciu_szs=300x250,728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=${Date.now()}`;

const player = createVidePlayer();
useHls(player);
useVast(player, { tagUrl: VAST_TAG });

let uiEl: HTMLDivElement | null = $state(null);
useAutohide(() => uiEl, player);
useKeyboard(() => uiEl, player);

let state = $state("idle");

useVideEvent(player, "statechange", ({ to }) => {
	state = to;
});

useVideEvent(player, "ad:start", () => {
	console.log("Ad started");
});
</script>

<div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem">
  <h1>vide — Svelte</h1>
  <p>State: <code>{state}</code></p>

  <VideUI onmount={(el) => uiEl = el}>
    <VideVideo
      src={HLS_SRC}
      autoplay
      style="width: 100%; background: #000; display: block"
    />
    <ClickPlay />
    <BigPlayButton />
    <Loader />
    <AdLearnMore />
    <AdLabel />
    <AdCountdown />
    <AdSkip />
    <VideControls>
      <PlayButton />
      <Progress />
      <TimeDisplay separator=" / " />
      <Volume />
      <FullscreenButton />
    </VideControls>
  </VideUI>
</div>
