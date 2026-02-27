# vide

Lightweight video player library. Web standards first, zero config, explicit plugin opt-in.

## Install

```sh
npm install vide
```

## Quick Start

```ts
import { createPlayer } from "vide";

const player = createPlayer(document.querySelector("video")!);

player.on("statechange", ({ from, to }) => console.log(`${from} → ${to}`));
player.play();
```

## Plugins

Plugins are explicit opt-in. Import only what you need.

### HLS Streaming

```sh
npm install hls.js
```

```ts
import { createPlayer } from "vide";
import { hls } from "vide/hls";

const player = createPlayer(document.querySelector("video")!);
player.use(hls());

player.src = "https://example.com/stream.m3u8";
```

- Safari/iOS uses native HLS (no hls.js needed)
- Non-Safari uses hls.js via dynamic import
- `hlsConfig` option passes config directly to hls.js constructor

```ts
player.use(hls({ hlsConfig: { maxBufferLength: 60 } }));
```

`<source>` elements are auto-detected:

```html
<video>
  <source src="stream.m3u8" type="application/vnd.apple.mpegurl">
</video>
```

```ts
const player = createPlayer(document.querySelector("video")!);
player.use(hls()); // auto-loads from <source>
```

### DASH Streaming

```sh
npm install dashjs
```

```ts
import { createPlayer } from "vide";
import { dash } from "vide/dash";

const player = createPlayer(document.querySelector("video")!);
player.use(dash());

player.src = "https://example.com/stream.mpd";
```

- Uses dash.js via dynamic import
- `dashConfig` option passes settings directly to `dashjs.updateSettings()`

```ts
player.use(dash({ dashConfig: { streaming: { buffer: { bufferTimeDefault: 20 } } } }));
```

`<source>` elements are auto-detected:

```html
<video>
  <source src="stream.mpd" type="application/dash+xml">
</video>
```

```ts
const player = createPlayer(document.querySelector("video")!);
player.use(dash()); // auto-loads from <source>
```

### UI

```ts
import { createPlayer } from "vide";
import { ui } from "vide/ui";
import "vide/ui/theme.css"; // optional — default theme

const player = createPlayer(document.querySelector("video")!);
player.use(ui({ container: document.getElementById("player-container")! }));
```

- Two-layer architecture: JS logic (Layer 1) + optional CSS theme (Layer 2)
- 13 components: play, progress, time, volume, fullscreen, loader, error, bigplay, poster, ad-countdown, ad-skip, ad-overlay, ad-label
- BEM class names (`vide-play`, `vide-progress__bar`, etc.) — bring your own styles or use `theme.css`
- `exclude` option to disable specific components

```ts
player.use(ui({
  container: el,
  exclude: ["volume", "fullscreen"],
  poster: "https://example.com/poster.jpg",
}));
```

Individual components can be used standalone:

```ts
import { createPlayButton, createProgress, connectStateClasses } from "vide/ui";

const play = createPlayButton();
play.mount(controls);
play.connect(player);
```

#### UI + VAST Ads

```ts
import { ui } from "vide/ui";
import { vast } from "vide/vast";

const uiPlugin = ui({ container: el });
player.use(uiPlugin);
player.use(vast({
  tagUrl: "https://example.com/vast.xml",
  adPlugins: uiPlugin.getAdPlugin(),
}));
```

### VAST Ads

```ts
import { vast } from "vide/vast";
player.use(vast({ tagUrl: "https://example.com/vast.xml" }));
```

### VMAP Ad Scheduling

```ts
import { vmap } from "vide/vmap";
player.use(vmap({ vmapUrl: "https://example.com/vmap.xml" }));
```

### OMID Viewability

```ts
import { vast } from "vide/vast";
import { omid } from "vide/omid";

player.use(vast({
  tagUrl: "https://example.com/vast.xml",
  adPlugins: () => [omid({ partner: { name: "your-company", version: "1.0.0" } })],
}));
```

### SIMID Interactive Ads

```ts
import { vast } from "vide/vast";
import { simid } from "vide/simid";

player.use(vast({
  tagUrl: "https://example.com/vast.xml",
  adPlugins: () => [simid({ container: document.getElementById("ad-container")! })],
}));
```

## Entry Points

| Import | Description | gzip |
|---|---|---:|
| `vide` | Core player | 1.4 KB |
| `vide/ui` | UI plugin (13 components) | 3.0 KB |
| `vide/ui/theme.css` | Default theme (optional) | 1.7 KB |
| `vide/hls` | HLS streaming (hls.js) | 0.6 KB |
| `vide/dash` | DASH streaming (dashjs) | 0.6 KB |
| `vide/vast` | VAST 4.1 linear ads | 1.6 KB |
| `vide/vmap` | VMAP ad scheduling | 2.7 KB |
| `vide/omid` | OMID viewability | 1.7 KB |
| `vide/simid` | SIMID interactive ads | 2.5 KB |
| **Total** | **All entry points** | **~16 KB** |

## License

MIT
