import type { Player } from "../types.js";
import type { VastAd } from "../vast/types.js";
import {
	SIMID_VERSION,
	buildMessage,
	buildReject,
	buildResolve,
	isCreateSession,
	isReject,
	isResolve,
	parseMessage,
} from "./protocol.js";
import type {
	CreativeData,
	Dimensions,
	EnvironmentData,
	MediaState,
	SimidMessage,
	SimidRequestPolicy,
} from "./types.js";

export interface SimidHostOptions {
	policy: SimidRequestPolicy;
	handshakeTimeout: number;
}

export interface SimidHost {
	/** Run the handshake sequence. Resolves when creative is ready. */
	start(): Promise<void>;
	/** Tear down all listeners and close communication. */
	destroy(): void;
}

export function createSimidHost(
	player: Player,
	port: MessagePort,
	options: SimidHostOptions,
	ad: VastAd,
): SimidHost {
	let destroyed = false;
	let sessionId = "";
	let hostMessageId = 0;
	const eventCleanups: (() => void)[] = [];

	// Pending resolve/reject waiters keyed by the messageId we sent
	const pending = new Map<
		number,
		{ resolve: (msg: SimidMessage) => void; reject: (err: Error) => void }
	>();

	function nextId(): number {
		return hostMessageId++;
	}

	function send(type: string, args?: unknown): number {
		const id = nextId();
		const msg = buildMessage(sessionId, id, type, args);
		port.postMessage(msg);
		return id;
	}

	function sendResolve(inReplyTo: number, value?: unknown): void {
		const id = nextId();
		port.postMessage(buildResolve(sessionId, id, inReplyTo, value));
	}

	function sendReject(
		inReplyTo: number,
		errorCode: number,
		errorMessage?: string,
	): void {
		const id = nextId();
		port.postMessage(
			buildReject(sessionId, id, inReplyTo, errorCode, errorMessage),
		);
	}

	/** Send a message and wait for its resolve/reject response. */
	function sendAndWait(
		type: string,
		args?: unknown,
		timeout?: number,
	): Promise<SimidMessage> {
		return new Promise<SimidMessage>((resolve, reject) => {
			const id = send(type, args);
			const timer = setTimeout(() => {
				pending.delete(id);
				reject(new Error(`SIMID timeout waiting for response to ${type}`));
			}, timeout ?? options.handshakeTimeout);

			pending.set(id, {
				resolve: (msg) => {
					clearTimeout(timer);
					pending.delete(id);
					resolve(msg);
				},
				reject: (err) => {
					clearTimeout(timer);
					pending.delete(id);
					reject(err);
				},
			});
		});
	}

	function getVideoDimensions(): Dimensions {
		const rect = player.el.getBoundingClientRect();
		return {
			x: Math.round(rect.x),
			y: Math.round(rect.y),
			width: Math.round(rect.width),
			height: Math.round(rect.height),
		};
	}

	function buildEnvironmentData(): EnvironmentData {
		const dims = getVideoDimensions();
		return {
			videoDimensions: dims,
			creativeDimensions: dims,
			fullscreen: !!document.fullscreenElement,
			fullscreenAllowed: !!document.fullscreenEnabled,
			variableDurationAllowed: false,
			skippableState: "playerHandles",
			version: SIMID_VERSION,
			muted: player.muted,
			volume: player.volume,
			navigationSupport:
				options.policy.navigation === "new-tab"
					? "playerHandles"
					: "notSupported",
		};
	}

	function buildCreativeData(): CreativeData {
		const linear = ad.creatives[0]?.linear;
		return {
			adParameters: "",
			clickThruUrl: linear?.clickThrough,
		};
	}

	function getMediaState(): MediaState {
		return {
			currentTime: player.el.currentTime,
			duration: player.el.duration,
			ended: player.el.ended,
			muted: player.muted,
			paused: player.el.paused,
			volume: player.volume,
			fullscreen: !!document.fullscreenElement,
		};
	}

	// --- Media event bridge ---

	function startMediaBridge(): void {
		const el = player.el;

		const simpleEvents = [
			"play",
			"pause",
			"playing",
			"ended",
			"seeking",
			"seeked",
			"stalled",
		] as const;

		for (const event of simpleEvents) {
			const handler = (): void => {
				if (destroyed) return;
				send(`SIMID:Media:${event}`);
			};
			el.addEventListener(event, handler);
			eventCleanups.push(() => el.removeEventListener(event, handler));
		}

		const onTimeupdate = (): void => {
			if (destroyed) return;
			send("SIMID:Media:timeupdate", { currentTime: el.currentTime });
		};
		el.addEventListener("timeupdate", onTimeupdate);
		eventCleanups.push(() =>
			el.removeEventListener("timeupdate", onTimeupdate),
		);

		const onDurationchange = (): void => {
			if (destroyed) return;
			send("SIMID:Media:durationchange", { duration: el.duration });
		};
		el.addEventListener("durationchange", onDurationchange);
		eventCleanups.push(() =>
			el.removeEventListener("durationchange", onDurationchange),
		);

		const onVolumechange = (): void => {
			if (destroyed) return;
			send("SIMID:Media:volumechange", {
				volume: el.volume,
				muted: el.muted,
			});
		};
		el.addEventListener("volumechange", onVolumechange);
		eventCleanups.push(() =>
			el.removeEventListener("volumechange", onVolumechange),
		);

		const onError = (): void => {
			if (destroyed) return;
			send("SIMID:Media:error", {
				error: el.error?.code ?? 0,
				message: el.error?.message ?? "",
			});
		};
		el.addEventListener("error", onError);
		eventCleanups.push(() => el.removeEventListener("error", onError));
	}

	// --- Creative request handler ---

	function handleCreativeMessage(msg: SimidMessage): void {
		if (destroyed) return;

		// Route resolve/reject to pending waiters
		if (isResolve(msg) || isReject(msg)) {
			const args = msg.args as { messageId?: number } | undefined;
			const replyTo = args?.messageId;
			if (replyTo !== undefined) {
				const waiter = pending.get(replyTo);
				if (waiter) {
					if (isResolve(msg)) {
						waiter.resolve(msg);
					} else {
						waiter.reject(
							new Error(`SIMID creative rejected: ${JSON.stringify(msg.args)}`),
						);
					}
				}
			}
			return;
		}

		const type = msg.type;

		if (type === "SIMID:Creative:requestPause") {
			if (options.policy.allowPause) {
				player.pause();
				sendResolve(msg.messageId);
			} else {
				sendReject(msg.messageId, 1203, "Pause not allowed");
			}
			return;
		}

		if (type === "SIMID:Creative:requestPlay") {
			if (options.policy.allowPlay) {
				player.play();
				sendResolve(msg.messageId);
			} else {
				sendReject(msg.messageId, 1203, "Play not allowed");
			}
			return;
		}

		if (type === "SIMID:Creative:requestResize") {
			if (options.policy.allowResize) {
				sendResolve(msg.messageId);
			} else {
				sendReject(msg.messageId, 1203, "Resize not allowed");
			}
			return;
		}

		if (type === "SIMID:Creative:requestNavigation") {
			const args = msg.args as { uri?: string } | undefined;
			if (options.policy.navigation === "new-tab" && args?.uri) {
				window.open(args.uri, "_blank");
				sendResolve(msg.messageId);
			} else {
				sendReject(msg.messageId, 1214, "Navigation not supported");
			}
			return;
		}

		if (type === "SIMID:Creative:getMediaState") {
			sendResolve(msg.messageId, getMediaState());
			return;
		}

		if (type === "SIMID:Creative:requestSkip") {
			sendResolve(msg.messageId);
			player.emit("ad:skip", { adId: ad.id });
			return;
		}

		if (type === "SIMID:Creative:requestStop") {
			sendResolve(msg.messageId);
			send("SIMID:Player:adStopped", { code: 4 });
			destroy();
			player.emit("ad:skip", { adId: ad.id });
			return;
		}

		if (type === "SIMID:Creative:clickThru") {
			// Info-only, no response required
			return;
		}

		if (type === "SIMID:Creative:fatalError") {
			player.emit("ad:error", {
				error: new Error(
					`SIMID creative fatal error: ${JSON.stringify(msg.args)}`,
				),
				source: "simid",
			});
			destroy();
			return;
		}

		if (type === "SIMID:Creative:log") {
			const args = msg.args as { message?: string } | undefined;
			console.debug("[vide:simid] creative:", args?.message);
			return;
		}

		if (type === "SIMID:Creative:reportTracking") {
			sendResolve(msg.messageId);
			return;
		}

		if (type === "SIMID:Creative:requestChangeVolume") {
			const args = msg.args as { volume?: number; muted?: boolean } | undefined;
			if (args?.volume !== undefined) player.volume = args.volume;
			if (args?.muted !== undefined) player.muted = args.muted;
			sendResolve(msg.messageId);
			return;
		}

		if (
			type === "SIMID:Creative:requestFullscreen" ||
			type === "SIMID:Creative:requestExitFullscreen" ||
			type === "SIMID:Creative:requestChangeAdDuration"
		) {
			sendReject(msg.messageId, 1203, "Not supported");
			return;
		}

		// Nonlinear messages
		if (
			type === "SIMID:Creative:expandNonlinear" ||
			type === "SIMID:Creative:collapseNonlinear"
		) {
			sendReject(msg.messageId, 1203, "Not supported");
			return;
		}
	}

	function onPortMessage(event: MessageEvent): void {
		const msg = parseMessage(event.data);
		if (!msg) return;
		handleCreativeMessage(msg);
	}

	function destroy(): void {
		if (destroyed) return;
		destroyed = true;

		port.removeEventListener("message", onPortMessage);

		for (const cleanup of eventCleanups) {
			cleanup();
		}
		eventCleanups.length = 0;

		for (const [, waiter] of pending) {
			waiter.reject(new Error("SIMID host destroyed"));
		}
		pending.clear();
	}

	async function start(): Promise<void> {
		port.addEventListener("message", onPortMessage);
		port.start();

		// Wait for createSession from creative
		const createSessionMsg = await new Promise<SimidMessage>(
			(resolve, reject) => {
				const timer = setTimeout(() => {
					reject(new Error("SIMID handshake timeout: no createSession"));
				}, options.handshakeTimeout);

				const handler = (event: MessageEvent): void => {
					const msg = parseMessage(event.data);
					if (!msg || !isCreateSession(msg)) return;
					clearTimeout(timer);
					port.removeEventListener("message", handler);
					resolve(msg);
				};

				// We need a separate listener for the createSession message
				// because the main onPortMessage handler routes resolve/reject
				// but createSession is the first message before sessionId is set
				port.addEventListener("message", handler);
			},
		);

		if (destroyed) throw new Error("SIMID host destroyed during handshake");

		sessionId = createSessionMsg.sessionId;
		sendResolve(createSessionMsg.messageId);

		// Send Player:init
		const initResponse = await sendAndWait("SIMID:Player:init", {
			environmentData: buildEnvironmentData(),
			creativeData: buildCreativeData(),
		});

		if (destroyed) throw new Error("SIMID host destroyed during handshake");

		if (isReject(initResponse)) {
			throw new Error(
				`SIMID creative rejected init: ${JSON.stringify(initResponse.args)}`,
			);
		}

		// Send Player:startCreative
		const startResponse = await sendAndWait("SIMID:Player:startCreative");

		if (destroyed) throw new Error("SIMID host destroyed during handshake");

		if (isReject(startResponse)) {
			throw new Error(
				`SIMID creative rejected startCreative: ${JSON.stringify(startResponse.args)}`,
			);
		}

		// Start media event bridge
		startMediaBridge();
	}

	return { start, destroy };
}
