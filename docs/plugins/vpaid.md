# VPAID

VPAID 2.0 (Video Player-Ad Interface Definition) for JavaScript-based interactive ad creatives. Loads an ad unit script, manages the VPAID lifecycle (handshake → init → start → stop), and maps VPAID events to vide player events and VAST tracking.

## Usage

VPAID is used as an AdPlugin within VAST:

```html
<style>
  #player-container { position: relative; }
  #ad-container {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    z-index: 3;
    pointer-events: none;
  }
  #ad-container > * { pointer-events: auto; }
</style>

<div id="player-container">
  <video src="video.mp4"></video>
  <div id="ad-container"></div>
</div>
```

```ts
import { createPlayer } from "vide";
import { vast } from "vide/vast";
import { vpaid } from "vide/vpaid";

const player = createPlayer(document.querySelector("video")!);
player.use(vast({
  tagUrl: "https://example.com/vast.xml",
  adPlugins: () => [
    vpaid({ container: document.getElementById("ad-container")! }),
  ],
}));
```

## Ad Container Setup {#ad-container-setup}

The `container` element is where the VPAID creative renders its interactive content. It must overlay the player area with the following CSS requirements:

| Property | Value | Why |
|----------|-------|-----|
| `position: absolute` | Cover the player area | Creative renders in an absolutely positioned slot inside this container |
| `z-index: 3` | Above UI click overlay | The UI plugin's click-to-play overlay uses `z-index: 2` during ad states — the container must be higher |
| `pointer-events: none` | On the container | Non-ad clicks pass through to the player/UI below |
| `pointer-events: auto` | On children (`> *`) | The creative's interactive elements (buttons, forms) receive clicks |

The parent element (`#player-container`) must have `position: relative` to establish the positioning context.

::: warning Without the UI plugin
If you're not using the UI plugin (no click-to-play overlay), `z-index` is not required — only `position: absolute` and the `pointer-events` setup matter.
:::

The same container pattern applies to SIMID — see [SIMID Ad Container Setup](/plugins/simid#ad-container-setup).

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | `HTMLElement` | — | Container for the VPAID ad slot (required) |
| `loadTimeout` | `number` | `10000` | Script load timeout in ms |
| `handshakeTimeout` | `number` | `5000` | `handshakeVersion()` timeout in ms |
| `initTimeout` | `number` | `8000` | `initAd()` → `AdLoaded` timeout in ms |
| `startTimeout` | `number` | `5000` | `startAd()` → `AdStarted` timeout in ms |
| `stopTimeout` | `number` | `5000` | `stopAd()` → `AdStopped` timeout in ms |
| `useFriendlyIframe` | `boolean` | `true` | Load VPAID JS in a friendly iframe for isolation |

## Security

VPAID loads third-party JavaScript that runs with access to the page DOM (unlike SIMID's sandboxed iframe). By default, the plugin uses a **friendly iframe** to provide moderate isolation — the ad's globals live in a separate window context, but it retains access to the `slot` and `videoSlot` DOM elements. Set `useFriendlyIframe: false` to load the script directly in the main page.

## Events

VPAID events are mapped to standard vide ad events:

| VPAID Event | vide Event |
|---|---|
| `AdVideoStart` / `AdVideoFirstQuartile` / `AdVideoMidpoint` / `AdVideoThirdQuartile` / `AdVideoComplete` | `ad:quartile` |
| `AdClickThru` | `ad:click` |
| `AdSkipped` | `ad:skip` |
| `AdVolumeChange` (volume = 0) | `ad:mute` |
| `AdVolumeChange` | `ad:volumeChange` |
| `AdError` | `ad:error` |

Standard lifecycle events (`ad:start`, `ad:end`, `ad:impression`) are fired by the parent VAST plugin.

## Notes

- VPAID media files are identified by `apiFramework="VPAID"` and `type="application/javascript"` on `<MediaFile>` elements in the VAST response.
- The `<AdParameters>` element under `<Linear>` is passed as `creativeData` to the ad unit's `initAd()` call.
- A fallback `<MediaFile>` (e.g., `video/mp4`) should be included alongside the VPAID file in the VAST response.
- VPAID files are excluded from normal media file selection — only non-VPAID files are considered as video sources.
