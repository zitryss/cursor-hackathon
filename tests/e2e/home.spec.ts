import { expect, test } from "@playwright/test";

test("opens the Taxfix card pitch", async ({ page }) => {
	await page.goto("http://127.0.0.1:5173");
	await expect(
		page.getByRole("heading", { name: "You spend all year. Why file once?" }),
	).toBeVisible();
	await expect(page.getByRole("button", { name: "Start pitch" })).toBeVisible();
});
