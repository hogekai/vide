# VAST

VAST 4.2 client-side video ad support. Pure-function parser, beacon-based tracking, quartile events.

## Usage

```ts
import { createPlayer } from "@videts/vide";
import { vast } from "@videts/vide/vast";

const player = createPlayer(document.querySelector("video")!);
player.use(vast({ tagUrl: "https://example.com/vast.xml" }));
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `tagUrl` | `string` | — | VAST tag URL (required) |
| `timeout` | `number` | `5000` | Request timeout in ms |
| `allowSkip` | `boolean` | `true` | Honor skip offsets from the VAST response |
| `adPlugins` | `(ad: VastAd) => AdPlugin[]` | — | Per-ad plugin factory (e.g. OMID, SIMID, UI ad components) |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `ad:loaded` | `{ adId }` | VAST response parsed, ad ready |
| `ad:start` | `{ adId }` | Ad playback started |
| `ad:end` | `{ adId }` | Ad playback ended |
| `ad:skip` | `{ adId }` | Ad skipped by user |
| `ad:click` | `{ clickThrough, clickTracking }` | Ad clicked |
| `ad:error` | `{ error }` | Ad loading or playback error |
| `ad:impression` | `{ adId }` | Impression pixel fired |
| `ad:quartile` | `{ adId, quartile }` | Quartile reached (start, firstQuartile, midpoint, thirdQuartile, complete) |
| `ad:mute` | `{ adId }` | Ad muted |
| `ad:unmute` | `{ adId }` | Ad unmuted |
| `ad:volumeChange` | `{ adId, volume }` | Ad volume changed |
| `ad:fullscreen` | `{ adId, fullscreen }` | Fullscreen state changed during ad |

## AdPlugin Lifecycle

The `adPlugins` option creates per-ad plugins that are set up when an ad starts and cleaned up when it ends. This is how OMID, SIMID, and UI ad components integrate with VAST.

```ts
import { vast } from "@videts/vide/vast";
import { omid } from "@videts/vide/omid";
import { simid } from "@videts/vide/simid";

player.use(vast({
  tagUrl: "https://example.com/vast.xml",
  adPlugins: (ad) => [
    omid({ partner: { name: "my-company", version: "1.0.0" } }),
    simid({ container: adContainer }),
  ],
}));
```

## Notes

- The parser is a pure function: takes XML string, returns `VastResponse`. No I/O inside.
- Tracking uses `navigator.sendBeacon()` with `Image` pixel fallback.
- Wrapper/chain resolution is supported (follows `<VASTAdTagURI>`).
- The plugin saves/restores the content source after ad playback.
- Size: **1.5 KB** gzip.
