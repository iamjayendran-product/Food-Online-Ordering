import { test, expect } from "@playwright/test";

test("TC-13.1 clicking a menu item photo opens a larger view that can be closed", async ({ page }) => {
  await page.goto("/restaurants/dindigul-thalappakatti");
  const row = page.locator("#menu-categories li", { hasText: "Seeraga Samba Chicken Biryani" });
  await row.getByRole("button", { name: "View larger photo of Seeraga Samba Chicken Biryani" }).click();

  const dialogImage = page.getByRole("img", { name: "Seeraga Samba Chicken Biryani" });
  await expect(dialogImage).toBeVisible();

  await page.getByRole("button", { name: "Close" }).click();
  await expect(dialogImage).toHaveCount(0);
});

test("TC-13.2 adding an item shows a quantity stepper on the menu page", async ({ page }) => {
  await page.goto("/restaurants/dindigul-thalappakatti");
  const row = page.locator("#menu-categories li", { hasText: "Seeraga Samba Chicken Biryani" });
  await row.getByRole("button", { name: "Add" }).click();

  await expect(
    row.getByLabel("Quantity of Seeraga Samba Chicken Biryani", { exact: true }),
  ).toHaveText("1");

  await row.getByRole("button", { name: "Increase quantity of Seeraga Samba Chicken Biryani" }).click();
  await expect(
    row.getByLabel("Quantity of Seeraga Samba Chicken Biryani", { exact: true }),
  ).toHaveText("2");

  await row.getByRole("button", { name: "Decrease quantity of Seeraga Samba Chicken Biryani" }).click();
  await row.getByRole("button", { name: "Decrease quantity of Seeraga Samba Chicken Biryani" }).click();
  await expect(row.getByRole("button", { name: "Add" })).toBeVisible();
});

test("TC-13.3 category headings are colored distinctly", async ({ page }) => {
  await page.goto("/restaurants/dindigul-thalappakatti");
  const headings = page.getByRole("heading", { level: 2 });
  const colors = await headings.evaluateAll((els) => els.map((el) => getComputedStyle(el).color));
  expect(new Set(colors).size).toBeGreaterThan(1);
});
