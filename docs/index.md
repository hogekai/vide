---
layout: home

hero:
  name: Vide
  text: 3 KB gzip. The video player that gets out of your way.
  tagline: Add streaming, ads, DRM, and UI — only when you need them.
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: Playground
      link: /demo
    - theme: alt
      text: View on GitHub
      link: https://github.com/hogekai/vide

features:
  - icon: 🪶
    title: 3 KB Core
    details: Core under 3 KB gzip. video.js is ~240 KB. Every plugin is a separate import — pay only for what you use.
  - icon: 🌐
    title: You Already Know the API
    details: Proxies HTMLVideoElement directly. play(), pause(), currentTime — it's the same API you already know.
  - icon: 📺
    title: Full Ad Stack
    details: VAST 4.2, VMAP, SSAI, VPAID, SIMID, OMID — built-in, without Google's 500 KB IMA SDK.
  - icon: 📡
    title: Streaming & DRM
    details: HLS and DASH with adaptive bitrate, plus Widevine, FairPlay, PlayReady, and ClearKey.
  - icon: 🔌
    title: Zero Dependencies
    details: No runtime dependencies. TypeScript strict. ESM only. sideEffects false. Tree-shakeable.
  - icon: ⚛️
    title: Framework Ready
    details: React hooks, Vue 3 composables, Svelte 5 — all first-class with dedicated components.
---

## What Do You Need?

| Use case | Start here |
|----------|-----------|
| Play a video | [Getting Started](/getting-started) |
| HLS / DASH streaming | [HLS](/plugins/hls) · [DASH](/plugins/dash) |
| Pre-roll / mid-roll ads | [Ads Overview](/guides/ads-setup) |
| DRM-protected content | [DRM](/plugins/drm) |
| React / Vue / Svelte | [React](/frameworks/react) · [Vue](/frameworks/vue) · [Svelte](/frameworks/svelte) |
| Migrating from video.js | [Migration Guide](/guides/migration-from-videojs) |
| CDN / no build tool | [CDN Guide](/cdn) |

## Plugin Sizes

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
