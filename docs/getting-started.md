# Getting Started

## Install

::: code-group

```sh [npm]
npm install @videts/vide
```

```sh [pnpm]
pnpm add @videts/vide
```

```sh [yarn]
yarn add @videts/vide
```

```sh [bun]
bun add @videts/vide
```

:::

> No build tool? See [CDN / No Build Tool](/cdn).

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

## UI Options

Vide supports three levels of UI integration:

### No UI

Core only. No visual controls rendered. Build your own UI or go headless.

```ts
const player = createPlayer(document.querySelector("video")!);
player.use(hls());
// No ui() plugin. No components. You handle everything.
```

### Headless UI

UI components with behavior wired — no default styling. Bring your own CSS.

```ts
player.use(ui({ container: el }));
// Components render with BEM classes (vide-play, vide-progress, …)
// but no visual styles. Style them yourself.
```

### Themed

Headless components + the default skin. One import and it looks good.

```ts
player.use(ui({ container: el }));
import "@videts/vide/ui/theme.css";
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

- [Playground](/demo) — interactive playground
- [HLS Streaming](/plugins/hls) — play `.m3u8` streams
- [VAST Ads](/plugins/vast) — client-side video ads
- [UI](/plugins/ui) — player controls and theme
- [DRM](/plugins/drm) — encrypted content playback
- [CDN / No Build Tool](/cdn) — use without a bundler
- [Browser Support](/browser-support) — compatibility matrix
