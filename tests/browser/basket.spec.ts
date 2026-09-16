import { test, expect } from "@playwright/test";
import { BASKET_STORAGE_KEY } from "../support/basket";

test("TC-4.1 a guest adding an item updates the header count and the basket", async ({ page }) => {
  await page.goto("/restaurants/dindigul-thalappakatti");
  await page
    .locator("#menu-categories li", { hasText: "Seeraga Samba Chicken Biryani" })
    .getByRole("button", { name: "Add" })
    .click();

  await expect(page.getByRole("link", { name: "Basket (1)" })).toBeVisible();

  await page.goto("/basket");
  const basketRow = page.locator("li", { hasText: "Seeraga Samba Chicken Biryani" });
  await expect(
    basketRow.getByLabel("Quantity of Seeraga Samba Chicken Biryani", { exact: true }),
  ).toHaveText("1");
  await expect(basketRow).toContainText("₹260");
});

test("TC-4.6 adding from a different restaurant and choosing Cancel leaves the basket unchanged", async ({ page }) => {
  await page.goto("/restaurants/dindigul-thalappakatti");
  await page
    .locator("#menu-categories li", { hasText: "Seeraga Samba Chicken Biryani" })
    .getByRole("button", { name: "Add" })
    .click();

  await page.goto("/restaurants/hotel-saravana-bhavan");
  await page.locator("#menu-categories li", { hasText: "Mysore Masala Dosa" }).getByRole("button", { name: "Add" }).click();

  await expect(page.getByRole("alertdialog", { name: "Start a new basket?" })).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();

  await page.goto("/basket");
  await expect(page.getByText("Seeraga Samba Chicken Biryani")).toBeVisible();
  await expect(page.getByText("Mysore Masala Dosa")).toHaveCount(0);
});

test("TC-4.7 adding from a different restaurant and choosing Confirm replaces the basket", async ({ page }) => {
  await page.goto("/restaurants/dindigul-thalappakatti");
  await page
    .locator("#menu-categories li", { hasText: "Seeraga Samba Chicken Biryani" })
    .getByRole("button", { name: "Add" })
    .click();

  await page.goto("/restaurants/hotel-saravana-bhavan");
  await page.locator("#menu-categories li", { hasText: "Mysore Masala Dosa" }).getByRole("button", { name: "Add" }).click();

  await expect(page.getByRole("alertdialog", { name: "Start a new basket?" })).toBeVisible();
  await page.getByRole("button", { name: "Confirm" }).click();

  await page.goto("/basket");
  await expect(page.getByText("Mysore Masala Dosa")).toBeVisible();
  await expect(page.getByText("Seeraga Samba Chicken Biryani")).toHaveCount(0);
});

test("TC-4.8 the basket persists across a reload and navigating away and back", async ({ page }) => {
  await page.goto("/restaurants/dindigul-thalappakatti");
  await page
    .locator("#menu-categories li", { hasText: "Seeraga Samba Chicken Biryani" })
    .getByRole("button", { name: "Add" })
    .click();
  await expect(page.getByRole("link", { name: "Basket (1)" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("link", { name: "Basket (1)" })).toBeVisible();

  await page.goto("/");
  await page.goto("/restaurants/dindigul-thalappakatti");
  await expect(page.getByRole("link", { name: "Basket (1)" })).toBeVisible();
});

test("TC-4.9 a corrupted saved basket loads as empty without an error screen", async ({ page }) => {
  await page.addInitScript(
    ([key]) => {
      window.localStorage.setItem(key as string, "{not valid json");
    },
    [BASKET_STORAGE_KEY] as const,
  );

  await page.goto("/basket");
  await expect(page.getByText("Your basket is empty.")).toBeVisible();
});

test("TC-4.12 an empty basket shows a browse prompt and no checkout link", async ({ page }) => {
  await page.goto("/basket");
  await expect(page.getByText("Your basket is empty.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse restaurants" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Checkout" })).toHaveCount(0);
});
