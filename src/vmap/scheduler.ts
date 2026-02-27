import type { Player } from "../types.js";
import type { AdBreak } from "./types.js";

export interface Scheduler {
	start(): void;
	pause(): void;
	resume(): void;
	destroy(): void;
}

/**
 * Creates a scheduler that monitors playback and fires onBreak
 * when the player reaches an ad break's time offset.
 *
 * - preroll ("start"): fires immediately on start()
 * - midroll ("time"): fires when currentTime >= seconds (±0.5s tolerance)
 * - postroll ("end"): fires on "ended" event
 * - Each break fires at most once
 * - Midrolls skipped via seek do not fire
 */
export function createScheduler(
	player: Player,
	adBreaks: AdBreak[],
	onBreak: (adBreak: AdBreak) => Promise<void>,
): Scheduler {
	const fired = new Set<AdBreak>();
	let lastTime = 0;
	let started = false;
	let paused = false;

	const prerolls = adBreaks.filter((b) => b.timeOffset.type === "start");
	const postrolls = adBreaks.filter((b) => b.timeOffset.type === "end");
	const midrolls = adBreaks
		.filter(
			(b) => b.timeOffset.type === "time" || b.timeOffset.type === "percentage",
		)
		.sort((a, b) => midrollSortKey(a) - midrollSortKey(b));

	function onTimeUpdate(): void {
		if (paused) return;
		const currentTime = player.currentTime;
		const seeked = currentTime > lastTime + 1.5;

		for (const breakItem of midrolls) {
			if (fired.has(breakItem)) continue;
			const targetTime = resolveTargetTime(breakItem, player.duration);
			if (targetTime === null) continue;

			if (seeked && currentTime > targetTime + 0.5) {
				fired.add(breakItem);
				continue;
			}

			if (currentTime >= targetTime - 0.5) {
				fired.add(breakItem);
				onBreak(breakItem);
			}
		}

		lastTime = currentTime;
	}

	function onEnded(): void {
		if (paused) return;
		for (const breakItem of postrolls) {
			if (fired.has(breakItem)) continue;
			fired.add(breakItem);
			onBreak(breakItem);
		}
	}

	function start(): void {
		if (started) return;
		started = true;

		for (const breakItem of prerolls) {
			if (fired.has(breakItem)) continue;
			fired.add(breakItem);
			onBreak(breakItem);
		}

		player.on("timeupdate", onTimeUpdate);
		player.on("ended", onEnded);
	}

	function pause(): void {
		paused = true;
	}

	function resume(): void {
		paused = false;
		lastTime = player.currentTime;
	}

	function destroy(): void {
		player.off("timeupdate", onTimeUpdate);
		player.off("ended", onEnded);
	}

	return { start, pause, resume, destroy };
}

function resolveTargetTime(
	breakItem: AdBreak,
	duration: number,
): number | null {
	if (breakItem.timeOffset.type === "time") return breakItem.timeOffset.seconds;
	if (breakItem.timeOffset.type === "percentage")
		return (breakItem.timeOffset.pct / 100) * duration;
	return null;
}

function midrollSortKey(breakItem: AdBreak): number {
	if (breakItem.timeOffset.type === "time") return breakItem.timeOffset.seconds;
	if (breakItem.timeOffset.type === "percentage")
		return breakItem.timeOffset.pct;
	return 0;
}
