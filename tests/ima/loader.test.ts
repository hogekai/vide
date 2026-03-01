import { afterEach, describe, expect, it, vi } from "vitest";
import { getImaNamespace, loadImaSdk } from "../../src/ima/loader.js";

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	for (const s of document.head.querySelectorAll("script")) {
		s.remove();
	}
});

describe("getImaNamespace", () => {
	it("returns namespace from google.ima", () => {
		const mockNs = { AdDisplayContainer: vi.fn() };
		vi.stubGlobal("google", { ima: mockNs });

		expect(getImaNamespace()).toBe(mockNs);
	});

	it("returns null if google not present", () => {
		expect(getImaNamespace()).toBeNull();
	});

	it("returns null if google.ima not present", () => {
		vi.stubGlobal("google", {});
		expect(getImaNamespace()).toBeNull();
	});

	it("returns null if AdDisplayContainer constructor missing", () => {
		vi.stubGlobal("google", { ima: { AdsLoader: vi.fn() } });
		expect(getImaNamespace()).toBeNull();
	});
});

describe("loadImaSdk", () => {
	function resolveNextScript(): void {
		const scripts = document.head.querySelectorAll("script");
		const script = scripts[scripts.length - 1] as HTMLScriptElement;
		script.onload?.(new Event("load"));
	}

	it("returns existing namespace without loading script", async () => {
		const mockNs = { AdDisplayContainer: vi.fn() };
		vi.stubGlobal("google", { ima: mockNs });

		const result = await loadImaSdk(undefined, 5000);
		expect(result).toBe(mockNs);
		expect(document.head.querySelector("script")).toBeNull();
	});

	it("loads SDK script and returns namespace", async () => {
		const mockNs = { AdDisplayContainer: vi.fn() };

		const promise = loadImaSdk(undefined, 5000);

		const script = document.head.querySelector("script") as HTMLScriptElement;
		expect(script).not.toBeNull();
		expect(script.src).toContain("imasdk.googleapis.com");

		// Simulate SDK populating google.ima on load
		vi.stubGlobal("google", { ima: mockNs });
		resolveNextScript();

		const result = await promise;
		expect(result).toBe(mockNs);
	});

	it("uses custom SDK URL", async () => {
		const mockNs = { AdDisplayContainer: vi.fn() };

		const promise = loadImaSdk("https://custom.cdn.com/ima3.js", 5000);

		const script = document.head.querySelector("script") as HTMLScriptElement;
		expect(script.src).toBe("https://custom.cdn.com/ima3.js");

		vi.stubGlobal("google", { ima: mockNs });
		resolveNextScript();
		await promise;
	});

	it("throws if namespace not found after load", async () => {
		const promise = loadImaSdk(undefined, 5000);
		resolveNextScript();

		await expect(promise).rejects.toThrow(
			"IMA SDK namespace (google.ima) not found after script load",
		);
	});

	it("rejects if script fails to load", async () => {
		const promise = loadImaSdk(undefined, 5000);
		const script = document.head.querySelector("script") as HTMLScriptElement;
		script.onerror?.(new Event("error") as ErrorEvent);

		await expect(promise).rejects.toThrow("IMA SDK script load failed");
	});

	it("rejects on timeout", async () => {
		vi.useFakeTimers();
		const promise = loadImaSdk(undefined, 100);

		vi.advanceTimersByTime(100);

		await expect(promise).rejects.toThrow("IMA SDK script load timeout");
		vi.useRealTimers();
	});
});
