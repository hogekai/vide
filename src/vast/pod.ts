import type { PluginPlayer } from "../types.js";
import { type SingleAdResult, playSingleAd } from "./playback.js";
import type { AdPlugin, VastAd, VastLinear } from "./types.js";

/** A playable ad: the VastAd plus its first linear creative. */
export interface PlayableAd {
	ad: VastAd;
	linear: VastLinear;
}

export interface ClassifiedAds {
	type: "single" | "pod" | "waterfall";
	ads: PlayableAd[];
	/**
	 * Stand-alone ads (no sequence) available for substitution when a pod ad fails.
	 * Per VAST 3.3.1: "Should an ad in the Pod fail to play, the media player
	 * should substitute an un-played stand-alone ad from the response."
	 * Only populated when type is "pod" and unsequenced ads exist.
	 */
	standalonePool: PlayableAd[];
}

export interface PodResult {
	completed: number;
	skipped: number;
	failed: number;
}

/**
 * Classify ads from a VAST response into single, pod, or waterfall.
 * Pure function — no side effects.
 *
 * - All have sequence → pod (sorted by sequence)
 * - None have sequence + multiple → waterfall (original order)
 * - Mixed → pod from sequenced only
 * - 0 or 1 playable → single
 */
export function classifyAds(vastAds: VastAd[]): ClassifiedAds {
	const playable: PlayableAd[] = [];
	for (const ad of vastAds) {
		for (const creative of ad.creatives) {
			if (creative.linear && creative.linear.mediaFiles.length > 0) {
				playable.push({ ad, linear: creative.linear });
				break;
			}
		}
	}

	if (playable.length <= 1)
		return { type: "single", ads: playable, standalonePool: [] };

	const sequenced = playable.filter((p) => p.ad.sequence != null);
	const unsequenced = playable.filter((p) => p.ad.sequence == null);

	if (sequenced.length > 0) {
		sequenced.sort((a, b) => (a.ad.sequence ?? 0) - (b.ad.sequence ?? 0));
		return { type: "pod", ads: sequenced, standalonePool: unsequenced };
	}

	return { type: "waterfall", ads: unsequenced, standalonePool: [] };
}

/**
 * Play all ads in a pod sequentially.
 * Individual failures or skips advance to the next ad.
 *
 * Per VAST 3.3.1: when a pod ad fails, a stand-alone ad from
 * `standalonePool` is substituted before moving to the next pod ad.
 */
export async function playPod(
	player: PluginPlayer,
	ads: PlayableAd[],
	options: {
		source: "vast" | "vmap";
		adPlugins?: ((ad: VastAd) => AdPlugin[]) | undefined;
		/** Called synchronously when the last ad in the pod finishes. */
		onFinish?: ((result: SingleAdResult) => void) | undefined;
		/**
		 * Stand-alone ads available for substitution when a pod ad fails.
		 * Each ad is used at most once.
		 */
		standalonePool?: PlayableAd[] | undefined;
	},
): Promise<PodResult> {
	const result: PodResult = { completed: 0, skipped: 0, failed: 0 };
	const total = ads.length;
	const remainingStandalones = options.standalonePool
		? [...options.standalonePool]
		: [];

	player.emit("ad:pod:start", {
		ads: ads.map((p) => p.ad),
		total,
	});

	for (let i = 0; i < ads.length; i++) {
		const { ad, linear } = ads[i];
		const isLast = i === ads.length - 1;

		player.emit("ad:pod:adstart", { ad, index: i, total });

		const { promise } = playSingleAd({
			player,
			ad,
			linear,
			source: options.source,
			adPlugins: options.adPlugins,
			onFinish: isLast ? options.onFinish : undefined,
		});

		let adResult = await promise;

		// VAST 3.3.1: substitute a stand-alone ad on pod ad failure
		if (adResult.outcome === "error" && remainingStandalones.length > 0) {
			const substitute = remainingStandalones.shift() as PlayableAd;
			const { promise: subPromise } = playSingleAd({
				player,
				ad: substitute.ad,
				linear: substitute.linear,
				source: options.source,
				adPlugins: options.adPlugins,
				onFinish: isLast ? options.onFinish : undefined,
			});
			adResult = await subPromise;
		}

		player.emit("ad:pod:adend", { ad, index: i, total });

		switch (adResult.outcome) {
			case "completed":
				result.completed++;
				break;
			case "skipped":
				result.skipped++;
				break;
			case "error":
				result.failed++;
				break;
		}
	}

	player.emit("ad:pod:end", result);
	return result;
}

/**
 * Try ads in waterfall order. Play the first one that loads successfully.
 * Returns the result of the first successful ad, or null if all fail.
 */
export async function playWaterfall(
	player: PluginPlayer,
	ads: PlayableAd[],
	options: {
		source: "vast" | "vmap";
		adPlugins?: ((ad: VastAd) => AdPlugin[]) | undefined;
		/** Called synchronously when the winning ad finishes (or last failure). */
		onFinish?: ((result: SingleAdResult) => void) | undefined;
	},
): Promise<SingleAdResult | null> {
	for (const { ad, linear } of ads) {
		const { promise } = playSingleAd({
			player,
			ad,
			linear,
			source: options.source,
			adPlugins: options.adPlugins,
			onFinish: options.onFinish,
		});

		const result = await promise;

		if (result.outcome !== "error") {
			return result;
		}

		// Only continue waterfall on load errors; playback errors stop the chain
		if (result.errorPhase === "playback") {
			return result;
		}
	}

	return null;
}
