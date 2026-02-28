# vide

[![CI](https://github.com/hogekai/vide/actions/workflows/ci.yml/badge.svg)](https://github.com/hogekai/vide/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@videts/vide)](https://www.npmjs.com/package/@videts/vide)
[![gzip](https://img.shields.io/badge/core-1.8KB-blue)](https://bundlephobia.com/package/@videts/vide)

Modular video player library. Use only what you need.

**[Documentation](https://hogekai.github.io/vide/)** · **[Getting Started](https://hogekai.github.io/vide/getting-started)** · **[Demo](https://hogekai.github.io/vide/demo)**

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

Zero config. No data attributes. No class scanning. No side effects.
Web standards first — if the browser can do it, we don't reinvent it.

## Install

```sh
npm install @videts/vide
```

> Package is published as **@videts/vide** on npm. The project name is **vide**.

## Quick Start

```html
<video src="video.mp4"></video>
```

```ts
import { createPlayer } from "@videts/vide";
// import type { PlayerEventMap } from "@videts/vide";

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

| Plugin | What | gzip |
|--------|------|-----:|
| `@videts/vide` | Core player | 1.8 KB |
| `@videts/vide/vast` | VAST 4.2 ads | 1.6 KB |
| `@videts/vide/vmap` | VMAP scheduling | 2.6 KB |
| `@videts/vide/hls` | HLS streaming | 0.7 KB |
| `@videts/vide/dash` | DASH streaming | 0.6 KB |
| `@videts/vide/drm` | DRM (Widevine + FairPlay) | 1.7 KB |
| `@videts/vide/ssai` | SSAI (server-side ads) | 1.5 KB |
| `@videts/vide/omid` | Open Measurement | 1.7 KB |
| `@videts/vide/simid` | Interactive ads | 2.4 KB |
| `@videts/vide/ui` | Headless UI | 4.8 KB |
| `@videts/vide/ui/theme.css` | Default theme | 3.4 KB |

> HLS and DASH plugins require `hls.js` and `dashjs` as peer dependencies.

See the [plugin documentation](https://hogekai.github.io/vide/plugins/hls) for usage examples and configuration options.

## Documentation

- [Getting Started](https://hogekai.github.io/vide/getting-started) — install, CDN usage, basic setup
- [Plugin Guides](https://hogekai.github.io/vide/plugins/hls) — HLS, DASH, DRM, VAST, UI, and more
- [API Reference](https://hogekai.github.io/vide/api-reference/) — auto-generated from TypeScript
- [Browser Support](https://hogekai.github.io/vide/browser-support) — compatibility notes
- [Demo](https://hogekai.github.io/vide/demo) — live examples

## License

MIT
