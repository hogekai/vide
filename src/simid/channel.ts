export interface SimidChannel {
	readonly iframe: HTMLIFrameElement;
	readonly port: MessagePort;
	show(): void;
	destroy(): void;
}

/**
 * Create a sandboxed iframe and MessageChannel for SIMID communication.
 * The iframe starts hidden; call show() after handshake completes.
 */
export function createSimidChannel(
	creativeUrl: string,
	container: HTMLElement,
): SimidChannel {
	const iframe = document.createElement("iframe");
	iframe.sandbox.add("allow-scripts", "allow-same-origin");
	iframe.style.cssText =
		"position:absolute;top:0;left:0;width:100%;height:100%;border:none;display:none;pointer-events:auto;";
	iframe.src = creativeUrl;

	const channel = new MessageChannel();
	const port = channel.port1;

	const onLoad = (): void => {
		iframe.contentWindow?.postMessage("simid:connect", "*", [channel.port2]);
	};
	iframe.addEventListener("load", onLoad, { once: true });

	container.appendChild(iframe);

	let destroyed = false;

	return {
		iframe,
		port,
		show() {
			if (!destroyed) {
				iframe.style.display = "";
			}
		},
		destroy() {
			if (destroyed) return;
			destroyed = true;
			iframe.removeEventListener("load", onLoad);
			iframe.remove();
			port.close();
		},
	};
}
