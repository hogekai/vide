import type { OmidSessionClientNamespace } from "./types.js";

/**
 * Load a single script by URL via `<script>` injection.
 * Resolves on `onload`, rejects on `onerror` or timeout.
 */
export function loadScript(url: string, timeout: number): Promise<void> {
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = url;
		script.async = true;

		const timer = setTimeout(() => {
			script.remove();
			reject(new Error(`OM SDK script load timeout: ${url}`));
		}, timeout);

		script.onload = () => {
			clearTimeout(timer);
			resolve();
		};
		script.onerror = () => {
			clearTimeout(timer);
			script.remove();
			reject(new Error(`OM SDK script load failed: ${url}`));
		};

		document.head.appendChild(script);
	});
}

/**
 * Retrieve the OmidSessionClient namespace from the global scope.
 * The OM SDK exposes it as `OmidSessionClient['default']` or directly.
 */
export function getOmidNamespace(): OmidSessionClientNamespace | null {
	const global = globalThis as Record<string, unknown>;
	const client = global.OmidSessionClient as
		| Record<string, unknown>
		| undefined;
	if (!client) return null;

	const ns = ((client.default as Record<string, unknown>) ??
		client) as unknown as OmidSessionClientNamespace;
	if (typeof ns.AdSession !== "function") return null;
	return ns;
}

/**
 * Load the OM SDK scripts dynamically and return the session client namespace.
 *
 * Loads the service script first, then the session client script (if provided).
 * Returns the `OmidSessionClient` namespace from the global scope.
 */
export async function loadOmSdk(
	serviceScriptUrl: string,
	sessionClientUrl: string | undefined,
	timeout: number,
): Promise<OmidSessionClientNamespace> {
	const start = Date.now();

	await loadScript(serviceScriptUrl, timeout);

	if (sessionClientUrl) {
		const elapsed = Date.now() - start;
		const remaining = Math.max(timeout - elapsed, 1000);
		await loadScript(sessionClientUrl, remaining);
	}

	const ns = getOmidNamespace();
	if (!ns) {
		throw new Error("OM SDK namespace not found after script load");
	}

	return ns;
}
