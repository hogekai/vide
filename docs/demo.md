# Demo

<script setup>
import LiveDemo from './.vitepress/components/LiveDemo.vue'
</script>

::: tip
See the [examples/](https://github.com/hogekai/vide/tree/main/examples) directory for runnable HTML demos covering all plugin combinations.
:::

## Quick Demo

A minimal player with HLS streaming and UI:

<LiveDemo />

```html
<div id="player">
  <video src="https://example.com/stream.m3u8" autoplay muted playsinline></video>
</div>
```

```ts [HLS + UI]
import { createPlayer } from "@videts/vide";
import { hls } from "@videts/vide/hls";
import { ui } from "@videts/vide/ui";
import "@videts/vide/ui/theme.css";

const player = createPlayer(document.querySelector("video")!);
player.use(hls());
player.use(ui({ container: document.getElementById("player")! }));
```

## With VAST Pre-Roll

<LiveDemo vast />

```html
<div id="player">
  <video src="https://example.com/stream.m3u8" autoplay muted playsinline></video>
</div>
```

```ts [HLS + UI + VAST]
import { createPlayer } from "@videts/vide";
import { hls } from "@videts/vide/hls";
import { ui } from "@videts/vide/ui";
import { vast } from "@videts/vide/vast";
import "@videts/vide/ui/theme.css";

const player = createPlayer(document.querySelector("video")!);
player.use(hls());

const uiPlugin = ui({ container: document.getElementById("player")! });
player.use(uiPlugin);
player.use(vast({
  tagUrl: "https://pubads.g.doubleclick.net/gampad/ads?...",
  adPlugins: uiPlugin.getAdPlugin(),
}));
```

## Available Examples

| Example | Plugins | File |
|---------|---------|------|
| Overview | — | [index.html](https://github.com/hogekai/vide/blob/main/examples/index.html) |
| Without UI | Core only | [without-ui.html](https://github.com/hogekai/vide/blob/main/examples/without-ui.html) |
| UI controls | Core + UI | [ui.html](https://github.com/hogekai/vide/blob/main/examples/ui.html) |
| Headless UI | Core + UI (individual) | [ui-headless.html](https://github.com/hogekai/vide/blob/main/examples/ui-headless.html) |
| Standalone UI | Core + UI (standalone) | [ui-standalone.html](https://github.com/hogekai/vide/blob/main/examples/ui-standalone.html) |
| HLS streaming | Core + UI + HLS | [hls.html](https://github.com/hogekai/vide/blob/main/examples/hls.html) |
| DASH streaming | Core + UI + DASH | [dash.html](https://github.com/hogekai/vide/blob/main/examples/dash.html) |
| UI + VAST | Core + UI + VAST | [ui-vast.html](https://github.com/hogekai/vide/blob/main/examples/ui-vast.html) |
| HLS + VAST | Core + UI + HLS + VAST | [hls-vast.html](https://github.com/hogekai/vide/blob/main/examples/hls-vast.html) |
| DASH + VAST | Core + UI + DASH + VAST | [dash-vast.html](https://github.com/hogekai/vide/blob/main/examples/dash-vast.html) |
| VAST debug | Core + VAST | [vast-debug.html](https://github.com/hogekai/vide/blob/main/examples/vast-debug.html) |
| VAST wrapper | Core + VAST | [wrapper.html](https://github.com/hogekai/vide/blob/main/examples/wrapper.html) |
| Ad Pod | Core + UI + VAST | [ad-pod.html](https://github.com/hogekai/vide/blob/main/examples/ad-pod.html) |
| Companion Ads | Core + UI + VAST | [companion-ads.html](https://github.com/hogekai/vide/blob/main/examples/companion-ads.html) |
| NonLinear Ads | Core + UI + VAST | [nonlinear-ads.html](https://github.com/hogekai/vide/blob/main/examples/nonlinear-ads.html) |
| VMAP scheduling | Core + UI + VMAP | [vmap.html](https://github.com/hogekai/vide/blob/main/examples/vmap.html) |
| SSAI | Core + UI + HLS + SSAI | [ssai.html](https://github.com/hogekai/vide/blob/main/examples/ssai.html) |
| OMID viewability | Core + UI + VAST + OMID | [omid.html](https://github.com/hogekai/vide/blob/main/examples/omid.html) |
| SIMID interactive | Core + UI + VAST + SIMID | [simid.html](https://github.com/hogekai/vide/blob/main/examples/simid.html) |
| CDN all-in-one | All (script tag) | [cdn-all.html](https://github.com/hogekai/vide/blob/main/examples/cdn-all.html) |
| CDN individual | Core + plugins (script tag) | [cdn-individual.html](https://github.com/hogekai/vide/blob/main/examples/cdn-individual.html) |
| CDN + ads | Core + VAST (script tag) | [cdn-ads.html](https://github.com/hogekai/vide/blob/main/examples/cdn-ads.html) |

To run examples locally:

```sh
git clone https://github.com/hogekai/vide.git
cd vide
pnpm install
pnpm build
# Open examples/*.html with a local server (e.g., VS Code Live Preview)
```

## Plugin Sizes

| Plugin | gzip |
|--------|-----:|
| Core | 2.8 KB |
| VAST | 6.6 KB |
| VMAP | 7.1 KB |
| HLS | 1.4 KB |
| DASH | 1.4 KB |
| DRM | 1.7 KB |
| SSAI | 2.0 KB |
| OMID | 1.7 KB |
| SIMID | 2.4 KB |
| UI | 5.3 KB |
| theme.css | 3.5 KB |
