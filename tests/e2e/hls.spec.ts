import { expect, test } from "@playwright/test";

test.describe("HLS streaming", () => {
	test("loads and plays HLS stream via hls.js", async ({ page }) => {
		await page.goto("/examples/hls.html");
		await page.waitForFunction(() => (window as any).player !== undefined);

		// Wait for HLS to reach ready or playing state (stream may take time)
		await page.waitForFunction(
			() => {
				const s = (window as any).player?.state;
				return s === "ready" || s === "playing" || s === "buffering";
			},
			undefined,
			{ timeout: 15_000 },
		);

		const state = await page.evaluate(() => (window as any).player.state);
		expect(["ready", "playing", "buffering"]).toContain(state);
	});

	test("HLS stream can be paused and resumed", async ({ page }) => {
		await page.goto("/examples/hls.html");
		await page.waitForFunction(() => (window as any).player !== undefined);

		// Wait for playback
		await page.waitForFunction(
			() => (window as any).player?.state === "playing",
			undefined,
			{ timeout: 15_000 },
		);

		// Pause
		await page.evaluate(() => (window as any).player.pause());
		await page.waitForFunction(
			() => (window as any).player?.state === "paused",
			undefined,
			{ timeout: 5_000 },
		);

		expect(await page.evaluate(() => (window as any).player.state)).toBe(
			"paused",
		);

		// Resume
		await page.evaluate(() => (window as any).player.play());
		await page.waitForFunction(
			() => (window as any).player?.state === "playing",
			undefined,
			{ timeout: 10_000 },
		);

		expect(await page.evaluate(() => (window as any).player.state)).toBe(
			"playing",
		);
	});
});
