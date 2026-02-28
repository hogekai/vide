# Getting Started

## Install

```sh
npm install @videts/vide
```

## CDN / No Build Tool

### ESM (recommended)

Use an ESM CDN like [esm.sh](https://esm.sh) with an import map:

```html
<script type="importmap">
{
  "imports": {
    "@videts/vide": "https://esm.sh/@videts/vide@0.8",
    "@videts/vide/ui": "https://esm.sh/@videts/vide@0.8/ui",
    "@videts/vide/hls": "https://esm.sh/@videts/vide@0.8/hls"
  }
}
</script>

<link rel="stylesheet" href="https://esm.sh/@videts/vide@0.8/ui/theme.css">

<div id="player-container">
  <video src="video.mp4"></video>
</div>

<script type="module">
  import { createPlayer } from "@videts/vide";
  import { ui } from "@videts/vide/ui";

  const player = createPlayer(document.querySelector("video"));
  player.use(ui({ container: document.getElementById("player-container") }));
</script>
```

Or use bare URLs without an import map:

```html
<script type="module">
  import { createPlayer } from "https://esm.sh/@videts/vide@0.8";
</script>
```

Import maps are supported in all modern browsers. For older browsers, use [es-module-shims](https://github.com/guybedford/es-module-shims).

### Script tag

For tag managers and environments without ES module support, use the global IIFE builds:

```html
<script src="https://cdn.jsdelivr.net/npm/@videts/vide/dist/vide.global.js"></script>
<script>
  var player = Vide.createPlayer(document.querySelector("video"));
</script>
```

All exports are available on the `window.Vide` namespace. The API is identical to the ESM version — `import { hls }` becomes `Vide.hls`.

To load only the plugins you need, use individual builds:

```html
<script src="https://cdn.jsdelivr.net/npm/@videts/vide/dist/vide.core.global.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@videts/vide/dist/vide.hls.global.js"></script>
<script>
  var player = Vide.createPlayer(document.querySelector("video"));
  player.use(Vide.hls());
</script>
```

For HLS or DASH streaming, load the peer dependency before the vide plugin:

```html
<script src="https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@videts/vide/dist/vide.core.global.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@videts/vide/dist/vide.hls.global.js"></script>
```

Available individual builds: `vide.core.global.js`, `vide.hls.global.js`, `vide.dash.global.js`, `vide.vast.global.js`, `vide.vmap.global.js`, `vide.drm.global.js`, `vide.ssai.global.js`, `vide.omid.global.js`, `vide.simid.global.js`, `vide.ui.global.js`.

## Basic Usage

```html
<video src="video.mp4"></video>
```

```ts
import { createPlayer } from "@videts/vide";

const player = createPlayer(document.querySelector("video")!);
player.play();
```

That's it. `createPlayer` wraps a `<video>` element with a typed event bus and state machine. All HTMLVideoElement properties are proxied directly.

## HTML Attributes

Standard `<video>` attributes work as-is — no config object needed.

```html
<video
  src="video.mp4"
  poster="poster.jpg"
  autoplay
  muted
  loop
  playsinline
  preload="auto"
  crossorigin="anonymous"
></video>
```

```ts
const player = createPlayer(document.querySelector("video")!);
// All attributes above are already active.
```

| HTML attribute | JS property | Type |
|---------------|-------------|------|
| `src` | `player.src` | `string` |
| `poster` | `player.poster` | `string` |
| `autoplay` | `player.autoplay` | `boolean` |
| `muted` | `player.muted` | `boolean` |
| `loop` | `player.loop` | `boolean` |
| `preload` | `player.preload` | `"" \| "none" \| "metadata" \| "auto"` |
| `controls` | `player.controls` | `boolean` |
| `crossorigin` | `player.crossOrigin` | `string \| null` |

Multiple sources with `<source>` elements:

```html
<video>
  <source src="video.webm" type="video/webm">
  <source src="video.mp4" type="video/mp4">
</video>
```

```ts
const player = createPlayer(document.querySelector("video")!);
// Browser selects the best source. HLS/DASH plugins intercept matching types.
```

For attributes without a proxied property (e.g. `playsinline`), use `player.el` directly:

```ts
player.el.playsInline = true;
player.el.disablePictureInPicture = true;
```

## Adding Plugins

Plugins are explicit opt-in. Import and `use()` only what you need.

```html
<div id="player-container">
  <video src="https://example.com/stream.m3u8"></video>
</div>
```

```ts
import { createPlayer } from "@videts/vide";
import { hls } from "@videts/vide/hls";
import { ui } from "@videts/vide/ui";
import "@videts/vide/ui/theme.css";

const player = createPlayer(document.querySelector("video")!);
player.use(hls());
player.use(ui({ container: document.getElementById("player-container")! }));

player.src = "https://example.com/stream.m3u8";
```

## Player API

```ts
// HTMLVideoElement-compatible — play, pause, src, currentTime, … all proxied
player.play();
player.pause();
player.src = "video.mp4";
player.currentTime = 30;
player.volume = 0.5;
player.muted = true;

// Direct access to the underlying <video> element
player.el.requestPictureInPicture();

// Typed custom events
player.on("statechange", ({ from, to }) => console.log(`${from} → ${to}`));
player.on("error", ({ code, message }) => console.error(code, message));

// Native events via on() or standard addEventListener
player.on("volumechange", (e) => console.log(e.target));
player.addEventListener("canplay", () => { /* ... */ });
```

## Player States

```
idle → loading → ready → playing ⇄ paused → ended
                    ↘ ad:loading → ad:playing ⇄ ad:paused ↗
```

All transitions are validated. Invalid transitions are logged as warnings.

## Cleanup

```ts
player.destroy();
```

Calls all plugin cleanup functions, removes event listeners, and clears internal state.

## Next Steps

- [HLS Streaming](/plugins/hls) — play `.m3u8` streams
- [VAST Ads](/plugins/vast) — client-side video ads
- [UI](/plugins/ui) — player controls and theme
- [DRM](/plugins/drm) — encrypted content playback
- [Browser Support](/browser-support) — compatibility matrix
