import type { KeySystem } from "./types.js";

const FAIRPLAY: KeySystem = "com.apple.fps.1_0";

/** A candidate key system with optional robustness and encryption scheme. */
export interface KeySystemCandidate {
	keySystem: KeySystem;
	robustness?: string | undefined;
	encryptionScheme?: string | undefined;
}

/** Select the appropriate probe config for a key system. */
export function probeConfigFor(
	ks: KeySystem,
	robustness?: string,
	encryptionScheme?: string,
): MediaKeySystemConfiguration[] {
	const initDataTypes = ks === FAIRPLAY ? ["sinf"] : ["cenc"];
	const capability: MediaKeySystemMediaCapability = {
		contentType: 'video/mp4;codecs="avc1.42E01E"',
	};
	if (robustness) (capability as Record<string, unknown>).robustness = robustness;
	if (encryptionScheme) (capability as Record<string, unknown>).encryptionScheme = encryptionScheme;
	return [{ initDataTypes, videoCapabilities: [capability] }];
}

function normalizeCandidate(
	c: KeySystem | KeySystemCandidate,
): KeySystemCandidate {
	return typeof c === "string" ? { keySystem: c } : c;
}

/**
 * Detect the first supported key system from the given candidates.
 * Returns the KeySystem string, or null if none are supported.
 *
 * Candidates can be plain KeySystem strings (backward compatible) or
 * KeySystemCandidate objects with optional robustness/encryptionScheme.
 */
export async function detectKeySystem(
	candidates: (KeySystem | KeySystemCandidate)[],
): Promise<KeySystem | null> {
	for (const raw of candidates) {
		const { keySystem, robustness, encryptionScheme } =
			normalizeCandidate(raw);
		try {
			const config = probeConfigFor(keySystem, robustness, encryptionScheme);
			await navigator.requestMediaKeySystemAccess(keySystem, config);
			return keySystem;
		} catch {
			// This key system is not supported; try next.
		}
	}
	return null;
}

/**
 * Query support for multiple key systems.
 * Returns a Map with each key system mapped to a boolean indicating support.
 */
export async function queryDrmSupport(
	keySystems: KeySystem[],
): Promise<Map<KeySystem, boolean>> {
	const results = new Map<KeySystem, boolean>();
	for (const ks of keySystems) {
		try {
			const config = probeConfigFor(ks);
			await navigator.requestMediaKeySystemAccess(ks, config);
			results.set(ks, true);
		} catch {
			results.set(ks, false);
		}
	}
	return results;
}
