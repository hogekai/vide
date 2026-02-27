# Getting Started

## Install

```sh
npm install @videts/vide
```

## Basic Usage

```ts
import { createPlayer } from "@videts/vide";

const player = createPlayer(document.querySelector("video")!);
player.play();
```

That's it. `createPlayer` wraps a `<video>` element with a typed event bus and state machine. All HTMLVideoElement properties are proxied directly.

## Adding Plugins

Plugins are explicit opt-in. Import and `use()` only what you need.

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
