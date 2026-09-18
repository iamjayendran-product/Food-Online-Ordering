import { test, expect } from "@playwright/test";

test("TC-15.1 a floating basket button stays visible while scrolling and links to the basket", async ({ page }) => {
  await page.goto("/restaurants/dindigul-thalappakatti");
  await expect(page.getByRole("link", { name: /^View basket/ })).toHaveCount(0);

  await page
    .locator("#menu-categories li", { hasText: "Seeraga Samba Chicken Biryani" })
    .getByRole("button", { name: "Add" })
    .click();

  const floatingBasket = page.getByRole("link", { name: "View basket, 1 item" });
  await expect(floatingBasket).toBeVisible();

  await page.mouse.wheel(0, 1200);
  await expect(floatingBasket).toBeVisible();

  await floatingBasket.click();
  await expect(page).toHaveURL("/basket");
});

test("TC-15.2 the store name, rating and address render over the hero photo", async ({ page }) => {
  // Freeze the clock before navigating: the hero's auto-advance interval
  // starts ticking on mount, and a real-time wait here can race page load
  // under a loaded machine (same reasoning as TC-8.5).
  await page.clock.install();
  await page.clock.pauseAt(Date.now());
  await page.goto("/restaurants/dindigul-thalappakatti");

  const heading = page.getByRole("heading", { level: 1, name: "Dindigul Thalappakatti" });
  await expect(heading).toBeVisible();
  await expect(heading).toHaveCSS("color", "rgb(255, 255, 255)");

  await expect(
    page.getByRole("img", { name: "Dindigul Thalappakatti banner photo 1 of 3" }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Rated 4.6 out of 5 from 921 reviews" }),
  ).toBeVisible();
  await expect(page.getByText("Habibullah Road, T Nagar, Chennai")).toBeVisible();
});

test("TC-15.3 a row of illustrated reel cards appears below the store info", async ({ page }) => {
  await page.goto("/restaurants/dindigul-thalappakatti");

  await expect(page.getByRole("heading", { name: "From the kitchen" })).toBeVisible();
  const reels = page.locator('[aria-label^="Illustration:"]');
  await expect(reels).toHaveCount(3);
});
