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

  // Cash is the default selection (F27); switch to online to prove the
  // solid-tomato fill follows selection generally, not just the default.
  const online = page.getByRole("button", { name: "Pay later online" });
  await online.click();
  // Move the cursor off the button first: MuiToggleButton's own
  // `&.Mui-selected:hover` rule intentionally darkens further, and the
  // click above leaves the mouse resting right on top of it.
  await page.mouse.move(0, 0);
  await expect(online).toHaveCSS("background-color", "rgb(196, 58, 47)");
});

test("TC-14.3 a menu item's price is colored in the brand tomato", async ({ page }) => {
  await page.goto("/restaurants/dindigul-thalappakatti");
  const row = page.locator("#menu-categories li", { hasText: "Seeraga Samba Chicken Biryani" });
  await expect(row.getByText("₹260")).toHaveCSS("color", "rgb(196, 58, 47)");
});
