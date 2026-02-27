import { type MockInstance, afterEach, describe, expect, it, vi } from "vitest";
import { createPlayer } from "../../src/core.js";
import { type SimidHost, createSimidHost } from "../../src/simid/host.js";
import {
	buildMessage,
	buildReject,
	buildResolve,
	parseMessage,
} from "../../src/simid/protocol.js";
import type { SimidMessage } from "../../src/simid/types.js";
import type { Player } from "../../src/types.js";
import type { VastAd } from "../../src/vast/types.js";

// --- Helpers ---

function makeVideo(): HTMLVideoElement {
	const el = document.createElement("video");
	el.play = vi.fn().mockResolvedValue(undefined);
	el.pause = vi.fn();
	el.load = vi.fn();
	return el;
}

function makeAd(): VastAd {
	return {
		id: "ad-001",
		adSystem: "Test",
		adTitle: "Test Ad",
		impressions: [],
		creatives: [
			{
				id: "c1",
				linear: {
					duration: 30,
					mediaFiles: [],
					interactiveCreativeFiles: [
						{
							url: "https://example.com/creative.html",
							apiFramework: "SIMID",
						},
					],
					trackingEvents: {
						start: [],
						firstQuartile: [],
						midpoint: [],
						thirdQuartile: [],
						complete: [],
						pause: [],
						resume: [],
						skip: [],
					},
					clickThrough: "https://example.com/landing",
					clickTracking: [],
				},
			},
		],
		errors: [],
	};
}

const defaultPolicy = {
	allowPause: true,
	allowPlay: true,
	allowResize: false,
	navigation: "new-tab" as const,
};

/**
 * Helper: listen for messages on a port and collect them.
 * Returns a function that waits for the next message matching a predicate.
 */
function portListener(port: MessagePort) {
	const messages: SimidMessage[] = [];
	const waiters: Array<{
		predicate: (msg: SimidMessage) => boolean;
		resolve: (msg: SimidMessage) => void;
	}> = [];

	port.addEventListener("message", (event: MessageEvent) => {
		const msg = parseMessage(event.data);
		if (!msg) return;
		messages.push(msg);

		for (let i = waiters.length - 1; i >= 0; i--) {
			if (waiters[i].predicate(msg)) {
				waiters[i].resolve(msg);
				waiters.splice(i, 1);
			}
		}
	});
	port.start();

	return {
		messages,
		waitFor(
			predicate: (msg: SimidMessage) => boolean,
			timeout = 1000,
		): Promise<SimidMessage> {
			// Check already received messages first
			const existing = messages.find(predicate);
			if (existing) return Promise.resolve(existing);

			return new Promise((resolve, reject) => {
				const timer = setTimeout(
					() => reject(new Error("waitFor timeout")),
					timeout,
				);
				waiters.push({
					predicate,
					resolve: (msg) => {
						clearTimeout(timer);
						resolve(msg);
					},
				});
			});
		},
	};
}

/** Simulate the creative side of a full handshake on port2. */
async function doHandshake(
	port2: MessagePort,
	listener: ReturnType<typeof portListener>,
	sessionId = "test-session",
) {
	// Creative sends createSession
	port2.postMessage(buildMessage(sessionId, 0, "createSession", {}));

	// Wait for host to send Player:init
	const initMsg = await listener.waitFor((m) => m.type === "SIMID:Player:init");

	// Creative resolves init
	port2.postMessage(buildResolve(sessionId, 1, initMsg.messageId));

	// Wait for host to send Player:startCreative
	const startMsg = await listener.waitFor(
		(m) => m.type === "SIMID:Player:startCreative",
	);

	// Creative resolves startCreative
	port2.postMessage(buildResolve(sessionId, 2, startMsg.messageId));
}

// --- Tests ---

describe("SIMID Host — Handshake", () => {
	it("completes handshake successfully", async () => {
		const player = createPlayer(makeVideo());
		const { port1, port2 } = new MessageChannel();
		const listener = portListener(port2);

		const host = createSimidHost(
			player,
			port1,
			{ policy: defaultPolicy, handshakeTimeout: 2000 },
			makeAd(),
		);

		const startPromise = host.start();

		await doHandshake(port2, listener);
		await startPromise;

		// Verify the sequence: resolve(createSession), Player:init, Player:startCreative
		const types = listener.messages.map((m) => m.type);
		expect(types).toContain("resolve");
		expect(types).toContain("SIMID:Player:init");
		expect(types).toContain("SIMID:Player:startCreative");

		// Verify init contains environmentData and creativeData
		const initMsg = listener.messages.find(
			(m) => m.type === "SIMID:Player:init",
		);
		expect(initMsg).toBeDefined();
		const args = initMsg?.args as {
			environmentData: Record<string, unknown>;
			creativeData: Record<string, unknown>;
		};
		expect(args.environmentData).toBeDefined();
		expect(args.environmentData.version).toBe("1.2");
		expect(args.creativeData).toBeDefined();
		expect(args.creativeData.clickThruUrl).toBe("https://example.com/landing");

		host.destroy();
		player.destroy();
		port1.close();
		port2.close();
	});

	it("times out if creative never sends createSession", async () => {
		const player = createPlayer(makeVideo());
		const { port1, port2 } = new MessageChannel();
		const errorHandler = vi.fn();
		player.on("ad:error", errorHandler);

		const host = createSimidHost(
			player,
			port1,
			{ policy: defaultPolicy, handshakeTimeout: 50 },
			makeAd(),
		);

		await expect(host.start()).rejects.toThrow("timeout");

		host.destroy();
		player.destroy();
		port1.close();
		port2.close();
	});
});

describe("SIMID Host — Media Event Bridge", () => {
	it("forwards video events as SIMID:Media messages", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const { port1, port2 } = new MessageChannel();
		const listener = portListener(port2);

		const host = createSimidHost(
			player,
			port1,
			{ policy: defaultPolicy, handshakeTimeout: 2000 },
			makeAd(),
		);

		const startPromise = host.start();
		await doHandshake(port2, listener);
		await startPromise;

		// Clear handshake messages
		listener.messages.length = 0;

		// Dispatch native video events
		el.dispatchEvent(new Event("play"));
		el.dispatchEvent(new Event("pause"));
		el.dispatchEvent(new Event("playing"));

		// Wait for messages to arrive
		await listener.waitFor((m) => m.type === "SIMID:Media:playing");

		const types = listener.messages.map((m) => m.type);
		expect(types).toContain("SIMID:Media:play");
		expect(types).toContain("SIMID:Media:pause");
		expect(types).toContain("SIMID:Media:playing");

		host.destroy();
		player.destroy();
		port1.close();
		port2.close();
	});

	it("forwards timeupdate with currentTime", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const { port1, port2 } = new MessageChannel();
		const listener = portListener(port2);

		const host = createSimidHost(
			player,
			port1,
			{ policy: defaultPolicy, handshakeTimeout: 2000 },
			makeAd(),
		);

		const startPromise = host.start();
		await doHandshake(port2, listener);
		await startPromise;

		listener.messages.length = 0;

		Object.defineProperty(el, "currentTime", { value: 10.5, writable: true });
		el.dispatchEvent(new Event("timeupdate"));

		const msg = await listener.waitFor(
			(m) => m.type === "SIMID:Media:timeupdate",
		);
		expect((msg.args as { currentTime: number }).currentTime).toBe(10.5);

		host.destroy();
		player.destroy();
		port1.close();
		port2.close();
	});

	it("forwards volumechange with volume and muted", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const { port1, port2 } = new MessageChannel();
		const listener = portListener(port2);

		const host = createSimidHost(
			player,
			port1,
			{ policy: defaultPolicy, handshakeTimeout: 2000 },
			makeAd(),
		);

		const startPromise = host.start();
		await doHandshake(port2, listener);
		await startPromise;

		listener.messages.length = 0;

		el.dispatchEvent(new Event("volumechange"));

		const msg = await listener.waitFor(
			(m) => m.type === "SIMID:Media:volumechange",
		);
		const args = msg.args as { volume: number; muted: boolean };
		expect(typeof args.volume).toBe("number");
		expect(typeof args.muted).toBe("boolean");

		host.destroy();
		player.destroy();
		port1.close();
		port2.close();
	});
});

describe("SIMID Host — Creative Requests", () => {
	async function setupHost(policyOverrides = {}) {
		const el = makeVideo();
		const player = createPlayer(el);
		const { port1, port2 } = new MessageChannel();
		const listener = portListener(port2);
		const sessionId = "test-session";

		const host = createSimidHost(
			player,
			port1,
			{
				policy: { ...defaultPolicy, ...policyOverrides },
				handshakeTimeout: 2000,
			},
			makeAd(),
		);

		const startPromise = host.start();
		await doHandshake(port2, listener, sessionId);
		await startPromise;

		listener.messages.length = 0;

		return { player, el, port1, port2, listener, host, sessionId };
	}

	function cleanup(ctx: {
		host: SimidHost;
		player: Player;
		port1: MessagePort;
		port2: MessagePort;
	}) {
		ctx.host.destroy();
		ctx.player.destroy();
		ctx.port1.close();
		ctx.port2.close();
	}

	it("requestPause allowed — calls player.pause and resolves", async () => {
		const ctx = await setupHost();

		ctx.port2.postMessage(
			buildMessage(ctx.sessionId, 10, "SIMID:Creative:requestPause"),
		);

		const response = await ctx.listener.waitFor((m) => m.type === "resolve");
		expect((response.args as { messageId: number }).messageId).toBe(10);
		expect(ctx.el.pause).toHaveBeenCalled();

		cleanup(ctx);
	});

	it("requestPause denied — sends reject", async () => {
		const ctx = await setupHost({ allowPause: false });

		ctx.port2.postMessage(
			buildMessage(ctx.sessionId, 10, "SIMID:Creative:requestPause"),
		);

		const response = await ctx.listener.waitFor((m) => m.type === "reject");
		expect((response.args as { messageId: number }).messageId).toBe(10);
		expect(ctx.el.pause).not.toHaveBeenCalled();

		cleanup(ctx);
	});

	it("requestPlay allowed — calls player.play and resolves", async () => {
		const ctx = await setupHost();

		ctx.port2.postMessage(
			buildMessage(ctx.sessionId, 11, "SIMID:Creative:requestPlay"),
		);

		const response = await ctx.listener.waitFor((m) => m.type === "resolve");
		expect((response.args as { messageId: number }).messageId).toBe(11);
		expect(ctx.el.play).toHaveBeenCalled();

		cleanup(ctx);
	});

	it("requestPlay denied — sends reject", async () => {
		const ctx = await setupHost({ allowPlay: false });

		ctx.port2.postMessage(
			buildMessage(ctx.sessionId, 11, "SIMID:Creative:requestPlay"),
		);

		const response = await ctx.listener.waitFor((m) => m.type === "reject");
		expect((response.args as { messageId: number }).messageId).toBe(11);

		cleanup(ctx);
	});

	it("requestResize — rejected by default", async () => {
		const ctx = await setupHost();

		ctx.port2.postMessage(
			buildMessage(ctx.sessionId, 12, "SIMID:Creative:requestResize"),
		);

		const response = await ctx.listener.waitFor((m) => m.type === "reject");
		expect((response.args as { messageId: number }).messageId).toBe(12);

		cleanup(ctx);
	});

	it("requestNavigation new-tab — opens window and resolves", async () => {
		const ctx = await setupHost();
		const openSpy = vi.fn();
		vi.stubGlobal("open", openSpy);

		ctx.port2.postMessage(
			buildMessage(ctx.sessionId, 13, "SIMID:Creative:requestNavigation", {
				uri: "https://example.com/landing",
			}),
		);

		const response = await ctx.listener.waitFor((m) => m.type === "resolve");
		expect((response.args as { messageId: number }).messageId).toBe(13);
		expect(openSpy).toHaveBeenCalledWith(
			"https://example.com/landing",
			"_blank",
		);

		vi.unstubAllGlobals();
		cleanup(ctx);
	});

	it("requestNavigation denied — sends reject", async () => {
		const ctx = await setupHost({ navigation: "deny" });

		ctx.port2.postMessage(
			buildMessage(ctx.sessionId, 13, "SIMID:Creative:requestNavigation", {
				uri: "https://example.com/landing",
			}),
		);

		const response = await ctx.listener.waitFor((m) => m.type === "reject");
		expect((response.args as { messageId: number }).messageId).toBe(13);

		cleanup(ctx);
	});

	it("getMediaState — resolves with media state", async () => {
		const ctx = await setupHost();

		ctx.port2.postMessage(
			buildMessage(ctx.sessionId, 14, "SIMID:Creative:getMediaState"),
		);

		const response = await ctx.listener.waitFor((m) => m.type === "resolve");
		const args = response.args as {
			messageId: number;
			value: Record<string, unknown>;
		};
		expect(args.messageId).toBe(14);
		expect(args.value).toBeDefined();
		expect(typeof args.value.currentTime).toBe("number");
		expect(typeof args.value.paused).toBe("boolean");
		expect(typeof args.value.volume).toBe("number");

		cleanup(ctx);
	});

	it("requestFullscreen — rejected", async () => {
		const ctx = await setupHost();

		ctx.port2.postMessage(
			buildMessage(ctx.sessionId, 15, "SIMID:Creative:requestFullscreen"),
		);

		const response = await ctx.listener.waitFor((m) => m.type === "reject");
		expect((response.args as { messageId: number }).messageId).toBe(15);

		cleanup(ctx);
	});

	it("requestChangeAdDuration — rejected", async () => {
		const ctx = await setupHost();

		ctx.port2.postMessage(
			buildMessage(
				ctx.sessionId,
				16,
				"SIMID:Creative:requestChangeAdDuration",
				{ duration: 60 },
			),
		);

		const response = await ctx.listener.waitFor((m) => m.type === "reject");
		expect((response.args as { messageId: number }).messageId).toBe(16);

		cleanup(ctx);
	});

	it("requestChangeVolume — sets volume and resolves", async () => {
		const ctx = await setupHost();

		ctx.port2.postMessage(
			buildMessage(ctx.sessionId, 17, "SIMID:Creative:requestChangeVolume", {
				volume: 0.5,
				muted: true,
			}),
		);

		const response = await ctx.listener.waitFor((m) => m.type === "resolve");
		expect((response.args as { messageId: number }).messageId).toBe(17);
		expect(ctx.player.volume).toBe(0.5);
		expect(ctx.player.muted).toBe(true);

		cleanup(ctx);
	});
});

describe("SIMID Host — Destroy", () => {
	it("ignores messages after destroy", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const { port1, port2 } = new MessageChannel();
		const listener = portListener(port2);
		const sessionId = "test-session";

		const host = createSimidHost(
			player,
			port1,
			{ policy: defaultPolicy, handshakeTimeout: 2000 },
			makeAd(),
		);

		const startPromise = host.start();
		await doHandshake(port2, listener, sessionId);
		await startPromise;

		host.destroy();
		listener.messages.length = 0;

		// Send a message after destroy — should be ignored
		port2.postMessage(
			buildMessage(sessionId, 20, "SIMID:Creative:requestPause"),
		);

		// Dispatch video event — should not produce SIMID message
		el.dispatchEvent(new Event("play"));

		// Give time for any messages to arrive
		await new Promise((r) => setTimeout(r, 50));

		// No new messages should have been sent
		expect(listener.messages).toHaveLength(0);
		expect(el.pause).not.toHaveBeenCalled();

		player.destroy();
		port1.close();
		port2.close();
	});
});

describe("SIMID Host — Malformed messages", () => {
	it("silently ignores malformed data", async () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const { port1, port2 } = new MessageChannel();
		const listener = portListener(port2);
		const sessionId = "test-session";

		const host = createSimidHost(
			player,
			port1,
			{ policy: defaultPolicy, handshakeTimeout: 2000 },
			makeAd(),
		);

		const startPromise = host.start();
		await doHandshake(port2, listener, sessionId);
		await startPromise;

		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		listener.messages.length = 0;

		// Send various malformed data — none should throw
		port2.postMessage("not an object");
		port2.postMessage(42);
		port2.postMessage(null);
		port2.postMessage({ garbage: true });
		port2.postMessage({ sessionId: "x" }); // missing fields

		// Give time for messages to be processed
		await new Promise((r) => setTimeout(r, 50));

		// No crash, no SIMID messages sent back
		expect(listener.messages).toHaveLength(0);

		errorSpy.mockRestore();
		host.destroy();
		player.destroy();
		port1.close();
		port2.close();
	});
});
