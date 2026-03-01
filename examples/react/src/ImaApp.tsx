import { useRef, useState } from "react";
import {
	Vide,
	useAutohide,
	useIma,
	useKeyboard,
	useVideEvent,
	useVidePlayer,
} from "@videts/vide/react";
import "@videts/vide/ui/theme.css";

const CONTENT_SRC =
	"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

function adTagUrl() {
	return `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_preroll_skippable&sz=640x480&ciu_szs=300x250,728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=${Date.now()}`;
}

const containerStyle = {
	position: "relative" as const,
	width: "100%",
	background: "#000",
	aspectRatio: "16/9",
};

const videoStyle = {
	position: "absolute" as const,
	top: 0,
	left: 0,
	width: "100%",
	height: "100%",
};

/** IMA with wrapping <Ima> component — simplest usage */
export function ImaWrapping() {
	const player = useVidePlayer();

	const uiRef = useRef<HTMLDivElement>(null);
	useAutohide(uiRef, player.current);
	useKeyboard(uiRef, player.current);

	const [state, setState] = useState("idle");
	useVideEvent(player, "statechange", ({ to }) => setState(to));

	return (
		<div>
			<h2>Wrapping: &lt;Vide.Ima&gt;</h2>
			<p>
				State: <code>{state}</code>
			</p>
			<Vide.Root player={player}>
				<Vide.Ima
					adTagUrl={adTagUrl()}
					autoplayAdBreaks
					style={{ ...containerStyle }}
				>
					<Vide.Video src={CONTENT_SRC} style={videoStyle} />
					<Vide.UI ref={uiRef}>
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
				</Vide.Ima>
			</Vide.Root>
		</div>
	);
}

/** IMA with invisible <ImaPlugin> + ref — supports conditional rendering */
export function ImaConditional() {
	const player = useVidePlayer();
	const containerRef = useRef<HTMLDivElement>(null);

	const uiRef = useRef<HTMLDivElement>(null);
	useAutohide(uiRef, player.current);
	useKeyboard(uiRef, player.current);

	const [state, setState] = useState("idle");
	const [enableAds, setEnableAds] = useState(true);
	useVideEvent(player, "statechange", ({ to }) => setState(to));

	return (
		<div>
			<h2>Ref-based: &lt;Vide.ImaPlugin&gt;</h2>
			<p>
				State: <code>{state}</code>
			</p>
			<label>
				<input
					type="checkbox"
					checked={enableAds}
					onChange={(e) => setEnableAds(e.target.checked)}
				/>{" "}
				Enable IMA Ads
			</label>
			<Vide.Root player={player}>
				<div ref={containerRef} style={containerStyle}>
					<Vide.Video src={CONTENT_SRC} style={videoStyle} />
					{enableAds && (
						<Vide.ImaPlugin
							adTagUrl={adTagUrl()}
							adContainer={containerRef}
							autoplayAdBreaks
						/>
					)}
					<Vide.UI ref={uiRef}>
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
				</div>
			</Vide.Root>
		</div>
	);
}

/** useIma hook-based usage */
export function ImaHook() {
	const player = useVidePlayer();
	const containerRef = useRef<HTMLDivElement>(null);

	useIma(player, {
		adTagUrl: adTagUrl(),
		adContainer: containerRef,
		autoplayAdBreaks: true,
	});

	const uiRef = useRef<HTMLDivElement>(null);
	useAutohide(uiRef, player.current);
	useKeyboard(uiRef, player.current);

	const [state, setState] = useState("idle");
	useVideEvent(player, "statechange", ({ to }) => setState(to));

	return (
		<div>
			<h2>Hook: useIma()</h2>
			<p>
				State: <code>{state}</code>
			</p>
			<Vide.Root player={player}>
				<div ref={containerRef} style={containerStyle}>
					<Vide.Video src={CONTENT_SRC} style={videoStyle} />
					<Vide.UI ref={uiRef}>
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
				</div>
			</Vide.Root>
		</div>
	);
}
