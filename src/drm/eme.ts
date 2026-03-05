import type { MediaElement } from "../types.js";
import { buildClearKeyLicense } from "./clearkey.js";
import { probeConfigFor } from "./detect.js";
import type { KeySystem } from "./types.js";

export interface EmeOptions {
	keySystem: KeySystem;
	licenseUrl?: string | undefined;
	certificateUrl?: string | undefined;
	headers?: Record<string, string> | undefined;
	/** ClearKey: provide keys directly, bypassing license server fetch. */
	clearkeys?: Record<string, string> | undefined;
	prepareLicenseRequest?:
		| ((payload: Uint8Array) => Uint8Array | Promise<Uint8Array>)
		| undefined;
	processLicenseResponse?:
		| ((response: Uint8Array) => Uint8Array | Promise<Uint8Array>)
		| undefined;
	robustness?: string | undefined;
	encryptionScheme?: string | undefined;
	retry?:
		| {
				maxAttempts?: number | undefined;
				delayMs?: number | undefined;
				backoff?: number | undefined;
		  }
		| undefined;
	transformInitData?:
		| ((
				initData: Uint8Array,
				initDataType: string,
		  ) => Uint8Array | Promise<Uint8Array>)
		| undefined;
	onKeyStatus?: ((keyId: string, status: MediaKeyStatus) => void) | undefined;
}

/** Convert a BufferSource keyId to a hex string. */
function keyIdToHex(keyId: BufferSource): string {
	const bytes = new Uint8Array(
		keyId instanceof ArrayBuffer ? keyId : keyId.buffer,
	);
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

async function fetchWithRetry(
	url: string,
	init: RequestInit,
	retry:
		| {
				maxAttempts?: number | undefined;
				delayMs?: number | undefined;
				backoff?: number | undefined;
		  }
		| undefined,
): Promise<Response> {
	const maxAttempts = retry?.maxAttempts ?? 1;
	const delayMs = retry?.delayMs ?? 1000;
	const backoff = retry?.backoff ?? 2;

	let lastError: unknown;
	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		try {
			const res = await fetch(url, init);
			if (!res.ok) {
				throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
			}
			return res;
		} catch (err: unknown) {
			lastError = err;
			if (attempt < maxAttempts - 1) {
				await new Promise((r) => setTimeout(r, delayMs * backoff ** attempt));
			}
		}
	}
	throw lastError;
}

/**
 * Set up standalone EME (Encrypted Media Extensions) handling on a video element.
 * This enables DRM-protected MP4 playback without hls.js or dash.js.
 *
 * Returns a cleanup function that removes listeners and closes sessions.
 */
export function setupEme(
	videoElement: MediaElement,
	options: EmeOptions,
	onError: (err: Error) => void,
): () => void {
	let destroyed = false;
	const sessions: MediaKeySession[] = [];
	let mediaKeys: MediaKeys | null = null;

	const onEncrypted = (event: MediaEncryptedEvent): void => {
		if (destroyed) return;
		// If another library (hls.js / dash.js) set different mediaKeys, skip.
		if (videoElement.mediaKeys && videoElement.mediaKeys !== mediaKeys) return;
		if (!mediaKeys) return;
		if (!event.initData) return;

		const session = mediaKeys.createSession("temporary");
		sessions.push(session);

		(async () => {
			let initData: Uint8Array = new Uint8Array(event.initData as ArrayBuffer);
			if (options.transformInitData) {
				const transformed = await options.transformInitData(
					initData,
					event.initDataType,
				);
				initData = new Uint8Array(transformed);
			}
			await session.generateRequest(
				event.initDataType,
				initData.buffer as ArrayBuffer,
			);
		})().then(
			() => {
				if (destroyed) return;
			},
			(err: unknown) => {
				if (destroyed) return;
				onError(
					err instanceof Error ? err : new Error("generateRequest failed"),
				);
			},
		);

		session.addEventListener("message", (msgEvent: MediaKeyMessageEvent) => {
			if (destroyed) return;
			handleMessage(msgEvent, session, options, onError, () => destroyed);
		});

		session.addEventListener("keystatuseschange", () => {
			if (destroyed) return;
			for (const [keyId, status] of session.keyStatuses) {
				if (options.onKeyStatus) {
					options.onKeyStatus(keyIdToHex(keyId), status);
				} else if (status === "expired" || status === "internal-error") {
					// Fallback: emit error if no onKeyStatus handler is set.
					onError(new Error(`Key status: ${status}`));
				}
			}
		});
	};

	const config = probeConfigFor(
		options.keySystem,
		options.robustness,
		options.encryptionScheme,
	);

	navigator
		.requestMediaKeySystemAccess(options.keySystem, config)
		.then((access) => {
			if (destroyed) return;
			return access.createMediaKeys();
		})
		.then((keys) => {
			if (destroyed || !keys) return;
			mediaKeys = keys;

			// Fetch and set server certificate (FairPlay requires it; Widevine benefits from it).
			if (options.certificateUrl) {
				return fetchCertificate(
					options.certificateUrl,
					options.headers,
					options.retry,
					onError,
					() => destroyed,
				).then((cert) => {
					if (destroyed || !cert) return;
					return mediaKeys?.setServerCertificate(cert.buffer as ArrayBuffer);
				});
			}
		})
		.then(() => {
			if (destroyed || !mediaKeys) return;

			// Only attach if no other library has taken over.
			if (!videoElement.mediaKeys) {
				videoElement.setMediaKeys(mediaKeys);
			}

			(videoElement as HTMLMediaElement).addEventListener(
				"encrypted",
				onEncrypted,
			);
		})
		.catch((err: unknown) => {
			if (destroyed) return;
			onError(err instanceof Error ? err : new Error("EME setup failed"));
		});

	return () => {
		destroyed = true;
		(videoElement as HTMLMediaElement).removeEventListener(
			"encrypted",
			onEncrypted,
		);
		for (const session of sessions) {
			session.close().catch(() => {});
		}
	};
}

async function fetchCertificate(
	url: string,
	headers: Record<string, string> | undefined,
	retry:
		| {
				maxAttempts?: number | undefined;
				delayMs?: number | undefined;
				backoff?: number | undefined;
		  }
		| undefined,
	onError: (err: Error) => void,
	isDestroyed: () => boolean,
): Promise<Uint8Array | null> {
	try {
		const res = await fetchWithRetry(url, headers ? { headers } : {}, retry);
		const buf = await res.arrayBuffer();
		if (isDestroyed()) return null;
		return new Uint8Array(buf);
	} catch (err: unknown) {
		if (isDestroyed()) return null;
		onError(err instanceof Error ? err : new Error("Certificate fetch failed"));
		return null;
	}
}

function handleMessage(
	msgEvent: MediaKeyMessageEvent,
	session: MediaKeySession,
	options: EmeOptions,
	onError: (err: Error) => void,
	isDestroyed: () => boolean,
): void {
	const body = new Uint8Array(msgEvent.message);

	// ClearKey: generate license locally without network request.
	if (options.clearkeys) {
		const license = buildClearKeyLicense(options.clearkeys);
		session.update(license.buffer as ArrayBuffer).catch((err: unknown) => {
			if (isDestroyed()) return;
			onError(err instanceof Error ? err : new Error("ClearKey update failed"));
		});
		return;
	}

	if (!options.licenseUrl) {
		onError(new Error("No license URL configured"));
		return;
	}

	const licenseUrl = options.licenseUrl;

	Promise.resolve(
		options.prepareLicenseRequest ? options.prepareLicenseRequest(body) : body,
	)
		.then((payload) => {
			if (isDestroyed()) return;
			return fetchWithRetry(
				licenseUrl,
				{
					method: "POST",
					body: payload.buffer as ArrayBuffer,
					...(options.headers ? { headers: options.headers } : {}),
				},
				options.retry,
			);
		})
		.then((res) => {
			if (isDestroyed() || !res) return;
			return res.arrayBuffer();
		})
		.then((buf) => {
			if (isDestroyed() || !buf) return;
			const raw = new Uint8Array(buf);
			return Promise.resolve(
				options.processLicenseResponse
					? options.processLicenseResponse(raw)
					: raw,
			);
		})
		.then((license) => {
			if (isDestroyed() || !license) return;
			return session.update(license.buffer as ArrayBuffer);
		})
		.catch((err: unknown) => {
			if (isDestroyed()) return;
			onError(
				err instanceof Error ? err : new Error("License exchange failed"),
			);
		});
}
