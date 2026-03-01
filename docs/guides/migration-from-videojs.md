# Migrating from video.js

Vide takes a different approach to video playback: instead of bundling everything into a monolithic core, it wraps the native `<video>` element with a typed event bus and state machine, and leaves everything else to explicit plugins. The result is a smaller, tree-shakeable player where you only load what you use.

If you're coming from video.js 7.x or 8.x, this guide maps the APIs you already know to their Vide equivalents.

## At a Glance

**video.js 8.x** — monolithic, config-driven:

```js
import videojs from "video.js";
import "video.js/dist/video-js.css";

const player = videojs("my-video", {
  controls: true,
  autoplay: false,
  preload: "auto",
  sources: [{ src: "stream.m3u8", type: "application/x-mpegURL" }],
});
```

**Vide** — modular, plugin-driven:

```ts
import { createPlayer } from "@videts/vide";
import { hls } from "@videts/vide/hls";
import { ui } from "@videts/vide/ui";
import "@videts/vide/ui/theme.css";

const player = createPlayer(document.querySelector("video")!);
player.use(hls());
player.use(ui({ container: document.getElementById("player-container")! }));
player.src = "stream.m3u8";
```

video.js uses a config object to declare behavior. Vide uses native `<video>` attributes for behavior and `player.use()` for capabilities.

## Core Player

video.js uses dual-purpose methods — `player.currentTime()` returns the value, `player.currentTime(30)` sets it. Vide uses native JS properties.

| video.js | Vide | Notes |
|----------|------|-------|
| `videojs(element, options)` | `createPlayer(element)` | No config object — use plugins |
| `player.src({ src, type })` | `player.src = url` | Type auto-detected by source handlers |
| `player.currentTime()` / `player.currentTime(30)` | `player.currentTime` / `player.currentTime = 30` | Property, not method |
| `player.duration()` | `player.duration` | Property, not method |
| `player.volume(0.5)` | `player.volume = 0.5` | Property, not method |
| `player.muted(true)` | `player.muted = true` | Property, not method |
| `player.playbackRate(2)` | `player.playbackRate = 2` | Property, not method |
| `player.dispose()` | `player.destroy()` | Renamed |
| `player.el()` | `player.el` | Property, not method |
| `player.on("timeupdate", fn)` | `player.on("timeupdate", fn)` | Same API |
| `player.ready(fn)` | `player.on("statechange", fn)` | Check `player.state` for current state |
| — | `player.state` | No video.js equivalent — use the [state machine](#state-machine) |

### State Machine

video.js tracks state implicitly through CSS classes and events. Vide uses an explicit state machine:

```
idle → loading → ready → playing ⇄ paused → ended
                    ↘ ad:loading → ad:playing ⇄ ad:paused ↗
```

```ts
player.on("statechange", ({ from, to }) => {
  console.log(`${from} → ${to}`);
});

// Read current state at any time
if (player.state === "playing") { /* ... */ }
```

## Events

| video.js | Vide | Notes |
|----------|------|-------|
| `player.on("event", fn)` | `player.on("event", fn)` | Same for both custom and native events |
| `player.one("event", fn)` | `player.once("event", fn)` | Renamed |
| `player.off("event", fn)` | `player.off("event", fn)` | Same |
| `player.trigger("custom")` | `player.emit("custom", data)` | Renamed, requires data argument |
| `component.on("statechanged", fn)` | `player.on("statechange", fn)` | video.js uses per-event (`play`, `pause`, etc.); Vide unifies via state machine |
| `player.on("loadedmetadata", fn)` | `player.on("loadedmetadata", fn)` | Native events work with `on()` |

Vide's `on()` handles both custom events (`statechange`, `error`, ad events) and native `<video>` events (`loadedmetadata`, `volumechange`, etc.). You can also use `player.addEventListener()` for native events — both work.

## HTML Attributes

video.js requires a config object for basic video behavior. Vide uses native HTML attributes directly.

**video.js:**
```js
const player = videojs("my-video", {
  autoplay: true,
  muted: true,
  loop: true,
  preload: "auto",
  poster: "poster.jpg",
});
```

**Vide:**
```html
<video src="video.mp4" autoplay muted loop preload="auto" poster="poster.jpg"></video>
```

```ts
const player = createPlayer(document.querySelector("video")!);
// Attributes are already applied by the browser. No translation layer.
```

The `<video>` element is the config.

## Streaming: HLS & DASH

video.js 7+ includes VHS (Video.js HTTP Streaming) in core, which handles both HLS and DASH automatically. Vide uses separate plugins that wrap hls.js and dashjs.

**video.js 8.x:**
```js
// VHS is built-in — just set the source
const player = videojs("my-video");
player.src({ src: "stream.m3u8", type: "application/x-mpegURL" });

// Quality levels (built-in since 8.x via videojs-contrib-quality-levels)
const levels = player.qualityLevels();
levels.on("addqualitylevel", (event) => {
  console.log(event.qualityLevel);
});
```

**Vide:**
```ts
import { createPlayer } from "@videts/vide";
import { hls } from "@videts/vide/hls";

const player = createPlayer(document.querySelector("video")!);
player.use(hls());
player.src = "stream.m3u8"; // type auto-detected from .m3u8 extension

// Quality levels are built-in
player.on("qualitiesavailable", ({ qualities }) => {
  console.log(qualities); // { id, width, height, bitrate, label }[]
});
player.setQuality(2);  // select specific level
player.setQuality(-1); // auto
```

For DASH, replace `hls` with `dash`:

```ts
import { dash } from "@videts/vide/dash";
player.use(dash());
player.src = "stream.mpd";
```

## DRM

**video.js + videojs-contrib-eme:**
```js
import "videojs-contrib-eme";

const player = videojs("my-video");
player.eme();
player.src({
  src: "stream.m3u8",
  type: "application/x-mpegURL",
  keySystems: {
    "com.widevine.alpha": {
      url: "https://license.example.com/widevine",
    },
  },
});
```

**Vide:**
```ts
import { createPlayer } from "@videts/vide";
import { hls } from "@videts/vide/hls";
import { drm } from "@videts/vide/drm";

const player = createPlayer(document.querySelector("video")!);
player.use(hls());
player.use(drm({
  widevine: { licenseUrl: "https://license.example.com/widevine" },
  fairplay: {
    licenseUrl: "https://license.example.com/fairplay",
    certificateUrl: "https://certificate.example.com/fairplay.cer",
  },
}));
player.src = "stream.m3u8";
```

See [DRM plugin docs](/plugins/drm) for the full options reference.

## Text Tracks

**video.js:**
```js
player.addRemoteTextTrack({
  kind: "subtitles",
  src: "subs-en.vtt",
  srclang: "en",
  label: "English",
});
const tracks = player.textTracks();
```

**Vide:**
```html
<video src="video.mp4">
  <track kind="subtitles" src="subs-en.vtt" srclang="en" label="English">
</video>
```

```ts
const player = createPlayer(document.querySelector("video")!);

// Or add programmatically
player.addTextTrack({ kind: "subtitles", src: "subs-en.vtt", srclang: "en", label: "English" });
player.on("texttracksavailable", ({ tracks }) => console.log(tracks));
player.setTextTrack(tracks[0]); // activate a track
```

See [Text Tracks guide](/guides/text-tracks) for the full API.

## Ads

video.js ad integration typically requires `videojs-contrib-ads` + `videojs-ima` (Google IMA SDK wrapper, ~200 KB). Vide parses VAST XML natively with no external SDK dependency.

**video.js + IMA:**
```js
import "videojs-contrib-ads";
import "videojs-ima";

const player = videojs("my-video");
player.ima({ adTagUrl: "https://example.com/vast.xml" });
```

**Vide:**
```ts
import { createPlayer } from "@videts/vide";
import { vast } from "@videts/vide/vast";

const player = createPlayer(document.querySelector("video")!);
player.use(vast({ tagUrl: "https://example.com/vast.xml" }));

player.on("ad:start", ({ adId }) => console.log("Ad started:", adId));
player.on("ad:end", ({ adId }) => console.log("Ad ended:", adId));
```

For scheduled ad breaks (pre-roll, mid-roll, post-roll), use VMAP:

```ts
import { vmap } from "@videts/vide/vmap";
player.use(vmap({ url: "https://example.com/vmap.xml" }));
```

VMAP handles VAST resolution internally — no separate VAST import needed.

See [Ads Setup guide](/guides/ads-setup) for ad pods, companions, SSAI, OMID, and SIMID.

## Error Handling

**video.js:**
```js
player.on("error", () => {
  const err = player.error();
  console.error(err.code, err.message);
});
```

**Vide:**
```ts
player.on("error", ({ code, message, source, recoverable, retryCount }) => {
  if (recoverable) {
    console.log(`Auto-retrying (attempt ${retryCount})...`);
  } else {
    console.error(`[${source}] ${code}: ${message}`);
  }
});
```

Vide errors are typed with `code`, `message`, `source` (which plugin produced the error), and optional `recoverable` / `retryCount` fields. HLS and DASH plugins handle automatic recovery for transient network errors.

## UI

video.js bundles UI into core. Vide keeps UI as an optional plugin.

**video.js:**
```js
const player = videojs("my-video", {
  controls: true,
  autoplay: false,
  preload: "auto",
});
```

**Vide:**
```ts
import { createPlayer } from "@videts/vide";
import { ui } from "@videts/vide/ui";
import "@videts/vide/ui/theme.css";

const player = createPlayer(document.querySelector("video")!);
player.use(ui({ container: document.getElementById("player-container")! }));
```

### Custom Skins

video.js uses a monolithic CSS override approach. Vide uses BEM classes and CSS custom properties:

```css
/* video.js */
.video-js .vjs-play-progress { background: red; }

/* Vide */
.vide-progress__bar { background: red; }
```

A single design token controls all accent uses across the player:

```css
/* video.js — override individual nested selectors */
.video-js .vjs-play-progress { background: #3b82f6; }
.video-js .vjs-volume-level { background: #3b82f6; }
.video-js .vjs-big-play-button { border-color: #3b82f6; }

/* Vide — single token */
:root { --vide-accent: #3b82f6; }
```

### State Classes

| video.js | Vide |
|----------|------|
| `.vjs-playing` | `.vide-ui--playing` |
| `.vjs-paused` | `.vide-ui--paused` |
| `.vjs-ended` | `.vide-ui--ended` |
| `.vjs-waiting` | `.vide-ui--buffering` |
| `.vjs-error` | `.vide-ui--error` |
| `.vjs-ad-playing` (contrib-ads) | `.vide-ui--ad-playing` |

See [UI Design Tokens](/plugins/ui#design-tokens) for the full reference.

## Framework Migration

### React

**video.js in React** — manual lifecycle management:
```tsx
import { useRef, useEffect } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

function Player({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<ReturnType<typeof videojs>>(null);

  useEffect(() => {
    playerRef.current = videojs(videoRef.current!, { controls: true });
    playerRef.current.src({ src, type: "application/x-mpegURL" });
    return () => playerRef.current?.dispose();
  }, []);

  return <video ref={videoRef} className="video-js" />;
}
```

**Vide in React** — hooks handle lifecycle:
```tsx
import { useVidePlayer, useHls, Vide } from "@videts/vide/react";
import "@videts/vide/ui/theme.css";

function Player({ src }: { src: string }) {
  const player = useVidePlayer();
  useHls(player);

  return (
    <Vide.Root player={player}>
      <Vide.UI>
        <Vide.Video src={src} />
        <Vide.Controls>
          <Vide.PlayButton />
          <Vide.Progress />
          <Vide.TimeDisplay />
          <Vide.Volume />
          <Vide.FullscreenButton />
        </Vide.Controls>
      </Vide.UI>
    </Vide.Root>
  );
}
```

See the full [React guide](/frameworks/react).

### Vue

**video.js in Vue** — manual initialization in `onMounted`:
```vue
<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import videojs from "video.js";

const videoEl = ref(null);
let player;

onMounted(() => {
  player = videojs(videoEl.value, { controls: true });
  player.src({ src: "stream.m3u8", type: "application/x-mpegURL" });
});

onUnmounted(() => player?.dispose());
</script>

<template>
  <video ref="videoEl" class="video-js" />
</template>
```

**Vide in Vue** — composables handle lifecycle:
```vue
<script setup lang="ts">
import {
  useVidePlayer, useHls,
  VideUI, VideVideo, VideControls, VidePlayButton, VideProgress,
} from "@videts/vide/vue";
import "@videts/vide/ui/theme.css";

const player = useVidePlayer();
useHls(player);
</script>

<template>
  <VideUI>
    <VideVideo src="stream.m3u8" />
    <VideControls>
      <VidePlayButton />
      <VideProgress />
    </VideControls>
  </VideUI>
</template>
```

See the full [Vue guide](/frameworks/vue).

### Svelte

**Vide in Svelte** — functions and components:
```svelte
<script lang="ts">
  import {
    createVidePlayer, useHls,
    VideUI, VideVideo, VideControls, PlayButton, Progress,
  } from "@videts/vide/svelte";
  import "@videts/vide/ui/theme.css";

  const player = createVidePlayer();
  useHls(player);
</script>

<VideUI>
  <VideVideo src="stream.m3u8" />
  <VideControls>
    <PlayButton />
    <Progress />
  </VideControls>
</VideUI>
```

See the full [Svelte guide](/frameworks/svelte).

## Cleanup

| video.js | Vide |
|----------|------|
| `player.dispose()` | `player.destroy()` |

`player.destroy()` calls all plugin cleanup functions, removes event listeners, and clears internal state.

In React, Vue, and Svelte, the framework hooks (`useVidePlayer` / `createVidePlayer`) handle `destroy()` automatically on component unmount.

## Plugins

| video.js | Vide | Size |
|----------|------|------|
| VHS (built-in in 8.x) / `videojs-http-streaming` | `@videts/vide/hls` | 0.6 KB (+ hls.js) |
| VHS (built-in in 8.x) / `videojs-contrib-dash` | `@videts/vide/dash` | 0.6 KB (+ dashjs) |
| `videojs-contrib-eme` | `@videts/vide/drm` | 0.8 KB |
| `videojs-contrib-ads` + `videojs-ima` | `@videts/vide/vast` | 1.5 KB |
| — | `@videts/vide/vmap` | 2.6 KB |
| — | `@videts/vide/ssai` | SSAI monitoring |
| — | `@videts/vide/omid` | OM SDK viewability |
| — | `@videts/vide/simid` | SIMID interactive ads |
| Built-in | `@videts/vide/ui` | 5.3 KB + 3.5 KB CSS |

video.js bundles streaming, UI, and core into one package. Vide ships each as a separate entry point — import only what you use.

## Bundle Size

| | video.js 8.x | Vide (core + HLS + UI) |
|-|-------------|------------------------|
| JS | ~690 KB min (~200 KB gzip) | ~7 KB gzip |
| CSS | ~30 KB min | 3.4 KB gzip |

Core player alone is 1.7 KB gzip. Each plugin adds only what it needs.

## Migration Checklist

- Replace `videojs(el, options)` with `createPlayer(el)`
- Convert getter/setter methods to properties (`currentTime()` → `currentTime`)
- Move video config to native `<video>` HTML attributes
- Add `hls()` or `dash()` plugin if streaming is needed
- Move DRM from `videojs-contrib-eme` to `drm()` plugin
- Replace IMA / `videojs-contrib-ads` with `vast()` or `vmap()`
- Update event methods (`one` → `once`, `trigger` → `emit`)
- Replace `.dispose()` with `.destroy()`
- Add `ui()` plugin if you need player controls (not bundled in core)
- Update CSS selectors (`.vjs-*` → `.vide-*`, or use design tokens)
- For React / Vue / Svelte: replace manual `useEffect` + `dispose` with framework hooks
