import { describe, expect, it, vi } from "vitest";
import { createPlayer } from "../src/core.js";
import { dash } from "../src/dash/index.js";
import { drm } from "../src/drm/index.js";
import { hls } from "../src/hls/index.js";
import { ssai } from "../src/ssai/index.js";
import { ui } from "../src/ui/index.js";
import { vast } from "../src/vast/index.js";
import { vmap } from "../src/vmap/index.js";
// --- hls.js mock ---
vi.mock("hls.js", () => {
	const mockInstance = {
		attachMedia: vi.fn(),
		loadSource: vi.fn(),
		destroy: vi.fn(),
		on: vi.fn(),
	};
	const MockHls = vi.fn(() => mockInstance) as ReturnType<typeof vi.fn> & {
		isSupported: ReturnType<typeof vi.fn>;
		Events: { ERROR: string };
	};
	MockHls.isSupported = vi.fn(() => true);
	MockHls.Events = { ERROR: "hlsError" };
	return { default: MockHls };
});

// --- dashjs mock ---
vi.mock("dashjs", () => ({
	default: {
		MediaPlayer: Object.assign(
			() => ({
				create: () => ({
					initialize: vi.fn(),
					updateSettings: vi.fn(),
					on: vi.fn(),
					destroy: vi.fn(),
				}),
			}),
			{ events: { ERROR: "error" } },
		),
	},
}));

// --- VAST parser mock (avoid network calls) ---
vi.mock("../src/vast/parser.js", async (importOriginal) => {
	const actual = await importOriginal<typeof import("../src/vast/parser.js")>();
	return {
		...actual,
		fetchVast: vi.fn().mockRejectedValue(new Error("no network in test")),
		resolveVast: vi.fn().mockRejectedValue(new Error("no network in test")),
	};
});

function makeVideo(): HTMLVideoElement {
	const el = document.createElement("video");
	el.play = vi.fn().mockResolvedValue(undefined);
	el.pause = vi.fn();
	el.load = vi.fn();
	el.canPlayType = vi.fn().mockReturnValue("");
	return el;
}

// === Test 1: setup() completes within budget ===

describe("setup() completes within budget", () => {
	const BUDGET_MS = 50;

	it("core: createPlayer completes within budget", () => {
		const el = makeVideo();
		const start = performance.now();
		const player = createPlayer(el);
		const elapsed = performance.now() - start;
		expect(elapsed).toBeLessThan(BUDGET_MS);
		expect(player.state).toBe("idle");
		player.destroy();
	});

	it("hls plugin setup completes within budget", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const plugin = hls();
		const start = performance.now();
		player.use(plugin);
		const elapsed = performance.now() - start;
		expect(elapsed).toBeLessThan(BUDGET_MS);
		player.destroy();
	});

	it("dash plugin setup completes within budget", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const plugin = dash();
		const start = performance.now();
		player.use(plugin);
		const elapsed = performance.now() - start;
		expect(elapsed).toBeLessThan(BUDGET_MS);
		player.destroy();
	});

	it("drm plugin setup completes within budget", () => {
		// Mock requestMediaKeySystemAccess so detection does not block
		Object.defineProperty(navigator, "requestMediaKeySystemAccess", {
			value: vi.fn().mockRejectedValue(new Error("not supported")),
			writable: true,
			configurable: true,
		});
		const el = makeVideo();
		const player = createPlayer(el);
		const plugin = drm({
			widevine: { licenseUrl: "https://example.com/license" },
		});
		const start = performance.now();
		player.use(plugin);
		const elapsed = performance.now() - start;
		expect(elapsed).toBeLessThan(BUDGET_MS);
		player.destroy();
	});

	it("vast plugin setup completes within budget", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const plugin = vast({ tagUrl: "https://example.com/vast.xml" });
		const start = performance.now();
		player.use(plugin);
		const elapsed = performance.now() - start;
		expect(elapsed).toBeLessThan(BUDGET_MS);
		player.destroy();
	});

	it("vmap plugin setup completes within budget", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const plugin = vmap({ url: "https://example.com/vmap.xml" });
		const start = performance.now();
		player.use(plugin);
		const elapsed = performance.now() - start;
		expect(elapsed).toBeLessThan(BUDGET_MS);
		player.destroy();
	});

	it("ui plugin setup completes within budget", () => {
		const el = makeVideo();
		const player = createPlayer(el);
		const container = document.createElement("div");
		const plugin = ui({ container });
		const start = performance.now();
		player.use(plugin);
		const elapsed = performance.now() - start;
		expect(elapsed).toBeLessThan(BUDGET_MS);
		player.destroy();
	});
});

// === Test 2: destroy() removes all event listeners ===

describe("destroy() removes all event listeners", () => {
	it("every addEventListener call has a matching removeEventListener after destroy (core)", () => {
		const el = makeVideo();
		const addCalls: string[] = [];
		const removeCalls: string[] = [];

		const origAdd = el.addEventListener.bind(el);
		const origRemove = el.removeEventListener.bind(el);

		el.addEventListener = vi.fn((type: string, ...args: unknown[]) => {
			addCalls.push(type);
			origAdd(type, ...(args as [any, any]));
		}) as any;

		el.removeEventListener = vi.fn((type: string, ...args: unknown[]) => {
			removeCalls.push(type);
			origRemove(type, ...(args as [any, any]));
		}) as any;

		const player = createPlayer(el);
		player.destroy();

		// Every event type that was added should also be removed
		for (const type of addCalls) {
			expect(removeCalls).toContain(type);
		}

		// Count: each type should have equal add and remove counts
		const addCounts = new Map<string, number>();
		const removeCounts = new Map<string, number>();

		for (const t of addCalls) {
			addCounts.set(t, (addCounts.get(t) ?? 0) + 1);
		}
		for (const t of removeCalls) {
			removeCounts.set(t, (removeCounts.get(t) ?? 0) + 1);
		}

		for (const [type, count] of addCounts) {
			expect(removeCounts.get(type)).toBe(count);
		}
	});

	it("every addEventListener call has a matching removeEventListener after destroy (with hls plugin)", () => {
		const el = makeVideo();
		const addCalls: string[] = [];
		const removeCalls: string[] = [];

		const origAdd = el.addEventListener.bind(el);
		const origRemove = el.removeEventListener.bind(el);

		el.addEventListener = vi.fn((type: string, ...args: unknown[]) => {
			addCalls.push(type);
			origAdd(type, ...(args as [any, any]));
		}) as any;

		el.removeEventListener = vi.fn((type: string, ...args: unknown[]) => {
			removeCalls.push(type);
			origRemove(type, ...(args as [any, any]));
		}) as any;

		const player = createPlayer(el);
		player.use(hls());
		player.destroy();

		for (const type of addCalls) {
			expect(removeCalls).toContain(type);
		}

		const addCounts = new Map<string, number>();
		const removeCounts = new Map<string, number>();

		for (const t of addCalls) {
			addCounts.set(t, (addCounts.get(t) ?? 0) + 1);
		}
		for (const t of removeCalls) {
			removeCounts.set(t, (removeCounts.get(t) ?? 0) + 1);
		}

		for (const [type, count] of addCounts) {
			expect(removeCounts.get(type)).toBe(count);
		}
	});

	it("every addEventListener call has a matching removeEventListener after destroy (with ui plugin)", () => {
		const el = makeVideo();
		const addCalls: string[] = [];
		const removeCalls: string[] = [];

		const origAdd = el.addEventListener.bind(el);
		const origRemove = el.removeEventListener.bind(el);

		el.addEventListener = vi.fn((type: string, ...args: unknown[]) => {
			addCalls.push(type);
			origAdd(type, ...(args as [any, any]));
		}) as any;

		el.removeEventListener = vi.fn((type: string, ...args: unknown[]) => {
			removeCalls.push(type);
			origRemove(type, ...(args as [any, any]));
		}) as any;

		const container = document.createElement("div");
		const player = createPlayer(el);
		player.use(ui({ container }));
		player.destroy();

		for (const type of addCalls) {
			expect(removeCalls).toContain(type);
		}

		const addCounts = new Map<string, number>();
		const removeCounts = new Map<string, number>();

		for (const t of addCalls) {
			addCounts.set(t, (addCounts.get(t) ?? 0) + 1);
		}
		for (const t of removeCalls) {
			removeCounts.set(t, (removeCounts.get(t) ?? 0) + 1);
		}

		for (const [type, count] of addCounts) {
			expect(removeCounts.get(type)).toBe(count);
		}
	});
});

// === Test 3: no memory leak after create/destroy cycles ===

describe("no memory leak after create/destroy cycles", () => {
	it("100 create/destroy cycles with core complete without error", () => {
		for (let i = 0; i < 100; i++) {
			const el = makeVideo();
			const player = createPlayer(el);
			el.dispatchEvent(new Event("loadstart"));
			el.dispatchEvent(new Event("canplay"));
			player.destroy();
		}
	});

	it("100 create/destroy cycles with hls plugin complete without error", () => {
		for (let i = 0; i < 100; i++) {
			const el = makeVideo();
			const player = createPlayer(el);
			player.use(hls());
			player.destroy();
		}
	});

	it("100 create/destroy cycles with ui plugin complete without error", () => {
		for (let i = 0; i < 100; i++) {
			const el = makeVideo();
			const container = document.createElement("div");
			const player = createPlayer(el);
			player.use(ui({ container }));
			player.destroy();
		}
	});

	it("100 create/destroy cycles with vast plugin complete without error", () => {
		for (let i = 0; i < 100; i++) {
			const el = makeVideo();
			const player = createPlayer(el);
			player.use(vast({ tagUrl: "https://example.com/vast.xml" }));
			player.destroy();
		}
	});

	it("100 create/destroy cycles with multiple plugins complete without error", () => {
		// Mock requestMediaKeySystemAccess for drm plugin
		Object.defineProperty(navigator, "requestMediaKeySystemAccess", {
			value: vi.fn().mockRejectedValue(new Error("not supported")),
			writable: true,
			configurable: true,
		});

		for (let i = 0; i < 100; i++) {
			const el = makeVideo();
			const container = document.createElement("div");
			const player = createPlayer(el);
			player.use(hls());
			player.use(
				drm({
					widevine: { licenseUrl: "https://example.com/license" },
				}),
			);
			player.use(ssai());
			player.use(ui({ container }));
			player.destroy();
		}
	});
});
