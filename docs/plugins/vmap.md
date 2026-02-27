# VMAP

VMAP ad break scheduling. Fetches a VMAP document and plays VAST ads at the specified time offsets.

## Usage

```ts
import { createPlayer } from "@videts/vide";
import { vmap } from "@videts/vide/vmap";

const player = createPlayer(document.querySelector("video")!);
player.use(vmap({ url: "https://example.com/vmap.xml" }));
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | — | VMAP document URL (required) |
| `timeout` | `number` | `5000` | Request timeout in ms |
| `vastOptions` | `{ timeout?, maxDepth? }` | — | Options passed to the underlying VAST resolver |
| `adPlugins` | `(ad: VastAd) => AdPlugin[]` | — | Per-ad plugin factory (same as VAST) |

## Events

VMAP fires the same ad events as VAST (`ad:start`, `ad:end`, `ad:impression`, etc.) plus:

| Event | Payload | Description |
|-------|---------|-------------|
| `ad:breakStart` | `{ breakId }` | Ad break started |
| `ad:breakEnd` | `{ breakId }` | Ad break ended |

## Ad Break Time Offsets

VMAP supports four time offset types:

| Type | Example | Description |
|------|---------|-------------|
| `start` | `start` | Pre-roll — before content |
| `end` | `end` | Post-roll — after content |
| `time` | `00:05:00.000` | Mid-roll at specific time |
| `percentage` | `50%` | Mid-roll at percentage of duration |

## Notes

- VMAP depends on VAST internally. The dependency direction is `vmap → vast → core`.
- Supports inline VAST (`<AdData>`) and remote VAST (`<AdTagURI>`).
- Size: **2.6 KB** gzip (includes VAST dependency).
