# vide

Modular video player library. Use only what you need.

```ts
import { createPlayer } from "videts";
import { vast } from "videts/vast";
import { hls } from "videts/hls";

const player = createPlayer(document.querySelector("video")!);
player.use(hls());
player.use(vast({ tagUrl: "https://example.com/vast.xml" }));
```

| Plugin | What | gzip |
|--------|------|-----:|
| `videts` | Core player | 1.4 KB |
| `videts/vast` | VAST 4.2 ads | 1.5 KB |
| `videts/vmap` | VMAP scheduling | 2.6 KB |
| `videts/hls` | HLS (+ hls.js) | 0.6 KB |
| `videts/dash` | DASH (+ dashjs) | 0.5 KB |
| `videts/omid` | Open Measurement | 1.7 KB |
| `videts/simid` | Interactive ads | 2.3 KB |
| `videts/ui` | Headless UI | 4.6 KB |
| `videts/ui/theme.css` | Default theme | 1.9 KB |

Zero config. No data attributes. No class scanning. No side effects.
Web standards first — if the browser can do it, we don't reinvent it.

## Install

```sh
npm install videts
```

## Quick Start

```ts
import { createPlayer } from "videts";

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
import { createPlayer } from "videts";
import { hls } from "videts/hls";

const player = createPlayer(document.querySelector("video")!);
player.use(hls());

player.src = "https://example.com/stream.m3u8";
```

```ts
// Pass config directly to hls.js constructor
player.use(hls({ hlsConfig: { maxBufferLength: 60 } }));
```

### DASH Streaming

```sh
npm install dashjs
```

```ts
import { createPlayer } from "videts";
import { dash } from "videts/dash";

const player = createPlayer(document.querySelector("video")!);
player.use(dash());

player.src = "https://example.com/stream.mpd";
```

```ts
// Pass settings directly to dashjs.updateSettings()
player.use(dash({ dashConfig: { streaming: { buffer: { bufferTimeDefault: 20 } } } }));
```

### UI

```ts
import { createPlayer } from "videts";
import { ui } from "videts/ui";
import "videts/ui/theme.css"; // optional — default theme

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
import { createPlayButton, createProgress, connectStateClasses } from "videts/ui";

const play = createPlayButton();
play.mount(controls);
play.connect(player);
```

#### UI + VAST Ads

```ts
import { ui } from "videts/ui";
import { vast } from "videts/vast";

const uiPlugin = ui({ container: el });
player.use(uiPlugin);
player.use(vast({
  tagUrl: "https://example.com/vast.xml",
  adPlugins: uiPlugin.getAdPlugin(),
}));
```

### VAST Ads

```ts
import { vast } from "videts/vast";
player.use(vast({ tagUrl: "https://example.com/vast.xml" }));
```

### VMAP Ad Scheduling

```ts
import { vmap } from "videts/vmap";
player.use(vmap({ vmapUrl: "https://example.com/vmap.xml" }));
```

### OMID Viewability

```ts
import { vast } from "videts/vast";
import { omid } from "videts/omid";

player.use(vast({
  tagUrl: "https://example.com/vast.xml",
  adPlugins: () => [omid({ partner: { name: "your-company", version: "1.0.0" } })],
}));
```

### SIMID Interactive Ads

```ts
import { vast } from "videts/vast";
import { simid } from "videts/simid";

player.use(vast({
  tagUrl: "https://example.com/vast.xml",
  adPlugins: () => [simid({ container: document.getElementById("ad-container")! })],
}));
```

## License

MIT
