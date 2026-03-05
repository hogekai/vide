import { describe, expect, it } from "vitest";
import {
	buildClearKeyJwk,
	buildClearKeyLicense,
	clearkeyDashConfig,
	clearkeyHlsConfig,
} from "../../src/drm/clearkey.js";

const KEYS = {
	dGVzdGtleWlkMTIzNDU2: "dGVzdGtleTEyMzQ1Njc4",
	YW5vdGhlcmtleWlkMTIz: "YW5vdGhlcmtleTEyMzQ1",
};

describe("buildClearKeyJwk", () => {
	it("produces valid JWK Set JSON with oct keys", () => {
		const jwk = buildClearKeyJwk(KEYS);
		const parsed = JSON.parse(jwk);

		expect(parsed.keys).toHaveLength(2);
		for (const key of parsed.keys) {
			expect(key.kty).toBe("oct");
			expect(key.kid).toBeDefined();
			expect(key.k).toBeDefined();
		}
	});

	it("maps keyId to kid and key to k", () => {
		const keys = { myKeyId: "myKey" };
		const parsed = JSON.parse(buildClearKeyJwk(keys));

		expect(parsed.keys[0]).toEqual({ kty: "oct", kid: "myKeyId", k: "myKey" });
	});
});

describe("buildClearKeyLicense", () => {
	it("returns Uint8Array of JWK Set JSON", () => {
		const license = buildClearKeyLicense(KEYS);
		expect(ArrayBuffer.isView(license)).toBe(true);

		const decoded = new TextDecoder().decode(license);
		const parsed = JSON.parse(decoded);
		expect(parsed.keys).toHaveLength(2);
	});
});

describe("clearkeyHlsConfig", () => {
	it("produces hls.js config with data URI licenseUrl", () => {
		const config = clearkeyHlsConfig({ keys: KEYS });

		expect(config.emeEnabled).toBe(true);
		const systems = config.drmSystems as Record<string, unknown>;
		const ck = systems.clearkey as { licenseUrl: string };
		expect(ck.licenseUrl).toMatch(/^data:application\/json;base64,/);

		// Decode and verify content.
		const b64 = ck.licenseUrl.replace("data:application/json;base64,", "");
		const parsed = JSON.parse(atob(b64));
		expect(parsed.keys).toHaveLength(2);
	});
});

describe("clearkeyDashConfig", () => {
	it("produces dash.js config with clearkeys map", () => {
		const config = clearkeyDashConfig({ keys: KEYS });

		const streaming = config.streaming as { protection: { data: { clearkey: { clearkeys: Record<string, string> } } } };
		expect(streaming.protection.data.clearkey.clearkeys).toEqual(KEYS);
	});
});
