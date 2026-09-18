import { test, expect } from "@playwright/test";
import { loginAs } from "../support/auth";

const NARROW_WIDTH = 320;

function hasNoHorizontalOverflow(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth <= doc.clientWidth;
  });
}

test("TC-17.1 home, menu, basket and checkout have no horizontal overflow at 320px", async ({ page }) => {
  await page.setViewportSize({ width: NARROW_WIDTH, height: 800 });

  await page.goto("/restaurants/dindigul-thalappakatti");
  await page
    .locator("#menu-categories li", { hasText: "Seeraga Samba Chicken Biryani" })
    .getByRole("button", { name: "Add" })
    .click();
  expect(await hasNoHorizontalOverflow(page)).toBe(true);

  await page.goto("/");
  expect(await hasNoHorizontalOverflow(page)).toBe(true);

  await page.goto("/basket");
  expect(await hasNoHorizontalOverflow(page)).toBe(true);

  await loginAs(page, "priya@example.com");
  await page.goto("/checkout");
  expect(await hasNoHorizontalOverflow(page)).toBe(true);
});

test("TC-17.2 the promo banner headline fits within a 320px viewport", async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(Date.now());
  await page.setViewportSize({ width: NARROW_WIDTH, height: 800 });
  await page.goto("/");

  const headline = page.getByText("Your first order in Foodlicious is 50% off");
  const box = await headline.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x + box!.width).toBeLessThanOrEqual(NARROW_WIDTH);
});

test("TC-17.3 a long single-word name truncates in the header instead of overflowing", async ({ page }) => {
  await page.setViewportSize({ width: NARROW_WIDTH, height: 800 });
  await page.goto("/login");
  await page.getByRole("group").getByRole("button", { name: "Continue as Guest" }).click();
  await page.getByLabel("Name").fill("Superlongnamewithnospaceswhatsoever");
  await page.locator("form").getByRole("button", { name: "Continue as Guest" }).click();
  await expect(page).toHaveURL("/");

  expect(await hasNoHorizontalOverflow(page)).toBe(true);
  const greeting = page.getByText(/^Hi /);
  await expect(greeting).toHaveCSS("text-overflow", "ellipsis");
});
