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
| `videts` | Core player | 1.7 KB |
| `videts/vast` | VAST 4.2 ads | 1.5 KB |
| `videts/vmap` | VMAP scheduling | 2.6 KB |
| `videts/hls` | HLS streaming | 0.6 KB |
| `videts/dash` | DASH streaming | 0.6 KB |
| `videts/drm` | DRM (Widevine + FairPlay) | 0.8 KB |
| `videts/ssai` | SSAI (server-side ads) | 1.4 KB |
| `videts/omid` | Open Measurement | 1.7 KB |
| `videts/simid` | Interactive ads | 2.4 KB |
| `videts/ui` | Headless UI | 4.7 KB |
| `videts/ui/theme.css` | Default theme | 3.4 KB |

> HLS and DASH plugins require `hls.js` and `dashjs` as peer dependencies.

Zero config. No data attributes. No class scanning. No side effects.
Web standards first — if the browser can do it, we don't reinvent it.

## Install

```sh
npm install videts
```

> Package is published as **videts** on npm. The project name is **vide**.

## Quick Start

```ts
import { createPlayer } from "videts";
// import type { PlayerEventMap } from "videts";

const player = createPlayer(document.querySelector("video")!);

// HTMLVideoElement-compatible — play, pause, src, currentTime, … all proxied
player.play();
// player.pause();
// player.src = "video.mp4";
// player.currentTime = 30;

// player.el — direct access to the underlying <video> element
// player.el.requestPictureInPicture();

// player.on() — typed custom events (statechange, ad:start, error, …)
player.on("statechange", ({ from, to }) => console.log(`${from} → ${to}`));
// player.on("volumechange", (e) => console.log(e.target));  // native events too

// addEventListener() delegates directly to the <video> element
// player.addEventListener("canplay", () => { ... });
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

### DRM

Widevine (Chrome/Firefox/Edge) and FairPlay (Safari/iOS). The plugin detects the browser's key system automatically — just pass the license server URL.

```ts
import { createPlayer } from "videts";
import { hls } from "videts/hls";
import { drm } from "videts/drm";

const player = createPlayer(document.querySelector("video")!);
player.use(hls());
player.use(drm({
  widevine: {
    licenseUrl: "https://license.example.com/widevine",
  },
  fairplay: {
    licenseUrl: "https://license.example.com/fairplay",
    certificateUrl: "https://certificate.example.com/fairplay.cer",
  },
}));

player.src = "https://example.com/encrypted-stream.m3u8";
```

Works with both HLS and DASH — plugin order doesn't matter.

```ts
// Custom headers for license requests (e.g. auth tokens)
player.use(drm({
  widevine: {
    licenseUrl: "https://license.example.com/widevine",
    headers: { Authorization: "Bearer <token>" },
  },
}));
```

### SSAI (Server-Side Ad Insertion)

Detects ad breaks from HLS/DASH in-band metadata and fires standard ad events. No vendor SDK required.

```ts
import { createPlayer } from "videts";
import { hls } from "videts/hls";
import { ssai } from "videts/ssai";

const player = createPlayer(document.querySelector("video")!);
player.use(hls());
player.use(ssai());

player.on("ad:start", ({ adId }) => console.log("ad started", adId));
player.on("ad:end", ({ adId }) => console.log("ad ended", adId));

player.src = "https://example.com/ssai-stream.m3u8";
```

```ts
// Custom parser for vendor-specific metadata formats
player.use(ssai({
  parser(raw) {
    if (raw.source === "daterange" && raw.attributes["X-MY-AD"] === "true") {
      return [{
        id: raw.attributes.ID,
        startTime: new Date(raw.attributes["START-DATE"]).getTime() / 1000,
        duration: Number(raw.attributes.DURATION || 0),
        trackingUrls: [raw.attributes["X-TRACKING-URL"]].filter(Boolean),
      }];
    }
    return [];
  },
}));
```

### UI

Headless by default — JS creates DOM and wires behavior, styling is yours.
Import `theme.css` for a ready-made look, or target the BEM classes (`vide-play`, `vide-progress__bar`, …) yourself.

```ts
import { createPlayer } from "videts";
import { ui } from "videts/ui";
import "videts/ui/theme.css"; // optional — brings default skin

const player = createPlayer(document.querySelector("video")!);
player.use(ui({ container: document.getElementById("player-container")! }));
```

```ts
// exclude: play, progress, time, volume, fullscreen, loader, error,
//          bigplay, poster, keyboard, clickplay, autohide,
//          ad-countdown, ad-skip, ad-overlay, ad-label
player.use(ui({
  container: el,
  exclude: ["volume", "fullscreen"],
  poster: "https://example.com/poster.jpg",
}));
```

Components can also be used individually:

```ts
import { createPlayButton, createProgress } from "videts/ui";

const play = createPlayButton();
play.mount(controls);
play.connect(player);
```

#### UI + VAST Ads

```ts
import { ui } from "videts/ui";
import { vast } from "videts/vast";

// UI plugin provides ad components (countdown, skip, overlay, label)
// that integrate with VAST playback via getAdPlugin()
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
