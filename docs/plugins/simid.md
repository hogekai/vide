# SIMID

SIMID 1.2 (Secure Interactive Media Interface Definition) for interactive ad creatives. Renders creative content in a sandboxed iframe with MessageChannel-based communication.

## Usage

SIMID is used as an AdPlugin within VAST:

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
import { createPlayer } from "@videts/vide";
import { vast } from "@videts/vide/vast";
import { simid } from "@videts/vide/simid";

const player = createPlayer(document.querySelector("video")!);
player.use(vast({
  tagUrl: "https://example.com/vast.xml",
  adPlugins: () => [
    simid({ container: document.getElementById("ad-container")! }),
  ],
}));
```

## Ad Container Setup {#ad-container-setup}

The `container` element is where the SIMID creative iframe is rendered. It must overlay the player area with the following CSS requirements:

| Property | Value | Why |
|----------|-------|-----|
| `position: absolute` | Cover the player area | Creative iframe renders inside this container |
| `z-index: 3` | Above UI click overlay | The UI plugin's click-to-play overlay uses `z-index: 2` during ad states — the container must be higher |
| `pointer-events: none` | On the container | Non-ad clicks pass through to the player/UI below |
| `pointer-events: auto` | On children (`> *`) | The creative's interactive elements receive clicks |

The parent element (`#player-container`) must have `position: relative` to establish the positioning context.

::: warning Without the UI plugin
If you're not using the UI plugin (no click-to-play overlay), `z-index` is not required — only `position: absolute` and the `pointer-events` setup matter.
:::

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | `HTMLElement` | — | Container for the SIMID iframe (required) |
| `policy` | `Partial<SimidRequestPolicy>` | see below | Request policy overrides |
| `handshakeTimeout` | `number` | `5000` | Handshake timeout in ms |

### SimidRequestPolicy

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `allowPause` | `boolean` | `true` | Allow creative to pause media |
| `allowPlay` | `boolean` | `true` | Allow creative to resume media |
| `allowResize` | `boolean` | `false` | Allow creative to resize ad slot |
| `navigation` | `"new-tab" \| "deny"` | `"new-tab"` | How to handle requestNavigation |

## Events

SIMID creatives communicate through the MessageChannel. The plugin bridges media events from the player to the creative and handles creative requests (pause, play, resize, navigation).

Standard ad events (`ad:start`, `ad:end`, `ad:click`) are fired by the parent VAST plugin.

## Notes

- The VAST parser automatically extracts `InteractiveCreativeFile` elements from the VAST response.
- Creative iframes are sandboxed with `allow-scripts allow-same-origin`.
- The plugin implements the full SIMID handshake sequence (init → ready → start → stop).
- Size: **2.4 KB** gzip.
