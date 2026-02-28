# Text Tracks

Control subtitles and captions via the Player API. vide delegates to the browser's native `<track>` and `TextTrack` APIs — no custom parser or renderer.

## HTML `<track>` Elements

Standard `<track>` elements work as-is:

```html
<video src="video.mp4">
  <track src="en.vtt" kind="subtitles" srclang="en" label="English" default>
  <track src="fr.vtt" kind="subtitles" srclang="fr" label="French">
</video>
```

```ts
import { createPlayer } from "@videts/vide";

const player = createPlayer(document.querySelector("video")!);

player.on("texttracksavailable", ({ tracks }) => {
  console.log(tracks); // VideTextTrack[]
});
```

## Native vs Convenience API

`player.textTracks` returns the native `TextTrackList` — same reference as `player.el.textTracks`. Use it when you need the full browser API.

The convenience methods return normalized `VideTextTrack` objects:

| Native (delegate)        | Convenience (normalized)   |
| ------------------------ | -------------------------- |
| `player.textTracks`      | `player.getTextTracks()`   |
| `el.textTracks[i].mode`  | `player.setTextTrack(id)`  |
| `track.activeCues`       | `player.activeCues`        |

## Adding Tracks Programmatically

```ts
player.addTextTrack({
  src: "https://example.com/subtitles-en.vtt",
  label: "English",
  language: "en",
  kind: "subtitles", // optional, defaults to "subtitles"
  default: true,     // optional
});
```

This creates a `<track>` element and appends it to the video. The `texttracksavailable` event fires once the browser processes the new track.

## Switching Tracks

```ts
// Activate track at index 0
player.setTextTrack(0);

// Deactivate all tracks
player.setTextTrack(-1);

// Get the currently active track
const active = player.getActiveTextTrack(); // VideTextTrack | null
```

## Reading Active Cues

```ts
// Snapshot of current cues from the showing track
const cues = player.activeCues; // VideCue[]

// Or listen for updates
player.on("cuechange", ({ cues }) => {
  cues.forEach((cue) => console.log(cue.text));
});
```

## Events

| Event                  | Data                                | When                                       |
| ---------------------- | ----------------------------------- | ------------------------------------------ |
| `texttracksavailable`  | `{ tracks: VideTextTrack[] }`       | Track added or removed                     |
| `texttrackchange`      | `{ track: VideTextTrack \| null }`  | Active track changed via `setTextTrack()`  |
| `cuechange`            | `{ cues: VideCue[] }`              | Active cues changed on the showing track   |

## Types

```ts
interface VideTextTrack {
  id: number;
  label: string;
  language: string;
  kind: "subtitles" | "captions" | "descriptions" | "chapters" | "metadata";
  active: boolean;
}

interface VideCue {
  startTime: number;
  endTime: number;
  text: string;
}
```
