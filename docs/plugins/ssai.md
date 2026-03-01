# SSAI

Server-Side Ad Insertion — detects ad breaks from HLS/DASH in-band metadata and fires standard ad events. No vendor SDK required.

## Install

No additional dependencies. Requires [HLS](/plugins/hls) or [DASH](/plugins/dash) plugin.

## Usage

```ts
import { createPlayer } from "@videts/vide";
import { hls } from "@videts/vide/hls";
import { ssai } from "@videts/vide/ssai";

const player = createPlayer(document.querySelector("video")!);
player.use(hls());
player.use(ssai());

player.on("ad:start", ({ adId }) => console.log("ad started", adId));
player.on("ad:end", ({ adId }) => console.log("ad ended", adId));

player.src = "https://example.com/ssai-stream.m3u8";
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `parser` | `MetadataParser` | auto-detect | Custom metadata parser for vendor-specific formats |
| `tolerance` | `number` | `0.5` | Time tolerance in seconds for ad break matching |

### Custom Parser

```ts
player.use(ssai({
  parser(raw) {
    if (raw.source === "daterange" && raw.attributes["X-MY-AD"] === "true") {
      return [{
        id: raw.attributes.ID,
        startTime: new Date(raw.attributes["START-DATE"]).getTime() / 1000,
        duration: Number(raw.attributes.DURATION || 0),
        tracking: {
          impression: [raw.attributes["X-IMPRESSION"]].filter(Boolean),
          firstQuartile: [raw.attributes["X-FIRST-QUARTILE"]].filter(Boolean),
          midpoint: [raw.attributes["X-MIDPOINT"]].filter(Boolean),
          thirdQuartile: [raw.attributes["X-THIRD-QUARTILE"]].filter(Boolean),
          complete: [raw.attributes["X-COMPLETE"]].filter(Boolean),
        },
        clickThrough: raw.attributes["X-CLICK-THROUGH"],
      }];
    }
    return [];
  },
}));
```

### RawMetadata Types

The parser receives a discriminated union depending on the source:

```ts
// HLS EXT-X-DATERANGE
{ source: "daterange"; attributes: Record<string, string> }

// HLS ID3 timed metadata
{ source: "id3"; samples: Array<{ type: string; data: Uint8Array }> }

// DASH EventStream
{
  source: "eventstream";
  schemeIdUri: string;
  value: string;
  startTime: number;
  duration: number;
  messageData?: string;
}
```

## Tracking

The `tracking` field on `AdBreakMetadata` provides VAST-equivalent tracking with timing-specific URL firing.

### AdTrackingMap

```ts
interface AdTrackingMap {
  impression?: string[];  // Fired at ad:start
  start?: string[];       // Fired at ad:start (0%)
  firstQuartile?: string[];  // Fired at 25%
  midpoint?: string[];       // Fired at 50%
  thirdQuartile?: string[];  // Fired at 75%
  complete?: string[];       // Fired at 100%
  pause?: string[];    // Fired on player pause during ad
  resume?: string[];   // Fired on player play during ad
  skip?: string[];     // Fired on ad:skip
}
```

Each quartile fires exactly once per ad break. If the viewer seeks past a quartile, all skipped quartiles fire in order.

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `ad:start` | `{ adId }` | Ad playback started |
| `ad:end` | `{ adId }` | Ad playback ended |
| `ad:impression` | `{ adId }` | Ad impression tracked |
| `ad:quartile` | `{ adId, quartile }` | Quartile reached (start, firstQuartile, midpoint, thirdQuartile, complete) |
| `ad:breakStart` | `{ breakId }` | Ad break started |
| `ad:breakEnd` | `{ breakId }` | Ad break ended |

## Notes

- Default parser auto-detects SCTE-35 markers in HLS DATERANGE tags.
- The plugin reads the hls.js or dash.js instance via `getPluginData()`.
- Tracking pixels are fired via the same beacon mechanism as VAST.
- Quartile calculation reuses the same logic as the VAST plugin.
- Size: **2.0 KB** gzip.
