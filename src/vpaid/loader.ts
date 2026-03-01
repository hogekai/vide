import type { VpaidAdUnit } from "./types.js";

export interface VpaidLoadResult {
	adUnit: VpaidAdUnit;
	destroy: () => void;
}

/**
 * Loads a VPAID JS file and calls `getVPAIDAd()` to obtain the ad unit.
 */
export function loadVpaidScript(
	url: string,
	timeout: number,
	useFriendlyIframe: boolean,
): Promise<VpaidLoadResult> {
	return useFriendlyIframe
		? loadViaFriendlyIframe(url, timeout)
		: loadViaDirect(url, timeout);
}

function loadViaFriendlyIframe(
	url: string,
	timeout: number,
): Promise<VpaidLoadResult> {
	return new Promise((resolve, reject) => {
		const iframe = document.createElement("iframe");
		iframe.style.cssText = "display:none;width:0;height:0;border:none;";
		document.body.appendChild(iframe);

		const timer = setTimeout(() => {
			iframe.remove();
			reject(new Error("VPAID script load timeout"));
		}, timeout);

		const iframeDoc = iframe.contentDocument;
		if (!iframeDoc) {
			clearTimeout(timer);
			iframe.remove();
			reject(new Error("VPAID: cannot access iframe document"));
			return;
		}

		const script = iframeDoc.createElement("script");
		script.src = url;

		script.onload = () => {
			clearTimeout(timer);
			const iframeWin = iframe.contentWindow as
				| (Window & { getVPAIDAd?: () => VpaidAdUnit })
				| null;
			if (!iframeWin?.getVPAIDAd) {
				iframe.remove();
				reject(new Error("VPAID: getVPAIDAd not found"));
				return;
			}
			try {
				const adUnit = iframeWin.getVPAIDAd();
				resolve({ adUnit, destroy: () => iframe.remove() });
			} catch (err) {
				iframe.remove();
				reject(new Error(`VPAID: getVPAIDAd() threw: ${err}`));
			}
		};

		script.onerror = () => {
			clearTimeout(timer);
			iframe.remove();
			reject(new Error("VPAID: script failed to load"));
		};

		iframeDoc.body.appendChild(script);
	});
}

function loadViaDirect(url: string, timeout: number): Promise<VpaidLoadResult> {
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = url;

		const timer = setTimeout(() => {
			script.remove();
			reject(new Error("VPAID script load timeout"));
		}, timeout);

		script.onload = () => {
			clearTimeout(timer);
			const win = window as Window & { getVPAIDAd?: () => VpaidAdUnit };
			if (!win.getVPAIDAd) {
				script.remove();
				reject(new Error("VPAID: getVPAIDAd not found"));
				return;
			}
			try {
				const adUnit = win.getVPAIDAd();
				win.getVPAIDAd = undefined;
				resolve({ adUnit, destroy: () => script.remove() });
			} catch (err) {
				script.remove();
				reject(new Error(`VPAID: getVPAIDAd() threw: ${err}`));
			}
		};

		script.onerror = () => {
			clearTimeout(timer);
			script.remove();
			reject(new Error("VPAID: script failed to load"));
		};

		document.body.appendChild(script);
	});
}
