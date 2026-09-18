import { test, expect } from "@playwright/test";

test("TC-12.1 the promo headline does not wrap", async ({ page }) => {
  // Freeze the clock before navigating — the carousel starts auto-advancing
  // on mount, and a real-time wait here can race page load under load.
  await page.clock.install();
  await page.clock.pauseAt(Date.now());
  await page.goto("/");
  const headline = page.getByText("Your first order in Foodlicious is 50% off");
  await expect(headline).toHaveCSS("white-space", "nowrap");
});

test("TC-12.2 the active category chip shows a check mark", async ({ page }) => {
  await page.goto("/?cuisine=Tiffin");
  const chip = page
    .getByRole("navigation", { name: "Browse by category" })
    .getByRole("link", { name: /Tiffin/ });
  await expect(chip.locator("svg")).toBeVisible();
});

test("TC-12.3 Clear all appears once a category is active and clears the filter", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Clear all" })).toHaveCount(0);

  await page.goto("/?cuisine=Tiffin");
  await page.getByRole("link", { name: "Clear all" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Clear all" })).toHaveCount(0);
});

test("TC-12.4 store cards show a pre-order available indicator", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Pre-order available").first()).toBeVisible();
});

test("TC-12.5 Sin & Tonic shows a Foodlicious exclusive badge", async ({ page }) => {
  await page.goto("/");
  // The badge sits outside the card's link, same as the favourite button —
  // it's its own overlay, not part of the link's content.
  await expect(page.getByText("Foodlicious exclusive")).toBeVisible();
});
