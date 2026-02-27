import type { KeySystem } from "./types.js";

const FAIRPLAY: KeySystem = "com.apple.fps.1_0";

/** Minimal config for requestMediaKeySystemAccess probing. */
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
 * Detect the first supported key system from the given candidates.
 * Returns the KeySystem string, or null if none are supported.
 */
export async function detectKeySystem(
	candidates: KeySystem[],
): Promise<KeySystem | null> {
	for (const ks of candidates) {
		try {
			const config = ks === FAIRPLAY ? FAIRPLAY_PROBE_CONFIG : PROBE_CONFIG;
			await navigator.requestMediaKeySystemAccess(ks, config);
			return ks;
		} catch {
			// This key system is not supported; try next.
		}
	}
	return null;
}
