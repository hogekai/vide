# Vide

[![CI](https://github.com/hogekai/vide/actions/workflows/ci.yml/badge.svg)](https://github.com/hogekai/vide/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@videts/vide)](https://www.npmjs.com/package/@videts/vide)
[![gzip](https://img.shields.io/badge/core-3.0KB-blue)](https://bundlephobia.com/package/@videts/vide)

Modular video player library. Use only what you need.

**[Documentation](https://hogekai.github.io/vide/)** · **[Getting Started](https://hogekai.github.io/vide/getting-started)** · **[Demo](https://hogekai.github.io/vide/demo)** · **[Try on StackBlitz](https://stackblitz.com/github/hogekai/vide/tree/main/examples/stackblitz)**

```html
<video src="video.mp4"></video>
```

```ts
import { createPlayer } from "@videts/vide";
import { vast } from "@videts/vide/vast";
import { hls } from "@videts/vide/hls";

const player = createPlayer(document.querySelector("video")!);
player.use(hls());
player.use(vast({ tagUrl: "https://example.com/vast.xml" }));
```

Explicit setup. No data attributes. No class scanning. No side effects.
Web standards first — if the browser can do it, we don't reinvent it.

## Features

### Streaming

HLS and DASH with adaptive bitrate. Thin wrappers around hls.js and dashjs.

### Advertising

Full ad stack: VAST 4.2, VMAP scheduling, SSAI, VPAID 2.0, SIMID, Google IMA.
Open Measurement (OMID) viewability tracking.

### DRM

Widevine + FairPlay. Auto-configures hls.js/dashjs.

### UI

17 headless components. No UI / headless / themed — pick your level.

### Frameworks

React hooks, Vue composables, Svelte 5 — all first-class.

### Tiny

Core 3.0 KB gzip. Each plugin is a separate import. Pay only for what you use.

## Install

```sh
npm install @videts/vide
```

> Package is published as **@videts/vide** on npm. The project name is **Vide**.

## Quick Start

```html
<div id="player-container">
  <video src="video.mp4"></video>
</div>
```

```ts
import { createPlayer } from "@videts/vide";
import { ui } from "@videts/vide/ui";
import "@videts/vide/ui/theme.css";

const player = createPlayer(document.querySelector("video")!);

// Optional — add UI controls
player.use(ui({ container: document.getElementById("player-container")! }));

// HTMLVideoElement-compatible — play, pause, src, currentTime, … all proxied
player.play();

// player.el — direct access to the underlying <video> element
// player.on() — typed custom events (statechange, ad:start, error, …)
```

See the [Getting Started guide](https://hogekai.github.io/vide/getting-started) for more.

## Plugins

Plugins are explicit opt-in. Import only what you need.

| Plugin | What | gzip |
|--------|------|-----:|
| `@videts/vide` | Core player | 3.0 KB |
| `@videts/vide/vast` | VAST 4.2 ads | 7.9 KB |
| `@videts/vide/vmap` | VMAP scheduling | 8.8 KB |
| `@videts/vide/hls` | HLS streaming | 1.4 KB |
| `@videts/vide/dash` | DASH streaming | 1.4 KB |
| `@videts/vide/drm` | DRM (Widevine, FairPlay, PlayReady, ClearKey) | 2.6 KB |
| `@videts/vide/ssai` | SSAI (server-side ads) | 2.3 KB |
| `@videts/vide/omid` | Open Measurement | 1.7 KB |
| `@videts/vide/simid` | Interactive ads | 2.4 KB |
| `@videts/vide/vpaid` | VPAID 2.0 ads | 2.1 KB |
| `@videts/vide/ima` | Google IMA SDK bridge | 3.4 KB |
| `@videts/vide/ui` | Headless UI | 5.7 KB |
| `@videts/vide/ui/theme.css` | Default theme | 4.6 KB |

> HLS and DASH plugins require `hls.js` and `dashjs` as peer dependencies.

See the [plugin documentation](https://hogekai.github.io/vide/plugins/hls) for usage examples and configuration options.

## Documentation

- [Getting Started](https://hogekai.github.io/vide/getting-started) — install, basic setup
- [Plugin Guides](https://hogekai.github.io/vide/plugins/hls) — HLS, DASH, DRM, VAST, UI, and more
- [API Reference](https://hogekai.github.io/vide/api-reference/) — auto-generated from TypeScript
- [Browser Support](https://hogekai.github.io/vide/browser-support) — compatibility notes
- [Demo](https://hogekai.github.io/vide/demo) — live examples

## License

MIT
