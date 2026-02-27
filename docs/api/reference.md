# API Reference

## createPlayer

```ts
import { createPlayer } from "@videts/vide";

function createPlayer(el: HTMLVideoElement): Player;
```

Creates a player instance wrapping a `<video>` element.

## Player

```ts
interface Player extends EventBus {
  readonly el: HTMLVideoElement;
  readonly state: PlayerState;

  // HTMLVideoElement proxy
  play(): Promise<void>;
  pause(): void;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  readonly paused: boolean;
  readonly ended: boolean;
  readonly readyState: number;
  readonly buffered: TimeRanges;
  readonly seekable: TimeRanges;
  readonly seeking: boolean;
  readonly videoWidth: number;
  readonly videoHeight: number;
  readonly networkState: number;
  loop: boolean;
  autoplay: boolean;
  poster: string;
  preload: "" | "none" | "metadata" | "auto";
  defaultPlaybackRate: number;
  defaultMuted: boolean;
  crossOrigin: string | null;
  controls: boolean;

  // Source
  src: string;
  registerSourceHandler(handler: SourceHandler): void;

  // Plugin
  use(plugin: Plugin): void;

  // Cross-plugin data
  setPluginData(key: string, data: unknown): void;
  getPluginData(key: string): unknown;

  // Web-standard delegation
  addEventListener(type, listener, options?): void;
  removeEventListener(type, listener, options?): void;

  // Lifecycle
  destroy(): void;
}
```

## PlayerState

```ts
type PlayerState =
  | "idle"
  | "loading"
  | "ready"
  | "playing"
  | "paused"
  | "buffering"
  | "ad:loading"
  | "ad:playing"
  | "ad:paused"
  | "ended"
  | "error";
```

State transitions are validated. Invalid transitions log a warning.

## EventBus

```ts
interface EventBus {
  on(event, handler): void;
  off(event, handler): void;
  emit(event, data): void;
  once(event, handler): void;
}
```

- Custom events (`statechange`, `ad:*`, etc.) use the internal EventBus.
- Native events (`canplay`, `volumechange`, etc.) delegate to the `<video>` element.
- Both can be used with `on()` — the player routes automatically.

## PlayerEventMap

```ts
interface PlayerEventMap {
  statechange: { from: PlayerState; to: PlayerState };
  play: void;
  pause: void;
  ended: void;
  timeupdate: { currentTime: number; duration: number };
  error: { code: number; message: string };
  "ad:start": { adId: string };
  "ad:end": { adId: string };
  "ad:skip": { adId: string };
  "ad:click": { clickThrough: string | undefined; clickTracking: string[] };
  "ad:error": { error: Error };
  "ad:impression": { adId: string };
  "ad:loaded": { adId: string };
  "ad:quartile": { adId: string; quartile: AdQuartile };
  "ad:mute": { adId: string };
  "ad:unmute": { adId: string };
  "ad:volumeChange": { adId: string; volume: number };
  "ad:fullscreen": { adId: string; fullscreen: boolean };
  "ad:breakStart": { breakId: string | undefined };
  "ad:breakEnd": { breakId: string | undefined };
  destroy: void;
}
```

## Plugin

```ts
interface Plugin {
  name: string;
  setup(player: Player): (() => void) | void;
}
```

## SourceHandler

```ts
interface SourceHandler {
  canHandle(url: string, type?: string): boolean;
  load(url: string, videoElement: HTMLVideoElement): void;
  unload(videoElement: HTMLVideoElement): void;
}
```

## UIComponent

```ts
interface UIComponent {
  mount(container: HTMLElement): void;
  connect(player: Player): void;
  destroy(): void;
}
```
