import { useRef, useState } from "react";
import {
  useVidePlayer,
  useHls,
  useVast,
  useVideEvent,
  useAutohide,
  useKeyboard,
  Vide,
} from "@videts/vide/react";
import "@videts/vide/ui/theme.css";

const HLS_SRC = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

const VAST_TAG =
  "https://pubads.g.doubleclick.net/gampad/ads?" +
  "iu=/21775744923/external/single_preroll_skippable" +
  "&sz=640x480&ciu_szs=300x250,728x90&gdfp_req=1" +
  "&output=vast&unviewed_position_start=1&env=vp&impl=s" +
  "&correlator=" +
  Date.now();

export function App() {
  const player = useVidePlayer();
  useHls(player);
  useVast(player, { tagUrl: VAST_TAG });

  const uiRef = useRef<HTMLDivElement>(null);
  useAutohide(uiRef, player.current);
  useKeyboard(uiRef, player.current);

  const [state, setState] = useState("idle");

  useVideEvent(player, "statechange", ({ to }) => {
    setState(to);
  });

  useVideEvent(player, "ad:start", () => {
    console.log("Ad started");
  });

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 800, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>vide — React</h1>
      <p>
        State: <code>{state}</code>
      </p>

      <Vide.Root player={player}>
        <Vide.UI ref={uiRef}>
          <Vide.Video
            src={HLS_SRC}
            style={{ width: "100%", background: "#000", display: "block" }}
          />
          <Vide.ClickPlay />
          <Vide.BigPlayButton />
          <Vide.Loader />
          <Vide.Controls>
            <Vide.PlayButton />
            <Vide.Progress />
            <Vide.TimeDisplay separator=" / " />
            <Vide.Volume />
            <Vide.FullscreenButton />
          </Vide.Controls>
        </Vide.UI>
      </Vide.Root>
    </div>
  );
}
