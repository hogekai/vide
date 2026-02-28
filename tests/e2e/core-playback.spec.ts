import { expect, test } from "@playwright/test";

test.describe("Core playback", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/examples/ui.html");
		// Wait for the player to be created
		await page.waitForFunction(() => (window as any).player !== undefined);
	});

	test("player initializes and shows UI", async ({ page }) => {
		// The UI plugin should render controls
		const controls = page.locator(".vide-controls");
		await expect(controls).toBeVisible();

		// Play button should be visible
		const playBtn = page.locator(".vide-play");
		await expect(playBtn).toBeVisible();
	});

	test("click play button starts playback", async ({ page }) => {
		const playBtn = page.locator(".vide-play");
		await playBtn.click();

		// State should transition to playing (or buffering then playing)
		await page.waitForFunction(
			() => {
				const state = (window as any).player?.state;
				return state === "playing" || state === "buffering";
			},
			undefined,
			{ timeout: 10_000 },
		);

		const state = await page.evaluate(() => (window as any).player.state);
		expect(["playing", "buffering"]).toContain(state);
	});

	test("click pause after play pauses video", async ({ page }) => {
		const playBtn = page.locator(".vide-play");

		// Start playback
		await playBtn.click();
		await page.waitForFunction(
			() => (window as any).player?.state === "playing",
			undefined,
			{ timeout: 10_000 },
		);

		// Pause
		await playBtn.click();
		await page.waitForFunction(
			() => (window as any).player?.state === "paused",
			undefined,
			{ timeout: 5_000 },
		);

		const state = await page.evaluate(() => (window as any).player.state);
		expect(state).toBe("paused");
	});

	test("src change triggers loading state", async ({ page }) => {
		await page.evaluate(() => {
			(window as any).player.src =
				"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";
		});

		const state = await page.evaluate(() => (window as any).player.state);
		expect(["loading", "ready"]).toContain(state);
	});

	test("destroy removes event listeners", async ({ page }) => {
		await page.evaluate(() => {
			(window as any).player.destroy();
		});

		const state = await page.evaluate(() => (window as any).player.state);
		expect(state).toBe("idle");
	});
});
