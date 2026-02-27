# Migrating from video.js

## Core Player

| video.js | vide | Notes |
|----------|------|-------|
| `videojs(element, options)` | `createPlayer(element)` | No config object — use plugins |
| `player.src({ src, type })` | `player.src = url` | Type is auto-detected by source handlers |
| `player.on("timeupdate", fn)` | `player.on("timeupdate", fn)` | Same API |
| `player.currentTime()` | `player.currentTime` | Property, not method |
| `player.duration()` | `player.duration` | Property, not method |
| `player.volume(0.5)` | `player.volume = 0.5` | Property, not method |
| `player.muted(true)` | `player.muted = true` | Property, not method |
| `player.dispose()` | `player.destroy()` | Renamed |
| `player.el()` | `player.el` | Property, not method |

## Plugins

| video.js | vide | Size |
|----------|------|------|
| `videojs-contrib-hls` / `videojs-http-streaming` | `@videts/vide/hls` | 0.6 KB (+ hls.js) |
| `videojs-contrib-dash` | `@videts/vide/dash` | 0.6 KB (+ dashjs) |
| `videojs-contrib-eme` | `@videts/vide/drm` | 0.8 KB |
| `videojs-contrib-ads` + `videojs-ima` | `@videts/vide/vast` | 1.5 KB |
| `videojs-vmap` | `@videts/vide/vmap` | 2.6 KB |

## UI

video.js bundles UI into core. vide keeps UI as an optional plugin.

**video.js:**
```js
const player = videojs("my-video", {
  controls: true,
  autoplay: false,
  preload: "auto",
});
```

**vide:**
```ts
import { createPlayer } from "@videts/vide";
import { ui } from "@videts/vide/ui";
import "@videts/vide/ui/theme.css";

const player = createPlayer(document.querySelector("video")!);
player.use(ui({ container: document.getElementById("player-container")! }));
```

### Custom Skins

video.js uses a monolithic CSS override approach. vide uses BEM classes and CSS custom properties:

```css
/* video.js */
.video-js .vjs-play-progress { background: red; }

/* vide */
.vide-progress__bar { background: red; }
```

## Event Differences

| video.js | vide |
|----------|------|
| `player.on("loadedmetadata", fn)` | `player.addEventListener("loadedmetadata", fn)` |
| `player.on("statechanged", fn)` | `player.on("statechange", fn)` |
| `player.trigger("custom")` | `player.emit("custom", data)` |

vide separates custom events (`on`/`off`/`emit`) from native events (`addEventListener`/`removeEventListener`). Native events can also be used with `on()` — they delegate to the `<video>` element.

## Bundle Size

| | video.js | vide (core + HLS + UI) |
|-|----------|------------------------|
| JS | ~300 KB min | ~7 KB gzip |
| CSS | ~30 KB min | 3.4 KB gzip |

vide's modular design means you only load what you use. The core player alone is 1.7 KB gzip.
