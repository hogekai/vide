import { expect, test } from "@playwright/test";

test.describe("UI controls", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/examples/ui.html");
		await page.waitForFunction(() => (window as any).player !== undefined);
	});

	test("progress bar is rendered", async ({ page }) => {
		const progress = page.locator(".vide-progress");
		await expect(progress).toBeVisible();
	});

	test("volume control is rendered", async ({ page }) => {
		const volume = page.locator(".vide-volume");
		await expect(volume).toBeVisible();
	});

	test("fullscreen button is rendered", async ({ page }) => {
		const fsBtn = page.locator(".vide-fullscreen");
		await expect(fsBtn).toBeVisible();
		await expect(fsBtn).toHaveAttribute("aria-label", "Fullscreen");
	});

	test("time display shows 0:00", async ({ page }) => {
		const time = page.locator(".vide-time");
		await expect(time).toBeVisible();
		const text = await time.textContent();
		expect(text).toContain("0:00");
	});

	test("keyboard space toggles play", async ({ page }) => {
		// Focus the player area
		const container = page.locator("#player-container");
		await container.click();

		// Press space to play
		await page.keyboard.press("Space");
		await page.waitForFunction(
			() => {
				const s = (window as any).player?.state;
				return s === "playing" || s === "buffering";
			},
			undefined,
			{ timeout: 10_000 },
		);

		// Press space again to pause
		await page.keyboard.press("Space");
		await page.waitForFunction(
			() => (window as any).player?.state === "paused",
			undefined,
			{ timeout: 5_000 },
		);

		const state = await page.evaluate(() => (window as any).player.state);
		expect(state).toBe("paused");
	});

	test("controls auto-hide after inactivity", async ({ page }) => {
		const controls = page.locator(".vide-controls");

		// Start playback so auto-hide kicks in
		await page.locator(".vide-play").click();
		await page.waitForFunction(
			() => (window as any).player?.state === "playing",
			undefined,
			{ timeout: 10_000 },
		);

		// Move mouse away and wait for auto-hide (default ~3s)
		await page.mouse.move(0, 0);
		await page.waitForTimeout(4_000);

		// Controls should be hidden via CSS
		const uiRoot = page.locator(".vide-ui");
		const hiddenClass = await uiRoot.evaluate((el) =>
			el.classList.contains("vide-ui--idle"),
		);
		expect(hiddenClass).toBe(true);
	});
});
