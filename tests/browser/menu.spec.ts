import { test, expect } from "@playwright/test";

test("TC-3.1 selecting a restaurant shows its name, cuisines, address and categories in order", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Dindigul Thalappakatti/ }).click();
  await expect(page).toHaveURL("/restaurants/dindigul-thalappakatti");

  await expect(page.getByRole("heading", { level: 1, name: "Dindigul Thalappakatti" })).toBeVisible();
  await expect(page.getByText("Biryani, South Indian")).toBeVisible();
  await expect(page.getByText("Habibullah Road, T Nagar, Chennai")).toBeVisible();

  const categoryHeadings = page.getByRole("heading", { level: 2 });
  await expect(categoryHeadings).toHaveText([
    "From the kitchen",
    "Biryani",
    "Starters",
    "Curries",
    "Beverages",
  ]);
});

test("TC-3.2 a menu item shows name, description, price and an accessible veg/non-veg marker", async ({ page }) => {
  await page.goto("/restaurants/dindigul-thalappakatti");

  // Scoped to the dish's own row: its price isn't unique on this menu
  // (Mutton Chukka, Naadan Chicken Biryani and Prawn 65 are also ₹260), so
  // an unscoped text match could hit more than one element.
  const row = page.locator("#menu-categories li", { hasText: "Seeraga Samba Chicken Biryani" });
  await expect(row.getByText("Seeraga Samba Chicken Biryani", { exact: true })).toBeVisible();
  await expect(
    row.getByText("Signature short-grain seeraga samba rice with spiced chicken."),
  ).toBeVisible();
  await expect(row.getByText("₹260")).toBeVisible();
  await expect(row.getByRole("img", { name: "Non-vegetarian" })).toBeVisible();
});

test("TC-3.3 an unavailable item is marked unavailable and its Add button is disabled", async ({ page }) => {
  await page.goto("/restaurants/dindigul-thalappakatti");

  const row = page.locator("#menu-categories li", { hasText: "Gobi Manchurian" });
  await expect(row.getByText("Currently unavailable")).toBeVisible();
  await expect(row.getByRole("button", { name: "Add" })).toBeDisabled();
});

test("TC-3.4 an unknown restaurant shows not found with a link home", async ({ page }) => {
  await page.goto("/restaurants/does-not-exist");

  await expect(page.getByText("Restaurant not found")).toBeVisible();
  await page.getByRole("link", { name: "Back to restaurants" }).click();
  await expect(page).toHaveURL("/");
});

test("TC-3.6 the menu is visible and Add works while logged out", async ({ page }) => {
  await page.goto("/restaurants/dindigul-thalappakatti");
  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();

  const row = page.locator("#menu-categories li", { hasText: "Seeraga Samba Chicken Biryani" });
  const addButton = row.getByRole("button", { name: "Add" });
  await expect(addButton).toBeEnabled();
  await addButton.click();
});
