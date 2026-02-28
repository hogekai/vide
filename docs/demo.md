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
| Basic player | Core + VAST | [index.html](https://github.com/hogekai/vide/blob/main/examples/index.html) |
| HLS streaming | Core + HLS | [hls.html](https://github.com/hogekai/vide/blob/main/examples/hls.html) |
| DASH streaming | Core + DASH | [dash.html](https://github.com/hogekai/vide/blob/main/examples/dash.html) |
| UI controls | Core + UI | [ui.html](https://github.com/hogekai/vide/blob/main/examples/ui.html) |
| Headless UI | Core + UI (individual) | [ui-headless.html](https://github.com/hogekai/vide/blob/main/examples/ui-headless.html) |
| UI + VAST | Core + UI + VAST | [ui-vast.html](https://github.com/hogekai/vide/blob/main/examples/ui-vast.html) |
| HLS + VAST | Core + HLS + VAST | [hls-vast.html](https://github.com/hogekai/vide/blob/main/examples/hls-vast.html) |
| DASH + VAST | Core + DASH + VAST | [dash-vast.html](https://github.com/hogekai/vide/blob/main/examples/dash-vast.html) |
| VMAP scheduling | Core + VMAP | [vmap.html](https://github.com/hogekai/vide/blob/main/examples/vmap.html) |
| SSAI | Core + HLS + SSAI | [ssai.html](https://github.com/hogekai/vide/blob/main/examples/ssai.html) |
| OMID viewability | Core + VAST + OMID | [omid.html](https://github.com/hogekai/vide/blob/main/examples/omid.html) |
| SIMID interactive | Core + VAST + SIMID | [simid.html](https://github.com/hogekai/vide/blob/main/examples/simid.html) |

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
| Core | 1.8 KB |
| VAST | 1.6 KB |
| VMAP | 2.6 KB |
| HLS | 0.7 KB |
| DASH | 0.6 KB |
| DRM | 1.7 KB |
| SSAI | 1.5 KB |
| OMID | 1.7 KB |
| SIMID | 2.4 KB |
| UI | 4.8 KB |
| theme.css | 3.4 KB |
