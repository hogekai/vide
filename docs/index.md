---
layout: home

hero:
  name: Vide
  tagline: Modular video player. Use only what you need.
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
    title: Lightweight
    details: Core under 3 KB gzip. Each plugin adds only what it needs.
  - icon: 🔌
    title: Modular
    details: Every feature is a plugin. Import only what you use — HLS, VAST, UI, DRM, and more.
  - icon: 🌐
    title: Web Standards First
    details: If the browser can do it natively, Vide doesn't reinvent it. Proxies HTMLVideoElement directly.
  - icon: 📡
    title: Streaming
    details: HLS and DASH with adaptive bitrate. Thin wrappers around hls.js and dashjs.
  - icon: 📺
    title: Full Ad Stack
    details: VAST 4.2, VMAP, SSAI, VPAID, SIMID, Google IMA, and OMID viewability.
  - icon: ⚛️
    title: Framework Ready
    details: React hooks, Vue composables, Svelte 5 — all first-class integrations.
---

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
