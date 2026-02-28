import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type EmeOptions, setupEme } from "../../src/drm/eme.js";

// --- Mock factories ---

function mockSession(): MediaKeySession {
	const listeners = new Map<string, EventListener[]>();
	const keyStatuses = new Map<BufferSource, MediaKeyStatus>();
	return {
		keyStatuses,
		generateRequest: vi.fn().mockResolvedValue(undefined),
		update: vi.fn().mockResolvedValue(undefined),
		close: vi.fn().mockResolvedValue(undefined),
		addEventListener: vi.fn((type: string, handler: EventListener) => {
			if (!listeners.has(type)) listeners.set(type, []);
			listeners.get(type)!.push(handler);
		}),
		removeEventListener: vi.fn(),
		// Helper to fire events in tests.
		_fire(type: string, event: unknown) {
			for (const h of listeners.get(type) ?? []) {
				(h as (e: unknown) => void)(event);
			}
		},
	} as unknown as MediaKeySession & {
		_fire: (type: string, event: unknown) => void;
	};
}

function mockMediaKeys(session: MediaKeySession): MediaKeys {
	return {
		createSession: vi.fn().mockReturnValue(session),
		setServerCertificate: vi.fn().mockResolvedValue(true),
	} as unknown as MediaKeys;
}

function mockAccess(keys: MediaKeys): MediaKeySystemAccess {
	return {
		createMediaKeys: vi.fn().mockResolvedValue(keys),
		getConfiguration: vi.fn().mockReturnValue({}),
		keySystem: "com.widevine.alpha",
	} as unknown as MediaKeySystemAccess;
}

function makeVideo(): HTMLVideoElement & {
	_fire: (type: string, event: unknown) => void;
} {
	const listeners = new Map<string, EventListener[]>();
	const el = {
		mediaKeys: null as MediaKeys | null,
		setMediaKeys: vi.fn(function (
			this: { mediaKeys: MediaKeys | null },
			mk: MediaKeys | null,
		) {
			this.mediaKeys = mk;
			return Promise.resolve();
		}),
		addEventListener: vi.fn((type: string, handler: EventListener) => {
			if (!listeners.has(type)) listeners.set(type, []);
			listeners.get(type)!.push(handler);
		}),
		removeEventListener: vi.fn((type: string, handler: EventListener) => {
			const arr = listeners.get(type);
			if (arr) {
				const idx = arr.indexOf(handler);
				if (idx >= 0) arr.splice(idx, 1);
			}
		}),
		_fire(type: string, event: unknown) {
			for (const h of listeners.get(type) ?? []) {
				(h as (e: unknown) => void)(event);
			}
		},
	};
	return el as unknown as HTMLVideoElement & {
		_fire: (type: string, event: unknown) => void;
	};
}

/** Flush all microtasks / promise chains. */
async function flush(): Promise<void> {
	for (let i = 0; i < 10; i++) {
		await new Promise((r) => setTimeout(r, 0));
	}
}

const originalRMKSA = navigator.requestMediaKeySystemAccess;
const originalFetch = globalThis.fetch;

afterEach(() => {
	Object.defineProperty(navigator, "requestMediaKeySystemAccess", {
		value: originalRMKSA,
		writable: true,
		configurable: true,
	});
	globalThis.fetch = originalFetch;
});

describe("setupEme", () => {
	let session: MediaKeySession & {
		_fire: (type: string, event: unknown) => void;
	};
	let keys: MediaKeys;
	let access: MediaKeySystemAccess;
	let video: HTMLVideoElement & {
		_fire: (type: string, event: unknown) => void;
	};

	beforeEach(() => {
		session = mockSession() as MediaKeySession & {
			_fire: (type: string, event: unknown) => void;
		};
		keys = mockMediaKeys(session);
		access = mockAccess(keys);
		video = makeVideo();

		Object.defineProperty(navigator, "requestMediaKeySystemAccess", {
			value: vi.fn().mockResolvedValue(access),
			writable: true,
			configurable: true,
		});

		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			arrayBuffer: () => Promise.resolve(new ArrayBuffer(16)),
		});
	});

	it("Widevine: encrypted event triggers license fetch and session.update", async () => {
		const onError = vi.fn();
		const opts: EmeOptions = {
			keySystem: "com.widevine.alpha",
			licenseUrl: "https://lic.example.com",
		};

		setupEme(video, opts, onError);
		await flush();

		// setupEme sets mediaKeys on the video element.
		expect(video.setMediaKeys).toHaveBeenCalledWith(keys);

		// Fire encrypted event
		video._fire("encrypted", {
			initDataType: "cenc",
			initData: new ArrayBuffer(16),
		} as MediaEncryptedEvent);

		await flush();

		// The handler should have created a session and fetched a license
		expect(keys.createSession as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
			"temporary",
		);
		expect(session.generateRequest).toHaveBeenCalledWith(
			"cenc",
			expect.any(ArrayBuffer),
		);

		// Fire the message event from the session
		session._fire("message", {
			message: new ArrayBuffer(8),
		} as MediaKeyMessageEvent);

		await flush();

		expect(globalThis.fetch).toHaveBeenCalledWith("https://lic.example.com", {
			method: "POST",
			body: expect.any(ArrayBuffer),
		});
		expect(session.update).toHaveBeenCalledWith(expect.any(ArrayBuffer));
		expect(onError).not.toHaveBeenCalled();
	});

	it("skips encrypted handler when hls.js/dash.js already set mediaKeys", async () => {
		const onError = vi.fn();
		const opts: EmeOptions = {
			keySystem: "com.widevine.alpha",
			licenseUrl: "https://lic.example.com",
		};

		// Simulate hls.js setting mediaKeys before setupEme runs.
		const hlsKeys = {} as MediaKeys;
		(video as unknown as { mediaKeys: MediaKeys }).mediaKeys = hlsKeys;

		setupEme(video, opts, onError);
		await flush();

		// setupEme should NOT have called setMediaKeys (guard: if !videoElement.mediaKeys).
		expect(video.setMediaKeys).not.toHaveBeenCalled();

		// Fire encrypted event — handler should skip.
		video._fire("encrypted", {
			initDataType: "cenc",
			initData: new ArrayBuffer(16),
		} as MediaEncryptedEvent);

		await flush();

		expect(
			keys.createSession as ReturnType<typeof vi.fn>,
		).not.toHaveBeenCalled();
		expect(onError).not.toHaveBeenCalled();
	});

	it("license fetch failure calls onError", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 403,
			statusText: "Forbidden",
			arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
		});

		const onError = vi.fn();
		const opts: EmeOptions = {
			keySystem: "com.widevine.alpha",
			licenseUrl: "https://lic.example.com",
		};

		setupEme(video, opts, onError);
		await flush();

		video._fire("encrypted", {
			initDataType: "cenc",
			initData: new ArrayBuffer(16),
		} as MediaEncryptedEvent);

		await flush();

		session._fire("message", {
			message: new ArrayBuffer(8),
		} as MediaKeyMessageEvent);

		await flush();

		expect(onError).toHaveBeenCalledWith(
			expect.objectContaining({ message: expect.stringContaining("403") }),
		);
	});

	it("FairPlay: fetches certificate and calls setServerCertificate", async () => {
		const certBytes = new ArrayBuffer(32);
		globalThis.fetch = vi.fn().mockImplementation((url: string) => {
			if (url.includes("cert")) {
				return Promise.resolve({
					ok: true,
					arrayBuffer: () => Promise.resolve(certBytes),
				});
			}
			return Promise.resolve({
				ok: true,
				arrayBuffer: () => Promise.resolve(new ArrayBuffer(16)),
			});
		});

		const onError = vi.fn();
		const opts: EmeOptions = {
			keySystem: "com.apple.fps.1_0",
			licenseUrl: "https://fp.example.com/license",
			certificateUrl: "https://fp.example.com/cert",
		};

		setupEme(video, opts, onError);
		await flush();

		expect(globalThis.fetch).toHaveBeenCalledWith(
			"https://fp.example.com/cert",
			{},
		);
		expect(
			keys.setServerCertificate as ReturnType<typeof vi.fn>,
		).toHaveBeenCalledWith(expect.any(ArrayBuffer));
		expect(onError).not.toHaveBeenCalled();
	});

	it("FairPlay: certificate fetch failure calls onError", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 404,
			statusText: "Not Found",
			arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
		});

		const onError = vi.fn();
		const opts: EmeOptions = {
			keySystem: "com.apple.fps.1_0",
			licenseUrl: "https://fp.example.com/license",
			certificateUrl: "https://fp.example.com/cert",
		};

		setupEme(video, opts, onError);
		await flush();

		expect(onError).toHaveBeenCalledWith(
			expect.objectContaining({ message: expect.stringContaining("404") }),
		);
	});

	it("does not act on encrypted event after destroy", async () => {
		const onError = vi.fn();
		const opts: EmeOptions = {
			keySystem: "com.widevine.alpha",
			licenseUrl: "https://lic.example.com",
		};

		const cleanup = setupEme(video, opts, onError);
		await flush();

		cleanup();

		video._fire("encrypted", {
			initDataType: "cenc",
			initData: new ArrayBuffer(16),
		} as MediaEncryptedEvent);

		await flush();

		expect(
			keys.createSession as ReturnType<typeof vi.fn>,
		).not.toHaveBeenCalled();
		expect(onError).not.toHaveBeenCalled();
	});

	it("prepareLicenseRequest and processLicenseResponse hooks are called", async () => {
		const prepareLicenseRequest = vi.fn((payload: Uint8Array) => {
			const modified = new Uint8Array(payload.length + 1);
			modified.set(payload);
			modified[payload.length] = 0xff;
			return modified;
		});
		const processLicenseResponse = vi.fn((response: Uint8Array) => {
			return response.slice(0, response.length);
		});

		const onError = vi.fn();
		const opts: EmeOptions = {
			keySystem: "com.widevine.alpha",
			licenseUrl: "https://lic.example.com",
			prepareLicenseRequest,
			processLicenseResponse,
		};

		setupEme(video, opts, onError);
		await flush();

		video._fire("encrypted", {
			initDataType: "cenc",
			initData: new ArrayBuffer(16),
		} as MediaEncryptedEvent);

		await flush();

		session._fire("message", {
			message: new ArrayBuffer(8),
		} as MediaKeyMessageEvent);

		await flush();

		expect(prepareLicenseRequest).toHaveBeenCalledWith(expect.any(Uint8Array));
		expect(processLicenseResponse).toHaveBeenCalledWith(expect.any(Uint8Array));
		expect(session.update).toHaveBeenCalled();
		expect(onError).not.toHaveBeenCalled();
	});

	it("key status 'expired' triggers onError", async () => {
		const onError = vi.fn();
		const opts: EmeOptions = {
			keySystem: "com.widevine.alpha",
			licenseUrl: "https://lic.example.com",
		};

		setupEme(video, opts, onError);
		await flush();

		video._fire("encrypted", {
			initDataType: "cenc",
			initData: new ArrayBuffer(16),
		} as MediaEncryptedEvent);

		await flush();

		// Simulate key status change to "expired".
		const keyId = new Uint8Array([1, 2, 3]);
		(session.keyStatuses as Map<BufferSource, MediaKeyStatus>).set(
			keyId,
			"expired",
		);

		session._fire("keystatuseschange", {});

		expect(onError).toHaveBeenCalledWith(
			expect.objectContaining({ message: "Key status: expired" }),
		);
	});
});
