# Browser Support

| Feature | Chrome | Firefox | Safari | Edge | iOS Safari | Android Chrome |
|---------|--------|---------|--------|------|------------|---------------|
| Core playback | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| HLS | ✅ (hls.js) | ✅ (hls.js) | ✅ (native) | ✅ (hls.js) | ✅ (native) | ✅ (hls.js) |
| DASH | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| VAST/VMAP | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| DRM Widevine | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| DRM FairPlay | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| SSAI | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| UI keyboard | ✅ | ✅ | ✅ | ✅ | N/A | N/A |
| UI touch | N/A | N/A | N/A | N/A | ✅ | ✅ |
| Fullscreen | ✅ | ✅ | ✅ | ✅ | ⚠️ iOS API | ✅ |
| OMID | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| SIMID | ✅ | ✅ | ✅ | ✅ | ⚠️ iframe | ✅ |

⚠️ = partial support with known limitations

::: warning
This is a design-based compatibility table. Device-level testing has not been performed for all combinations. Entries marked with ⚠️ have known platform-specific limitations.
:::

## Notes

- **HLS on Safari/iOS**: Uses native HLS support. hls.js is not loaded.
- **DASH on Safari/iOS**: MSE support is limited. dash.js does not work.
- **DRM**: Browser must support EME (Encrypted Media Extensions). Widevine is available on Chrome/Firefox/Edge. FairPlay is Safari/iOS only.
- **Fullscreen on iOS**: Uses the iOS-specific `webkitEnterFullscreen()` API on the video element rather than the standard Fullscreen API.
- **SIMID on iOS**: iframe sandboxing may restrict some interactive creative features.
- **UI keyboard**: Not applicable on mobile — touch controls are used instead.
