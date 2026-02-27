import { afterEach, describe, expect, it, vi } from "vitest";
import {
	getOmidNamespace,
	loadOmSdk,
	loadScript,
} from "../../src/omid/loader.js";

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	// Clean up any script tags we added
	for (const s of document.head.querySelectorAll("script")) {
		s.remove();
	}
});

describe("loadScript", () => {
	it("resolves when script onload fires", async () => {
		const promise = loadScript("https://cdn.example.com/om.js", 5000);
		const script = document.head.querySelector("script") as HTMLScriptElement;
		expect(script).not.toBeNull();
		expect(script.src).toBe("https://cdn.example.com/om.js");
		expect(script.async).toBe(true);

		script.onload?.(new Event("load"));
		await expect(promise).resolves.toBeUndefined();
	});

	it("rejects when script onerror fires", async () => {
		const promise = loadScript("https://cdn.example.com/bad.js", 5000);
		const script = document.head.querySelector("script") as HTMLScriptElement;

		script.onerror?.(new Event("error") as ErrorEvent);
		await expect(promise).rejects.toThrow("OM SDK script load failed");
	});

	it("removes script element on error", async () => {
		const promise = loadScript("https://cdn.example.com/bad.js", 5000);
		const script = document.head.querySelector("script") as HTMLScriptElement;

		script.onerror?.(new Event("error") as ErrorEvent);
		await promise.catch(() => {});

		expect(document.head.querySelector("script")).toBeNull();
	});

	it("rejects on timeout and removes script element", async () => {
		vi.useFakeTimers();
		const promise = loadScript("https://cdn.example.com/slow.js", 100);

		expect(document.head.querySelector("script")).not.toBeNull();

		vi.advanceTimersByTime(100);

		await expect(promise).rejects.toThrow("OM SDK script load timeout");
		expect(document.head.querySelector("script")).toBeNull();

		vi.useRealTimers();
	});

	it("appends script to document.head", () => {
		loadScript("https://cdn.example.com/om.js", 5000);
		const scripts = document.head.querySelectorAll("script");
		expect(scripts.length).toBe(1);
	});
});

describe("getOmidNamespace", () => {
	it("returns namespace from OmidSessionClient.default", () => {
		const mockNs = { AdSession: vi.fn() };
		vi.stubGlobal("OmidSessionClient", { default: mockNs });

		const result = getOmidNamespace();
		expect(result).toBe(mockNs);
	});

	it("returns namespace directly if no default property", () => {
		const mockNs = { AdSession: vi.fn() };
		vi.stubGlobal("OmidSessionClient", mockNs);

		const result = getOmidNamespace();
		expect(result).toBe(mockNs);
	});

	it("returns null if global not present", () => {
		expect(getOmidNamespace()).toBeNull();
	});

	it("returns null if AdSession constructor missing", () => {
		vi.stubGlobal("OmidSessionClient", { Partner: vi.fn() });
		expect(getOmidNamespace()).toBeNull();
	});
});

describe("loadOmSdk", () => {
	function resolveNextScript(): void {
		const scripts = document.head.querySelectorAll("script");
		const script = scripts[scripts.length - 1] as HTMLScriptElement;
		script.onload?.(new Event("load"));
	}

	it("loads service script then returns namespace", async () => {
		const mockNs = { AdSession: vi.fn() };
		vi.stubGlobal("OmidSessionClient", { default: mockNs });

		const promise = loadOmSdk(
			"https://cdn.example.com/omweb-v1.js",
			undefined,
			5000,
		);

		resolveNextScript();
		const result = await promise;
		expect(result).toBe(mockNs);
	});

	it("loads service script then session client in order", async () => {
		const mockNs = { AdSession: vi.fn() };
		const loadedUrls: string[] = [];

		const origAppendChild = document.head.appendChild.bind(document.head);
		vi.spyOn(document.head, "appendChild").mockImplementation((node: Node) => {
			const el = origAppendChild(node);
			if (node instanceof HTMLScriptElement) {
				loadedUrls.push(node.src);
				// Auto-resolve after tracking
				setTimeout(() => {
					node.onload?.(new Event("load"));
				}, 0);
			}
			return el;
		});

		vi.stubGlobal("OmidSessionClient", { default: mockNs });

		await loadOmSdk(
			"https://cdn.example.com/omweb-v1.js",
			"https://cdn.example.com/omid-session-client-v1.js",
			5000,
		);

		expect(loadedUrls).toEqual([
			"https://cdn.example.com/omweb-v1.js",
			"https://cdn.example.com/omid-session-client-v1.js",
		]);
	});

	it("throws if namespace not found after load", async () => {
		// No OmidSessionClient global set
		const promise = loadOmSdk(
			"https://cdn.example.com/omweb-v1.js",
			undefined,
			5000,
		);

		resolveNextScript();
		await expect(promise).rejects.toThrow(
			"OM SDK namespace not found after script load",
		);
	});

	it("rejects if service script fails to load", async () => {
		const promise = loadOmSdk(
			"https://cdn.example.com/bad.js",
			undefined,
			5000,
		);

		const script = document.head.querySelector("script") as HTMLScriptElement;
		script.onerror?.(new Event("error") as ErrorEvent);

		await expect(promise).rejects.toThrow("OM SDK script load failed");
	});
});
