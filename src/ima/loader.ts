import type { ImaNamespace } from "./types.js";

const DEFAULT_SDK_URL = "https://imasdk.googleapis.com/js/sdkloader/ima3.js";

function loadScript(url: string, timeout: number): Promise<void> {
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = url;
		script.async = true;

		const timer = setTimeout(() => {
			script.remove();
			reject(new Error(`IMA SDK script load timeout: ${url}`));
		}, timeout);

		script.onload = () => {
			clearTimeout(timer);
			resolve();
		};
		script.onerror = () => {
			clearTimeout(timer);
			script.remove();
			reject(new Error(`IMA SDK script load failed: ${url}`));
		};

		document.head.appendChild(script);
	});
}

export function getImaNamespace(): ImaNamespace | null {
	const g = globalThis as Record<string, unknown>;
	const google = g.google as Record<string, unknown> | undefined;
	if (!google) return null;
	const ima = google.ima as ImaNamespace | undefined;
	if (!ima || typeof ima.AdDisplayContainer !== "function") return null;
	return ima;
}

export async function loadImaSdk(
	sdkUrl: string | undefined,
	timeout: number,
): Promise<ImaNamespace> {
	const existing = getImaNamespace();
	if (existing) return existing;

	await loadScript(sdkUrl ?? DEFAULT_SDK_URL, timeout);

	const ns = getImaNamespace();
	if (!ns) {
		throw new Error(
			"IMA SDK namespace (google.ima) not found after script load",
		);
	}
	return ns;
}
