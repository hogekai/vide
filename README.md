# Vide

[![CI](https://github.com/hogekai/vide/actions/workflows/ci.yml/badge.svg)](https://github.com/hogekai/vide/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@videts/vide)](https://www.npmjs.com/package/@videts/vide)
[![gzip](https://img.shields.io/badge/core-3.0KB-blue)](https://bundlephobia.com/package/@videts/vide)

Modular video player library. Use only what you need.

**[Documentation](https://hogekai.github.io/vide/)** · **[Getting Started](https://hogekai.github.io/vide/getting-started)** · **[Playground](https://hogekai.github.io/vide/demo)**

```html
<video src="video.mp4"></video>
```

```ts
import { createPlayer } from "@videts/vide";
import { hls } from "@videts/vide/hls";
import { vast } from "@videts/vide/vast";

const player = createPlayer(document.querySelector("video")!);
player.use(hls());
player.use(vast({ tagUrl: "https://example.com/vast.xml" }));
```

Explicit setup. No data attributes. No class scanning. No side effects.
Web standards first — if the browser can do it, we don't reinvent it.

## Features

- **Tiny** — Core 3.0 KB gzip. Tree-shakeable. Each plugin is a separate import.
- **Web standards first** — Proxies `HTMLVideoElement`. Fullscreen API, `<track>` subtitles, native HLS on Safari.
- **Zero dependencies** — No runtime dependencies. Peer deps only for optional integrations.
- **TypeScript** — Strict types throughout. Type-safe plugin data, events, and state machine.
- **Streaming** — HLS and DASH with adaptive bitrate. Thin wrappers around hls.js and dashjs.
- **Advertising** — VAST 4.2, VMAP scheduling, SSAI, VPAID 2.0, SIMID, Google IMA SDK bridge, OMID viewability.
- **DRM** — Widevine, FairPlay, PlayReady, ClearKey. Auto-detection, retry with backoff, key status events.
- **UI** — 17 headless components with optional theme. No UI / headless / themed — pick your level.
- **Frameworks** — React hooks, Vue 3 composables, Svelte 5 — all first-class.

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
player.use(ui({ container: document.getElementById("player-container")! }));
```

See the [Getting Started guide](https://hogekai.github.io/vide/getting-started) for more.

## Pick Your Stack

| Stack | Start here |
|-------|-----------|
| Vanilla JS / TS | [Getting Started](https://hogekai.github.io/vide/getting-started) |
| React | [React Guide](https://hogekai.github.io/vide/frameworks/react) |
| Vue 3 | [Vue Guide](https://hogekai.github.io/vide/frameworks/vue) |
| Svelte 5 | [Svelte Guide](https://hogekai.github.io/vide/frameworks/svelte) |
| CDN / No build tool | [CDN Guide](https://hogekai.github.io/vide/cdn) |
| Migrating from video.js | [Migration Guide](https://hogekai.github.io/vide/guides/migration-from-videojs) |

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

> HLS and DASH plugins require `hls.js` (~160 KB gzip) and `dashjs` (~220 KB gzip) as peer dependencies. Sizes above are vide wrapper code only.

See the [plugin documentation](https://hogekai.github.io/vide/plugins/hls) for usage examples and configuration options.

## License

MIT
