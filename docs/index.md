---
layout: home

hero:
  name: vide
  tagline: Modular video player. Use only what you need.
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/hogekai/vide

features:
  - icon: 🪶
    title: Lightweight
    details: Core under 2 KB gzip. Each plugin adds only what it needs.
  - icon: 🔌
    title: Modular
    details: Every feature is a plugin. Import only what you use — HLS, VAST, UI, DRM, and more.
  - icon: 🌐
    title: Web Standards First
    details: If the browser can do it natively, vide doesn't reinvent it. Proxies HTMLVideoElement directly.
---

## Plugin Sizes

| Plugin | What | gzip |
|--------|------|-----:|
| `@videts/vide` | Core player | 1.7 KB |
| `@videts/vide/vast` | VAST 4.2 ads | 1.5 KB |
| `@videts/vide/vmap` | VMAP scheduling | 2.6 KB |
| `@videts/vide/hls` | HLS streaming | 0.6 KB |
| `@videts/vide/dash` | DASH streaming | 0.6 KB |
| `@videts/vide/drm` | DRM (Widevine + FairPlay) | 0.8 KB |
| `@videts/vide/ssai` | SSAI (server-side ads) | 1.4 KB |
| `@videts/vide/omid` | Open Measurement | 1.7 KB |
| `@videts/vide/simid` | Interactive ads | 2.4 KB |
| `@videts/vide/ui` | Headless UI | 4.7 KB |
| `@videts/vide/ui/theme.css` | Default theme | 3.4 KB |
