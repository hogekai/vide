import { ERR_IMA_SDK_LOAD } from "../errors.js";
import type { PlayerState, Plugin, PluginPlayer } from "../types.js";
import { createImaBridge } from "./bridge.js";
import { loadImaSdk } from "./loader.js";
import type {
	ImaAdErrorEvent,
	ImaAdsManager,
	ImaAdsManagerLoadedEvent,
	ImaNamespace,
	ImaPluginOptions,
} from "./types.js";

export type { ImaPluginOptions } from "./types.js";

const DEFAULT_TIMEOUT = 6000;

function debug(...args: unknown[]): void {
	console.debug("[vide:ima]", ...args);
}

export function ima(options: ImaPluginOptions): Plugin {
	return {
		name: "ima",
		setup(player: PluginPlayer): () => void {
			let aborted = false;
			let adsManagerRef: ImaAdsManager | null = null;
			let bridgeCleanup: (() => void) | null = null;
			let contentEndedHandler: (() => void) | null = null;
			let gestureCleanup: (() => void) | null = null;
			let imaOverlay: HTMLElement | null = null;

			const timeout = options.timeout ?? DEFAULT_TIMEOUT;

			debug("setup called, player.state =", player.state);

			async function init(): Promise<void> {
				if (aborted) return;
				debug("init() start");

				// Load IMA SDK — fails gracefully on ad blocker
				let sdk: ImaNamespace;
				try {
					debug("loading IMA SDK...");
					sdk = await loadImaSdk(options.sdkUrl, timeout);
					debug("IMA SDK loaded successfully");
				} catch (err) {
					if (aborted) return;
					debug("IMA SDK load FAILED:", err);
					player.emit("ad:error", {
						error: err instanceof Error ? err : new Error(String(err)),
						source: "ima",
					});
					player.emit("error", {
						code: ERR_IMA_SDK_LOAD,
						message: err instanceof Error ? err.message : "IMA SDK load failed",
						source: "ima",
					});
					return;
				}

				if (aborted) return;

				// Locale
				if (options.locale) {
					sdk.settings.setLocale(options.locale);
				}

				// Enable skippable ads on mobile (iOS 10+).
				// Without this, IMA reuses the content <video> for ads,
				// which does not support skippable video ad types.
				sdk.settings.setDisableCustomPlaybackForIOS10Plus(true);

				// Create internal overlay div for IMA inside the user-provided container
				// (same pattern as UI plugin creating div.vide-ui)
				imaOverlay = document.createElement("div");
				imaOverlay.setAttribute("data-vide-ima", "");
				imaOverlay.style.cssText =
					"position:absolute;top:0;left:0;width:100%;height:100%;z-index:5;";
				options.adContainer.appendChild(imaOverlay);
				const adContainerEl = imaOverlay;
				debug(
					"ad container ready, size:",
					adContainerEl.clientWidth,
					"x",
					adContainerEl.clientHeight,
				);

				// IMA setup chain
				const adDisplayContainer = new sdk.AdDisplayContainer(
					adContainerEl,
					player.el,
				);
				const adsLoader = new sdk.AdsLoader(adDisplayContainer);
				debug("AdDisplayContainer + AdsLoader created");

				let adContainerInitialized = false;
				let pendingStartAds: (() => void) | null = null;

				function startAds(adsManager: ImaAdsManager): void {
					const w = player.el.clientWidth || adContainerEl.clientWidth || 640;
					const h = player.el.clientHeight || adContainerEl.clientHeight || 360;
					const viewMode = document.fullscreenElement
						? sdk.ViewMode.FULLSCREEN
						: sdk.ViewMode.NORMAL;
					debug("adsManager.init()", w, "x", h, "viewMode:", viewMode);
					adsManager.init(w, h, viewMode);

					if (options.autoplayAdBreaks !== false) {
						debug("adsManager.start()");
						adsManager.start();
					} else {
						debug("autoplayAdBreaks is false, skipping start()");
					}
				}

				function initializeAdContainer(source: string): void {
					if (adContainerInitialized) {
						debug("initializeAdContainer() skipped (already initialized)");
						return;
					}
					adContainerInitialized = true;
					debug("adDisplayContainer.initialize() called from:", source);
					adDisplayContainer.initialize();

					// If adsManager was ready before gesture, start it now
					if (pendingStartAds) {
						debug("starting deferred adsManager");
						pendingStartAds();
						pendingStartAds = null;
					}
				}

				function onGesture(e: Event): void {
					debug(
						"gesture detected:",
						e.type,
						"on",
						(e.target as HTMLElement)?.tagName,
					);
					initializeAdContainer(`gesture:${e.type}`);
				}

				// Listen on both the ad overlay and the video element
				adContainerEl.addEventListener("click", onGesture, { once: true });
				adContainerEl.addEventListener("touchend", onGesture, {
					once: true,
				});
				player.el.addEventListener("click", onGesture, { once: true });
				player.el.addEventListener("touchend", onGesture, { once: true });
				debug("gesture listeners attached to adContainer + video element");

				gestureCleanup = () => {
					adContainerEl.removeEventListener("click", onGesture);
					adContainerEl.removeEventListener("touchend", onGesture);
					player.el.removeEventListener("click", onGesture);
					player.el.removeEventListener("touchend", onGesture);
				};

				// ADS_MANAGER_LOADED
				adsLoader.addEventListener(
					sdk.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
					(event: unknown) => {
						if (aborted) return;
						debug("ADS_MANAGER_LOADED fired");
						const loaded = event as ImaAdsManagerLoadedEvent;

						const renderingSettings = new sdk.AdsRenderingSettings();
						if (options.configureRenderingSettings) {
							options.configureRenderingSettings(renderingSettings);
						}

						const adsManager = loaded.getAdsManager(
							player.el,
							renderingSettings,
						);
						adsManagerRef = adsManager;
						debug("adsManager obtained");

						// AD_ERROR on AdsManager
						adsManager.addEventListener(
							sdk.AdErrorEvent.Type.AD_ERROR,
							(errorEvent: unknown) => {
								const e = errorEvent as ImaAdErrorEvent;
								const imaError = e.getError();
								debug(
									"AD_ERROR (adsManager):",
									imaError.getMessage(),
									"code:",
									imaError.getErrorCode(),
								);
								player.emit("ad:error", {
									error: new Error(imaError.getMessage()),
									source: "ima",
									vastErrorCode: imaError.getErrorCode(),
								});
							},
						);

						// Event bridge
						bridgeCleanup = createImaBridge({
							player,
							adsManager,
							ima: sdk,
						});

						// Expose via pluginData
						player.setPluginData("ima", {
							adsManager,
							adsLoader,
							adDisplayContainer,
							requestAds(adTagUrl?: string) {
								const req = new sdk.AdsRequest();
								req.adTagUrl = adTagUrl ?? options.adTagUrl;
								req.linearAdSlotWidth =
									player.el.clientWidth || adContainerEl.clientWidth || 640;
								req.linearAdSlotHeight =
									player.el.clientHeight || adContainerEl.clientHeight || 360;
								req.nonLinearAdSlotWidth =
									player.el.clientWidth || adContainerEl.clientWidth || 640;
								req.nonLinearAdSlotHeight =
									player.el.clientHeight || adContainerEl.clientHeight || 360;
								req.setAdWillAutoPlay?.(true);
								req.setAdWillPlayMuted?.(player.muted);
								req.setContinuousPlayback?.(true);
								if (options.configureAdsRequest) {
									options.configureAdsRequest(req);
								}
								debug("requestAds() called, tag:", req.adTagUrl);
								adsLoader.requestAds(req);
							},
						});

						if (adContainerInitialized) {
							// Already initialized via gesture — start immediately
							startAds(adsManager);
						} else {
							// On mobile, defer until gesture initializes the container
							debug("deferring adsManager.init() until adContainer gesture");
							pendingStartAds = () => startAds(adsManager);
							// Desktop fallback: initialize() can be called outside
							// a gesture. This is a no-op if already initialized.
							initializeAdContainer("ADS_MANAGER_LOADED fallback");
						}
					},
				);

				// AD_ERROR on AdsLoader
				adsLoader.addEventListener(
					sdk.AdErrorEvent.Type.AD_ERROR,
					(errorEvent: unknown) => {
						if (aborted) return;
						const e = errorEvent as ImaAdErrorEvent;
						const imaError = e.getError();
						debug(
							"AD_ERROR (adsLoader):",
							imaError.getMessage(),
							"code:",
							imaError.getErrorCode(),
						);
						player.emit("ad:error", {
							error: new Error(imaError.getMessage()),
							source: "ima",
							vastErrorCode: imaError.getErrorCode(),
						});
					},
				);

				// Build ads request
				const adsRequest = new sdk.AdsRequest();
				adsRequest.adTagUrl = options.adTagUrl;
				adsRequest.linearAdSlotWidth =
					player.el.clientWidth || adContainerEl.clientWidth || 640;
				adsRequest.linearAdSlotHeight =
					player.el.clientHeight || adContainerEl.clientHeight || 360;
				adsRequest.nonLinearAdSlotWidth =
					player.el.clientWidth || adContainerEl.clientWidth || 640;
				adsRequest.nonLinearAdSlotHeight =
					player.el.clientHeight || adContainerEl.clientHeight || 360;
				adsRequest.setAdWillAutoPlay?.(options.autoplayAdBreaks !== false);
				adsRequest.setAdWillPlayMuted?.(player.muted);
				adsRequest.setContinuousPlayback?.(true);

				if (options.configureAdsRequest) {
					options.configureAdsRequest(adsRequest);
				}

				debug(
					"initial requestAds(), tag:",
					adsRequest.adTagUrl,
					"slot:",
					adsRequest.linearAdSlotWidth,
					"x",
					adsRequest.linearAdSlotHeight,
				);
				adsLoader.requestAds(adsRequest);

				// Post-roll support: notify IMA when content ends
				contentEndedHandler = () => {
					debug("content ended, calling adsLoader.contentComplete()");
					adsLoader.contentComplete();
				};
				player.on("ended", contentEndedHandler);
			}

			// ── Trigger initialization ────────────────────────

			function onStateChange({
				to,
			}: { from: PlayerState; to: PlayerState }): void {
				if (to !== "idle" && to !== "error" && !aborted) {
					debug("statechange →", to, "triggering init()");
					player.off("statechange", onStateChange);
					init();
				}
			}

			if (
				player.state === "ready" ||
				player.state === "playing" ||
				player.state === "paused" ||
				player.state === "ended"
			) {
				debug(
					"already in state:",
					player.state,
					"— calling init() immediately",
				);
				init();
			} else {
				debug("waiting for ready state (current:", player.state, ")");
				player.on("statechange", onStateChange);
			}

			// ── Cleanup ──────────────────────────────────────

			return () => {
				aborted = true;
				player.off("statechange", onStateChange);
				if (gestureCleanup) {
					gestureCleanup();
					gestureCleanup = null;
				}
				if (contentEndedHandler) {
					player.off("ended", contentEndedHandler);
				}
				if (bridgeCleanup) {
					bridgeCleanup();
					bridgeCleanup = null;
				}
				if (adsManagerRef) {
					adsManagerRef.destroy();
					adsManagerRef = null;
				}
				imaOverlay?.remove();
			};
		},
	};
}
