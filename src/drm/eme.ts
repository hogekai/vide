import type { MediaElement } from "../types.js";
import type { KeySystem } from "./types.js";

export interface EmeOptions {
	keySystem: KeySystem;
	licenseUrl: string;
	certificateUrl?: string | undefined;
	headers?: Record<string, string> | undefined;
	prepareLicenseRequest?:
		| ((payload: Uint8Array) => Uint8Array | Promise<Uint8Array>)
		| undefined;
	processLicenseResponse?:
		| ((response: Uint8Array) => Uint8Array | Promise<Uint8Array>)
		| undefined;
}

const FAIRPLAY: KeySystem = "com.apple.fps.1_0";

const PROBE_CONFIG: MediaKeySystemConfiguration[] = [
	{
		initDataTypes: ["cenc"],
		videoCapabilities: [{ contentType: 'video/mp4;codecs="avc1.42E01E"' }],
	},
];

const FAIRPLAY_PROBE_CONFIG: MediaKeySystemConfiguration[] = [
	{
		initDataTypes: ["sinf"],
		videoCapabilities: [{ contentType: 'video/mp4;codecs="avc1.42E01E"' }],
	},
];

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

		session.generateRequest(event.initDataType, event.initData).then(
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
			for (const [, status] of session.keyStatuses) {
				if (status === "expired" || status === "internal-error") {
					onError(new Error(`Key status: ${status}`));
				}
			}
		});
	};

	const config =
		options.keySystem === FAIRPLAY ? FAIRPLAY_PROBE_CONFIG : PROBE_CONFIG;

	navigator
		.requestMediaKeySystemAccess(options.keySystem, config)
		.then((access) => {
			if (destroyed) return;
			return access.createMediaKeys();
		})
		.then((keys) => {
			if (destroyed || !keys) return;
			mediaKeys = keys;

			// FairPlay: fetch and set server certificate.
			if (options.keySystem === FAIRPLAY && options.certificateUrl) {
				return fetchCertificate(
					options.certificateUrl,
					options.headers,
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
	onError: (err: Error) => void,
	isDestroyed: () => boolean,
): Promise<Uint8Array | null> {
	try {
		const res = await fetch(url, headers ? { headers } : {});
		if (!res.ok) {
			throw new Error(
				`Certificate fetch failed: ${res.status} ${res.statusText}`,
			);
		}
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

	Promise.resolve(
		options.prepareLicenseRequest ? options.prepareLicenseRequest(body) : body,
	)
		.then((payload) => {
			if (isDestroyed()) return;
			return fetch(options.licenseUrl, {
				method: "POST",
				body: payload.buffer as ArrayBuffer,
				...(options.headers ? { headers: options.headers } : {}),
			});
		})
		.then((res) => {
			if (isDestroyed() || !res) return;
			if (!res.ok) {
				throw new Error(
					`License request failed: ${res.status} ${res.statusText}`,
				);
			}
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
