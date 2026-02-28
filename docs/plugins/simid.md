# SIMID

SIMID 1.2 (Secure Interactive Media Interface Definition) for interactive ad creatives. Renders creative content in a sandboxed iframe with MessageChannel-based communication.

## Usage

SIMID is used as an AdPlugin within VAST:

```html
<video src="video.mp4"></video>
<div id="ad-container"></div>
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
