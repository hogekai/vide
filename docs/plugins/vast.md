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

## Ad Pods and Waterfall

When a VAST response contains multiple `<Ad>` elements, the plugin automatically classifies and plays them:

| Pattern | Condition | Behavior |
|---------|-----------|----------|
| **Pod** | Ads have `sequence` attributes | Played in sequence order. Failures/skips advance to the next ad. |
| **Waterfall** | Multiple ads without `sequence` | Tried in order. First successful ad wins. |
| **Single** | One ad | Standard single-ad playback. |

### Pod Behavior

- Ads are sorted by `sequence` attribute and played sequentially.
- If a pod ad fails, a stand-alone ad (without `sequence`) from the same response is substituted before moving to the next pod ad (per VAST 3.3.1).
- Individual ad failures or skips do not stop the pod — playback advances to the next ad.

### Waterfall Behavior

- Ads are tried in document order.
- If an ad fails during **loading** (before `canplay`), the next ad is tried.
- If an ad fails during **playback** (after `canplay`), the waterfall stops.
- If all ads fail, an `ad:error` event is emitted.

### Utility Functions

The pod/waterfall logic is available as standalone functions for advanced use:

```ts
import { classifyAds, playPod, playWaterfall, playSingleAd } from "@videts/vide/vast";

const classified = classifyAds(response.ads);
// classified.type: "single" | "pod" | "waterfall"
// classified.ads: PlayableAd[]
// classified.standalonePool: PlayableAd[] (for pod substitution)
```

## Events

### Per-Ad Events

| Event | Payload | Description |
|-------|---------|-------------|
| `ad:loaded` | `{ adId }` | VAST response parsed, ad ready |
| `ad:start` | `{ adId }` | Ad playback started |
| `ad:end` | `{ adId }` | Ad playback ended |
| `ad:skip` | `{ adId }` | Ad skipped by user |
| `ad:click` | `{ clickThrough, clickTracking }` | Ad clicked |
| `ad:error` | `{ error, source }` | Ad loading or playback error |
| `ad:impression` | `{ adId }` | Impression pixel fired |
| `ad:quartile` | `{ adId, quartile }` | Quartile reached (start, firstQuartile, midpoint, thirdQuartile, complete) |
| `ad:mute` | `{ adId }` | Ad muted |
| `ad:unmute` | `{ adId }` | Ad unmuted |
| `ad:volumeChange` | `{ adId, volume }` | Ad volume changed |
| `ad:fullscreen` | `{ adId, fullscreen }` | Fullscreen state changed during ad |
| `ad:companions` | `{ adId, required, companions }` | Companion ad data available (emitted with `ad:start`) |

### Pod Events

| Event | Payload | Description |
|-------|---------|-------------|
| `ad:pod:start` | `{ ads, total }` | Pod playback started |
| `ad:pod:end` | `{ completed, skipped, failed }` | Pod playback ended with stats |
| `ad:pod:adstart` | `{ ad, index, total }` | Individual ad within pod started |
| `ad:pod:adend` | `{ ad, index, total }` | Individual ad within pod ended |

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

## Companion Ads

Companion ads are secondary ads (banners, sidebars) that accompany the video ad. The plugin parses `<CompanionAds>` from the VAST response and emits data via the `ad:companions` event. Display is the integrator's responsibility.

### Listening for Companions

```ts
import { trackCompanionView } from "@videts/vide/vast";

player.on("ad:companions", ({ companions, required }) => {
  const banner = companions.find(c => c.width === 300 && c.height === 250);
  if (banner) {
    const resource = banner.resources.find(r => r.type === "static");
    if (resource) {
      document.getElementById("sidebar-ad")!.innerHTML =
        `<a href="${banner.clickThrough}"><img src="${resource.url}" alt="${banner.altText || ""}"></a>`;
      trackCompanionView(banner); // fires creativeView tracking beacons
    }
  }
});
```

### `required` Attribute

| Value | Behavior |
|-------|----------|
| `"all"` | All companions must be displayed, or disregard the ad |
| `"any"` | At least one companion must be displayed |
| `"none"` | Companion display is optional (default) |

### Resource Types

Each companion may contain multiple resources. The integrator picks the most suitable:

- `{ type: "static", url, creativeType }` — Static image (e.g. `image/png`)
- `{ type: "iframe", url }` — URL to load in an iframe
- `{ type: "html", content }` — Inline HTML snippet

### Tracking

Call `trackCompanionView(companion)` when a companion is actually displayed to fire the `creativeView` tracking beacons. The plugin does not fire these automatically since it does not control rendering.

## Notes

- The parser is a pure function: takes XML string, returns `VastResponse`. No I/O inside.
- Tracking uses `navigator.sendBeacon()` with `Image` pixel fallback.
- Wrapper/chain resolution is supported (follows `<VASTAdTagURI>`).
- The plugin saves/restores the content source after ad playback.
- Ad Pods and Waterfall are automatically detected from the VAST response structure.
- `classifyAds`, `playSingleAd`, `playPod`, `playWaterfall`, and `selectMediaFile` are all exported for advanced use cases.
