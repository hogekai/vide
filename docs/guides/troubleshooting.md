# Troubleshooting

Common issues and how to resolve them.

## Autoplay Blocked

Browsers block autoplay with sound by default. If `player.play()` rejects:

```ts
player.play().catch(() => {
  // Browser blocked autoplay — mute and retry, or show a play button
  player.muted = true;
  player.play();
});
```

**Why it happens:** Chrome, Safari, and Firefox require a user gesture before playing audio. Muted autoplay is generally allowed.

**With IMA plugin:** Set `autoplayAdBreaks: false` to delay ad playback until user interaction:

```ts
player.use(ima({ adContainer: el, adTagUrl: "...", autoplayAdBreaks: false }));
```

## CORS Errors

If you see `Access-Control-Allow-Origin` errors when loading HLS/DASH manifests or VAST tags:

- The **media server** must include CORS headers (`Access-Control-Allow-Origin: *` or your domain).
- The **VAST ad server** must also allow cross-origin requests.
- Vide uses native `fetch()` — CORS must be configured server-side.

This is not a vide issue. Check your CDN or media server configuration.

## HLS Not Loading

### hls.js not installed

If you see error code `2001` (`ERR_HLS_IMPORT`):

```
HLS import failed
```

Install the peer dependency:

```sh
npm install hls.js
```

The HLS plugin uses `import("hls.js")` at runtime. If the module is not found, it emits this error.

### Browser does not support HLS

Error code `2000` (`ERR_HLS_UNSUPPORTED`) means the browser lacks both MSE (Media Source Extensions) and native HLS support. This is rare in modern browsers.

### Safari native HLS

Safari plays HLS natively without hls.js. The plugin detects this automatically via `canPlayType("application/vnd.apple.mpegurl")`. If hls.js is not installed, Safari will still work — but other browsers won't.

### Fatal playback errors

Error code `2002` (`ERR_HLS_FATAL`) indicates a fatal hls.js error. The plugin automatically retries (default: 3 retries with exponential backoff). Configure or disable recovery:

```ts
player.use(hls({ recovery: { maxRetries: 5, retryDelay: 2000, backoffMultiplier: 2 } }));

// Or disable recovery entirely
player.use(hls({ recovery: false }));
```

## DASH Not Loading

### dashjs not installed

Error code `3000` (`ERR_DASH_IMPORT`):

```sh
npm install dashjs
```

### Playback errors

Error code `3001` (`ERR_DASH_PLAYBACK`). The plugin attempts recovery by resetting and reinitializing the player. Configure retries the same way as HLS:

```ts
player.use(dash({ recovery: { maxRetries: 3, retryDelay: 3000, backoffMultiplier: 2 } }));
```

## DRM License Request Failed

### No supported key system

Error code `4000` (`ERR_DRM_UNSUPPORTED`) — the browser does not support any of the key systems you configured. Check:

- **Widevine** requires Chrome, Firefox, or Edge.
- **FairPlay** requires Safari.
- **PlayReady** requires Edge (Chromium).
- **ClearKey** is supported in all modern browsers.

### License server errors

Error code `4002` (`ERR_DRM_LICENSE`) — the license request failed. Common causes:

- License server URL is wrong or unreachable.
- Missing authentication headers (use `licenseHeaders` option).
- CORS not configured on the license server.

### Certificate errors

Error code `4003` (`ERR_DRM_CERTIFICATE`) — the certificate request failed. FairPlay requires a valid certificate URL.

### Key expired or revoked

Error code `4004` (`ERR_DRM_KEY_STATUS`) — emitted when key status changes to `"expired"` or `"internal-error"`. Listen for details:

```ts
player.on("drm:keystatus", ({ keyId, status }) => {
  console.log(`Key ${keyId}: ${status}`);
});
```

## Ads Not Playing

### VAST tag returns empty

If `ad:error` fires with `vastErrorCode: 303` (no VAST response after wrapper) or `vastErrorCode: 100` (XML parse error):

- Verify the VAST tag URL returns valid XML (test it in a browser or with `curl`).
- Check for CORS issues on the ad server.
- Wrapper chains have a timeout — if the chain is too deep or slow, it will time out (`vastErrorCode: 301`).

### Ad blocker detected

If the IMA SDK fails to load (error code `5000`, `ERR_IMA_SDK_LOAD`):

- Ad blockers prevent Google's IMA SDK script from loading.
- Use the built-in VAST plugin instead — it doesn't depend on external scripts.
- Or handle the error gracefully and continue content playback.

### Common VAST error codes

| Code | Meaning |
|-----:|---------|
| 100 | XML parsing error |
| 301 | VAST wrapper timeout |
| 302 | Wrapper limit reached |
| 303 | No VAST response after wrappers |
| 401 | MediaFile URI missing |
| 403 | No supported MediaFile found |
| 900 | Undefined error |

See the [VAST plugin docs](/plugins/vast) for the full error code reference.

## UI Not Rendering

### Missing container

The UI plugin requires a container element:

```ts
// Wrong — no container
player.use(ui());

// Correct
player.use(ui({ container: document.getElementById("player-container")! }));
```

The container must exist in the DOM when `player.use()` is called.

### Missing theme CSS

If the UI renders but looks unstyled, import the theme:

```ts
import "@videts/vide/ui/theme.css";
```

Or link it from CDN:

```html
<link rel="stylesheet" href="https://esm.sh/@videts/vide/ui/theme.css" />
```

## Error Event Structure

All errors follow a consistent structure:

```ts
player.on("error", ({ code, message, source, recoverable, retryCount }) => {
  console.error(`[${source}] ${code}: ${message}`);
  if (recoverable) {
    console.log(`Retry ${retryCount}...`);
  }
});

player.on("ad:error", ({ error, source, vastErrorCode }) => {
  console.error(`[${source}] Ad error:`, error.message);
  if (vastErrorCode) {
    console.error(`VAST error code: ${vastErrorCode}`);
  }
});
```

## Error Code Reference

| Range | Source | Codes |
|-------|--------|-------|
| 1000 | Core | `ERR_MEDIA` (1000) |
| 2000 | HLS | `ERR_HLS_UNSUPPORTED` (2000), `ERR_HLS_IMPORT` (2001), `ERR_HLS_FATAL` (2002) |
| 3000 | DASH | `ERR_DASH_IMPORT` (3000), `ERR_DASH_PLAYBACK` (3001) |
| 4000 | DRM | `ERR_DRM_UNSUPPORTED` (4000), `ERR_DRM_DETECTION` (4001), `ERR_DRM_LICENSE` (4002), `ERR_DRM_CERTIFICATE` (4003), `ERR_DRM_KEY_STATUS` (4004) |
| 5000 | IMA | `ERR_IMA_SDK_LOAD` (5000) |
