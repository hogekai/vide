# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.7.0] - 2026-02-28

### Added
- DRM plugin with Widevine and FairPlay support
- SSAI plugin for server-side ad insertion metadata detection (HLS DATERANGE/ID3, DASH EventStream)
- `setPluginData()` / `getPluginData()` for cross-plugin data sharing
- Proxy 17 HTMLVideoElement properties on Player interface (`loop`, `autoplay`, `poster`, `preload`, `defaultPlaybackRate`, `defaultMuted`, `crossOrigin`, `controls`, etc.)

### Fixed
- SSAI DATERANGE detection and reworked example with real HLS metadata

## [0.6.1] - 2026-02-28

### Fixed
- Bigplay button appearing during playback due to autohide class collision

## [0.6.0] - 2026-02-28

### Added
- UI plugin with two-layer architecture (headless components + optional theme)
- 13 UI components: play, progress, time, volume, fullscreen, loader, error, bigplay, poster, ad-countdown, ad-skip, ad-overlay, ad-label
- YouTube-quality UI: SVG icons, keyboard shortcuts (Space, arrows, M, F, 0-9), click-to-play, auto-hide controls
- BEM class names and CSS custom properties for styling
- `theme.css` with design tokens, explicit box-model, ad UI polish
- Individual component exports for standalone usage (`createPlayButton`, `createProgress`, etc.)
- AdPlugin integration for VAST skip/click/countdown via `getAdPlugin()`
- DASH streaming plugin (wraps dashjs)
- DASH + VAST example

### Fixed
- UI plugin bugs: fullscreen, bigplay replay, ad-skip, headless progress
- VAST content restoration after ad skip/end
- Content source not restored after VAST ad on HTML-attributed src
- `<source>` tag race condition and DASH autoplay handling

## [0.5.0] - 2026-02-28

### Added
- HLS streaming plugin (wraps hls.js, 618 bytes gzip)
- SourceHandler mechanism for extensible source handling
- `player.src` setter/getter with SourceHandler hook chain
- `registerSourceHandler()` for custom source types
- `<source>` element auto-processing
- State transition support for source switching during playback
- Safari native HLS detection with dynamic hls.js import
- Fatal error mapping and `hlsConfig` passthrough

### Fixed
- VAST content restoration for HLS sources
- Content autoplay after VAST ad ends on HLS sources

## [0.4.2] - 2026-02-27

### Added
- VAST/VMAP tracking events (mute, unmute, fullscreen, volumeChange)
- `PlayerEventMap` ad event types

## [0.4.1] - 2026-02-27

### Added
- `ad:click` event with clickThrough and clickTracking data
- Example HTML files for various plugin combinations

### Fixed
- SIMID sandbox, creative overlay display, and requestStop handling
- DOM removed from VAST plugin (plugin no longer creates DOM elements)

## [0.4.0] - 2026-02-27

### Added
- SIMID 1.2 plugin for interactive ad creatives
- Sandboxed iframe communication via MessageChannel
- Full SIMID handshake sequence
- Media event bridge for creatives
- Policy-based creative request handling
- AdPlugin lifecycle (`adPlugins` option) for VAST/VMAP plugins
- InteractiveCreativeFile extraction in VAST parser

### Changed
- Refactored OMID to use AdPlugin lifecycle

## [0.3.0] - 2026-02-27

### Added
- OMID plugin for ad viewability measurement via OM SDK
- Typed EventBus fallback with `addEventListener` / `removeEventListener` delegation to HTMLVideoElement

## [0.2.0] - 2026-02-27

### Added
- VMAP plugin with ad break scheduling and wrapper ad resolution
- VAST event tracking: click, pause/resume, skip

### Fixed
- VAST ad playback: infer initial state, wait for canplay
- Spec gaps, error handling, and type safety issues from codebase audit

## [0.1.0] - 2026-02-27

### Added
- Core player with `createPlayer()` factory
- EventBus with typed custom events (`statechange`, `error`, `ad:*`)
- StateMachine with validated state transitions
- Plugin system with explicit opt-in via `player.use()`
- HTMLVideoElement proxy pattern
- VAST 4.1 parser (pure function, no I/O)
- VAST tracker with sendBeacon/Image pixel support
- Quartile tracking for ad metrics
- TypeScript strict mode, ESM only, zero dependencies
