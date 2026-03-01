# Browser Support

## General
Vide works in all modern browsers that support ES2022 and the `<video>` element.

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
