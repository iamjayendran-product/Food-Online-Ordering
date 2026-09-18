import { test, expect } from "@playwright/test";
import { loginAs } from "../support/auth";

test("TC-14.1 hovering an interactive element uses the brand tomato tint, not grey", async ({ page }) => {
  await page.goto("/restaurants/dindigul-thalappakatti");
  const chip = page.getByRole("link", { name: "Biryani", exact: true });
  await chip.hover();

  await expect(chip).toHaveCSS("background-color", "rgba(196, 58, 47, 0.06)");
});

test("TC-14.2 the selected pickup-time and payment-method toggle buttons fill solid tomato", async ({ page }) => {
  await page.goto("/restaurants/dindigul-thalappakatti");
  await page
    .locator("#menu-categories li", { hasText: "Seeraga Samba Chicken Biryani" })
    .getByRole("button", { name: "Add" })
    .click();
  await loginAs(page, "priya@example.com");
  await page.goto("/checkout");

  const asap = page.getByRole("button", { name: "ASAP" });
  await expect(asap).toHaveCSS("background-color", "rgb(196, 58, 47)");
  await expect(asap).toHaveCSS("color", "rgb(255, 255, 255)");

  const online = page.getByRole("button", { name: "Pay later online" });
  await expect(online).toHaveCSS("background-color", "rgb(196, 58, 47)");
});

test("TC-14.3 a menu item's price is colored in the brand tomato", async ({ page }) => {
  await page.goto("/restaurants/dindigul-thalappakatti");
  const row = page.locator("#menu-categories li", { hasText: "Seeraga Samba Chicken Biryani" });
  await expect(row.getByText("₹260")).toHaveCSS("color", "rgb(196, 58, 47)");
});
