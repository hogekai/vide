# Browser Support

## Requirements

Vide requires ES2022 and the `<video>` element. All modern browsers are supported.

## Compatibility Matrix

| Feature | Chrome | Firefox | Safari | Edge | iOS Safari | Android Chrome |
|---------|:------:|:-------:|:------:|:----:|:----------:|:--------------:|
| Core player | 94+ | 93+ | 15.4+ | 94+ | 15.4+ | 94+ |
| HLS (via hls.js) | 94+ | 93+ | native | 94+ | native | 94+ |
| DASH (via dashjs) | 94+ | 93+ | — | 94+ | — | 94+ |
| DRM: Widevine | yes | yes | — | yes | — | yes |
| DRM: FairPlay | — | — | yes | — | yes | — |
| DRM: PlayReady | — | — | — | yes | — | — |
| DRM: ClearKey | yes | yes | yes | yes | yes | yes |
| UI components | 94+ | 93+ | 15.4+ | 94+ | 15.4+ | 94+ |
| Fullscreen API | yes | yes | yes | yes | limited | yes |
| Picture-in-Picture | yes | — | yes | yes | yes | yes |

> Version numbers reflect ES2022 support baseline. Older browsers may work but are not tested.

## Safari & HLS

Safari plays HLS natively without hls.js. The HLS plugin detects this automatically via `canPlayType("application/vnd.apple.mpegurl")`. If hls.js is not installed, Safari will still play HLS — but other browsers won't.

## Safari & DASH

Safari does not support MSE (Media Source Extensions) on iOS, so DASH playback is unavailable. Use HLS for Apple devices.

## iOS Safari

### Inline Playback

iOS Safari plays video fullscreen by default. Add `playsinline` to your `<video>` element for inline playback:

```html
<video playsinline></video>
```

Vide does **not** add this attribute automatically — it follows the "delegate, don't wrap" principle.

### Autoplay

iOS Safari blocks autoplay unless the video is muted:

```ts
player.play().catch(() => {
  player.muted = true;
  player.play();
});
```

The VAST and VMAP plugins handle this automatically.

### Fullscreen

iOS Safari does not support the standard Fullscreen API on arbitrary elements. The UI plugin falls back to:

1. `Element.requestFullscreen()` (standard)
2. `Element.webkitRequestFullscreen()` (older WebKit)
3. `HTMLVideoElement.webkitEnterFullscreen()` (iOS Safari — video only)

### Source Changes

When changing `<source>` elements dynamically, call `video.load()` to apply. The Vide core handles this via the `src` setter.

## DRM Key Systems

Each DRM key system is bound to specific browsers and platforms:

| Key System | Browser | Notes |
|-----------|---------|-------|
| Widevine | Chrome, Firefox, Edge, Android | Most widely supported. Requires license server. |
| FairPlay | Safari, iOS Safari | Requires both license server and certificate URL. |
| PlayReady | Edge (Chromium) | Microsoft ecosystem. Requires license server. |
| ClearKey | All modern browsers | W3C standard. Keys provided directly, no license server. |

Use `detectKeySystem()` to check availability at runtime:

```ts
import { detectKeySystem } from "@videts/vide/drm";

const keySystem = await detectKeySystem([
  { keySystem: "com.widevine.alpha" },
  { keySystem: "com.apple.fps.1_0" },
]);
```

See [DRM plugin docs](/plugins/drm) for full configuration.
