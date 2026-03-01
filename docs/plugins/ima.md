# IMA

Google IMA SDK (Interactive Media Ads) plugin. Delegates ad fetching, playback, and tracking entirely to the IMA SDK. Use this when the ad server or supply-side platform requires IMA SDK integration.

::: tip Difference from the VAST plugin
The [VAST plugin](/plugins/vast) parses and plays VAST XML directly. The IMA plugin delegates everything to Google's IMA SDK. If your ad server does not require IMA, the VAST plugin is lighter.
:::

## Usage

```ts
import { createPlayer } from "@videts/vide";
import { ima } from "@videts/vide/ima";

const video = document.querySelector("video")!;
const container = video.parentElement!; // position: relative wrapper

const player = createPlayer(video);
player.use(ima({
  adTagUrl: "https://example.com/vast.xml",
  adContainer: container,
}));
```

IMA SDK is loaded automatically via script injection — no `<script>` tag needed.

### VMAP / Ad Rules

If the ad tag URL points to a VMAP or Ad Rules response, IMA handles pre-roll, mid-roll, and post-roll scheduling internally:

```ts
player.use(ima({
  adTagUrl: "https://example.com/vmap.xml",
  adContainer: container,
}));
```

### On-Demand Ad Insertion

Set `autoplayAdBreaks: false` and call `requestAds()` via pluginData:

```ts
player.use(ima({
  adTagUrl: "https://example.com/vast.xml",
  adContainer: container,
  autoplayAdBreaks: false,
}));

// Later, when you want to play an ad:
const imaData = player.getPluginData("ima") as {
  requestAds: (adTagUrl?: string) => void;
};
imaData.requestAds(); // uses the configured adTagUrl
imaData.requestAds("https://example.com/other-tag.xml"); // or a different tag
```

## Ad Container Setup {#ad-container-setup}

IMA SDK renders ad UI (skip button, countdown, click overlay) inside the `adContainer` element. Pass the video's parent container — IMA creates its own overlay elements inside it:

```html
<div id="player-container" style="position: relative;">
  <video src="video.mp4"></video>
</div>
```

```ts
player.use(ima({
  adTagUrl: "...",
  adContainer: document.getElementById("player-container")!,
}));
```

The wrapper must have `position: relative` (or `absolute`/`fixed`) so IMA's absolutely-positioned overlay elements are contained correctly.

::: tip Mobile
Add `playsinline` to the `<video>` element for skippable ads on iOS.
:::

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `adTagUrl` | `string` | — | VAST/VMAP ad tag URL (required) |
| `adContainer` | `HTMLElement` | — | Container for IMA's ad UI overlay (required). Typically the video's parent element. See [Ad Container Setup](#ad-container-setup). |
| `timeout` | `number` | `6000` | IMA SDK script load timeout in ms |
| `sdkUrl` | `string` | Google CDN | IMA SDK script URL |
| `autoplayAdBreaks` | `boolean` | `true` | Auto-play ads when content starts. Set to `false` for on-demand insertion. |
| `locale` | `string` | — | Locale for IMA SDK UI (e.g. `"ja"`) |
| `configureAdsRequest` | `(req) => void` | — | Customize the IMA AdsRequest before sending |
| `configureRenderingSettings` | `(settings) => void` | — | Customize IMA AdsRenderingSettings |

### Advanced Configuration

```ts
player.use(ima({
  adTagUrl: "https://example.com/vast.xml",
  adContainer: container,
  locale: "ja",
  configureAdsRequest(req) {
    req.setAdWillAutoPlay?.(true);
    req.setAdWillPlayMuted?.(false);
    req.setContinuousPlayback?.(true);
  },
  configureRenderingSettings(settings) {
    (settings as any).enablePreloading = true;
  },
}));
```

## Events

IMA SDK events are mapped to standard vide ad events:

| IMA Event | vide Event | State Change |
|-----------|-----------|--------------|
| `CONTENT_PAUSE_REQUESTED` | `ad:breakStart` | → `ad:loading` |
| `LOADED` | `ad:loaded` | — |
| `STARTED` | `ad:start`, `ad:impression` | → `ad:playing` |
| `FIRST_QUARTILE` | `ad:quartile` (firstQuartile) | — |
| `MIDPOINT` | `ad:quartile` (midpoint) | — |
| `THIRD_QUARTILE` | `ad:quartile` (thirdQuartile) | — |
| `COMPLETE` | `ad:quartile` (complete), `ad:end` | — |
| `PAUSED` | — | → `ad:paused` |
| `RESUMED` | — | → `ad:playing` |
| `SKIPPED` | `ad:skip`, `ad:end` | — |
| `CLICK` | `ad:click` | — |
| `VOLUME_CHANGED` / `VOLUME_MUTED` | `ad:volumeChange`, `ad:mute` / `ad:unmute` | — |
| `CONTENT_RESUME_REQUESTED` | `ad:breakEnd` | → `playing` |

### Pod Events

When IMA plays an ad pod (multiple ads in a break), pod events are emitted:

| Event | When |
|-------|------|
| `ad:pod:start` | First ad in pod starts |
| `ad:pod:adstart` | Each individual ad starts |
| `ad:pod:adend` | Each individual ad ends |
| `ad:pod:end` | Last ad in pod ends |

### Skip from UI

The vide UI's skip button (`ad:skip` event) is forwarded to `adsManager.skip()`. No extra wiring needed.

## Ad Blocker Handling

If the IMA SDK fails to load (ad blocker or network error), the plugin emits `ad:error` with `source: "ima"` and content playback continues uninterrupted:

```ts
player.on("ad:error", ({ error, source }) => {
  if (source === "ima") {
    console.log("IMA unavailable:", error.message);
  }
});
```

## Plugin Data

After initialization, the plugin exposes data via `player.getPluginData("ima")`:

| Property | Type | Description |
|----------|------|-------------|
| `adsManager` | `ImaAdsManager` | The IMA AdsManager instance |
| `adsLoader` | `ImaAdsLoader` | The IMA AdsLoader instance |
| `adDisplayContainer` | `ImaAdDisplayContainer` | The IMA AdDisplayContainer |
| `requestAds` | `(adTagUrl?: string) => void` | Request new ads on demand |

## Notes

- IMA SDK is loaded via script injection from `https://imasdk.googleapis.com/js/sdkloader/ima3.js` by default. Override with `sdkUrl`.
- IMA SDK **controls video playback during ads**. The plugin does not swap `player.el.src` — this is the key difference from the VAST plugin.
- Tracking (impressions, quartiles, clicks) is handled internally by IMA SDK. The `ad:impression`, `ad:quartile` etc. events are informational — the actual beacon firing is done by IMA.
- The plugin handles fullscreen changes and player resize via `ResizeObserver`, forwarding size updates to `adsManager.resize()`.
- Post-roll support: the plugin calls `adsLoader.contentComplete()` when the content ends.
- On iOS, the plugin calls `setDisableCustomPlaybackForIOS10Plus(true)` to enable skippable ad support. This is automatic.
