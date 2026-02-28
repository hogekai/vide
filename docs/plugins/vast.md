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
| `ad:error` | `{ error, source, vastErrorCode? }` | Ad loading or playback error. `vastErrorCode` is a VAST 4.2 error code when available. |
| `ad:impression` | `{ adId }` | Impression pixel fired |
| `ad:quartile` | `{ adId, quartile }` | Quartile reached (start, firstQuartile, midpoint, thirdQuartile, complete) |
| `ad:mute` | `{ adId }` | Ad muted |
| `ad:unmute` | `{ adId }` | Ad unmuted |
| `ad:volumeChange` | `{ adId, volume }` | Ad volume changed |
| `ad:fullscreen` | `{ adId, fullscreen }` | Fullscreen state changed during ad |
| `ad:companions` | `{ adId, required, companions }` | Companion ad data available (emitted with `ad:start`) |
| `ad:nonlinears` | `{ adId, nonLinears, trackingEvents }` | NonLinear overlay ad data available (emitted with `ad:start`) |

### Pod Events

| Event | Payload | Description |
|-------|---------|-------------|
| `ad:pod:start` | `{ ads, total }` | Pod playback started |
| `ad:pod:end` | `{ completed, skipped, failed }` | Pod playback ended with stats |
| `ad:pod:adstart` | `{ ad, index, total }` | Individual ad within pod started |
| `ad:pod:adend` | `{ ad, index, total }` | Individual ad within pod ended |

## Error Codes

The VAST plugin includes all VAST 4.2 error codes as named constants. When an ad error occurs, the `ad:error` event payload includes a `vastErrorCode` field identifying the specific VAST error.

### Usage

```ts
import { VAST_MEDIA_UNSUPPORTED, VAST_NO_ADS } from "@videts/vide/vast";

player.on("ad:error", ({ error, source, vastErrorCode }) => {
  switch (vastErrorCode) {
    case VAST_NO_ADS:
      console.log("No ads available");
      break;
    case VAST_MEDIA_UNSUPPORTED:
      console.warn("No playable media file in the VAST response");
      break;
  }
});
```

### Error Tracking URLs

When an error occurs, the plugin automatically fires the `<Error>` tracking URLs from the VAST response with the `[ERRORCODE]` macro replaced:

```xml
<Error><![CDATA[https://example.com/error?code=[ERRORCODE]]]></Error>
```

Becomes `https://example.com/error?code=403` when the error is "media file not supported".

For manual error tracking:

```ts
import { trackError } from "@videts/vide/vast";

trackError(["https://example.com/error?code=[ERRORCODE]"], 403);
```

### Error Code Reference

| Code | Constant | Description |
|------|----------|-------------|
| 100 | `VAST_XML_PARSE_ERROR` | XML parsing error |
| 101 | `VAST_SCHEMA_ERROR` | VAST schema validation error |
| 102 | `VAST_VERSION_UNSUPPORTED` | VAST version not supported |
| 200 | `VAST_TRAFFICKING_ERROR` | Trafficking error |
| 201 | `VAST_LINEARITY_ERROR` | Expecting different linearity |
| 202 | `VAST_DURATION_ERROR` | Expecting different duration |
| 203 | `VAST_SIZE_ERROR` | Expecting different size |
| 204 | `VAST_CATEGORY_REQUIRED` | Ad category required but not provided |
| 205 | `VAST_CATEGORY_BLOCKED` | InLine category violates Wrapper BlockedAdCategories |
| 206 | `VAST_BREAK_SHORTENED` | Ad break shortened, ad not served |
| 300 | `VAST_WRAPPER_ERROR` | General Wrapper error |
| 301 | `VAST_WRAPPER_TIMEOUT` | Timeout of VAST URI in Wrapper |
| 302 | `VAST_WRAPPER_LIMIT` | Wrapper limit reached |
| 303 | `VAST_NO_ADS` | No VAST response after one or more Wrappers |
| 304 | `VAST_INLINE_TIMEOUT` | InLine ad failed to display in time |
| 400 | `VAST_LINEAR_ERROR` | General Linear error |
| 401 | `VAST_MEDIA_NOT_FOUND` | Unable to find Linear/MediaFile from URI |
| 402 | `VAST_MEDIA_TIMEOUT` | Timeout of MediaFile URI |
| 403 | `VAST_MEDIA_UNSUPPORTED` | Could not find supported MediaFile |
| 405 | `VAST_MEDIA_DISPLAY_ERROR` | Problem displaying MediaFile |
| 406 | `VAST_MEZZANINE_REQUIRED` | Mezzanine required but not provided |
| 407 | `VAST_MEZZANINE_DOWNLOADING` | Mezzanine download in progress |
| 408 | `VAST_CONDITIONAL_REJECTED` | Conditional ad rejected (deprecated) |
| 409 | `VAST_INTERACTIVE_NOT_EXECUTED` | InteractiveCreativeFile not executed |
| 410 | `VAST_VERIFICATION_NOT_EXECUTED` | Verification unit not executed |
| 411 | `VAST_MEZZANINE_INVALID` | Mezzanine didn't meet spec |
| 500 | `VAST_NONLINEAR_ERROR` | General NonLinearAds error |
| 501 | `VAST_NONLINEAR_SIZE_ERROR` | NonLinear dimensions don't fit |
| 502 | `VAST_NONLINEAR_FETCH_ERROR` | Unable to fetch NonLinear resource |
| 503 | `VAST_NONLINEAR_UNSUPPORTED` | NonLinear resource type not supported |
| 600 | `VAST_COMPANION_ERROR` | General CompanionAds error |
| 601 | `VAST_COMPANION_SIZE_ERROR` | Companion dimensions don't fit |
| 602 | `VAST_COMPANION_REQUIRED_ERROR` | Unable to display required Companion |
| 603 | `VAST_COMPANION_FETCH_ERROR` | Unable to fetch Companion resource |
| 604 | `VAST_COMPANION_UNSUPPORTED` | Companion resource type not supported |
| 900 | `VAST_UNDEFINED_ERROR` | Undefined error |
| 901 | `VAST_VPAID_ERROR` | General VPAID error |
| 902 | `VAST_INTERACTIVE_ERROR` | General InteractiveCreativeFile error |

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

## NonLinear Ads

NonLinear ads are overlay creatives displayed on top of the video during content playback — the video is not interrupted. The plugin parses `<NonLinearAds>` from the VAST response and emits data via the `ad:nonlinears` event. Display and dismissal are the integrator's responsibility.

### Listening for NonLinear Ads

```ts
import { trackNonLinear } from "@videts/vide/vast";
import type { VastNonLinearAds } from "@videts/vide/vast";

let activeNonLinearAds: VastNonLinearAds | null = null;

player.on("ad:nonlinears", ({ nonLinears, trackingEvents }) => {
  activeNonLinearAds = { nonLinears, trackingEvents };
  const nl = nonLinears[0];
  const resource = nl.resources.find(r => r.type === "static");
  if (!resource) return;

  const overlay = document.createElement("div");
  overlay.innerHTML = `<a href="${nl.clickThrough}"><img src="${resource.url}" width="${nl.width}" height="${nl.height}"></a>`;
  playerContainer.appendChild(overlay);

  // Fire creativeView tracking
  trackNonLinear(activeNonLinearAds, "creativeView");

  // Show close button after minSuggestedDuration
  if (nl.minSuggestedDuration) {
    setTimeout(() => {
      const btn = document.createElement("button");
      btn.textContent = "×";
      btn.onclick = () => {
        overlay.remove();
        trackNonLinear(activeNonLinearAds!, "close");
      };
      overlay.appendChild(btn);
    }, nl.minSuggestedDuration * 1000);
  }
});
```

### NonLinear vs Companion

| | NonLinear | Companion |
|-|----------|-----------|
| Display location | Inside the player (overlay) | Outside the player (sidebar, etc.) |
| Content playback | Continues playing | Continues playing |
| `minSuggestedDuration` | Yes | No |
| Tracking events | Multiple (creativeView, acceptInvitation, close, etc.) | creativeView only |

### Attributes

Each `NonLinearAd` object contains:

| Property | Type | Description |
|----------|------|-------------|
| `width` | `number` | Display width in pixels |
| `height` | `number` | Display height in pixels |
| `minSuggestedDuration` | `number \| undefined` | Minimum display time in seconds. Don't show a close button before this. |
| `scalable` | `boolean \| undefined` | Whether the creative can be resized |
| `maintainAspectRatio` | `boolean \| undefined` | Whether to preserve aspect ratio on resize |
| `resources` | `CompanionResource[]` | Same resource types as companions (static, iframe, html) |
| `clickThrough` | `string \| undefined` | Click destination URL |
| `clickTracking` | `string[]` | Click tracking URLs |

### Tracking

NonLinear ads support multiple tracking events (unlike companions which only have `creativeView`). Call `trackNonLinear()` with the event name when the corresponding action occurs:

```ts
import { trackNonLinear } from "@videts/vide/vast";

trackNonLinear(nonLinearAds, "creativeView");       // overlay is displayed
trackNonLinear(nonLinearAds, "acceptInvitation");    // user clicked/tapped the overlay
trackNonLinear(nonLinearAds, "close");               // user closed the overlay
trackNonLinear(nonLinearAds, "collapse");            // user minimized the overlay
trackNonLinear(nonLinearAds, "adExpand");            // user expanded the overlay
trackNonLinear(nonLinearAds, "adCollapse");          // user collapsed the expanded overlay
```

## Wrapper Chain Resolution

When a VAST response contains a `<Wrapper>`, the plugin follows the `<VASTAdTagURI>` redirect chain (up to 5 levels by default) until an InLine ad is found. Data from all Wrapper layers is merged into the final InLine ad per VAST 4.2 spec:

- **Errors, Impressions** — concatenated from all layers
- **Linear TrackingEvents** — concatenated per event name
- **Linear ClickTracking** — concatenated from all layers
- **ClickThrough** — InLine only
- **CompanionAds resources** — InLine takes precedence; falls back to closest Wrapper
- **CompanionClickTracking, Companion creativeView tracking** — prepended to InLine companions
- **NonLinear TrackingEvents, NonLinearClickTracking** — concatenated from all layers
- **AdVerifications** — concatenated from all layers
- **Extensions** — concatenated from all layers
- **ViewableImpression** — URLs concatenated per type (Viewable, NotViewable, ViewUndetermined)

## Notes

- The parser is a pure function: takes XML string, returns `VastResponse`. No I/O inside.
- Tracking uses `navigator.sendBeacon()` with `Image` pixel fallback.
- Wrapper/chain resolution is supported (follows `<VASTAdTagURI>`).
- The plugin saves/restores the content source after ad playback.
- Ad Pods and Waterfall are automatically detected from the VAST response structure.
- `classifyAds`, `playSingleAd`, `playPod`, `playWaterfall`, and `selectMediaFile` are all exported for advanced use cases.
