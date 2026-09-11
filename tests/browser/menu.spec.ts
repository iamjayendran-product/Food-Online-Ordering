import { test, expect } from "@playwright/test";

test("TC-3.1 selecting a restaurant shows its name, cuisines, address and categories in order", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Ranganathan Street Biryani/ }).click();
  await expect(page).toHaveURL("/restaurants/ranganathan-street-biryani");

  await expect(page.getByRole("heading", { level: 1, name: "Ranganathan Street Biryani" })).toBeVisible();
  await expect(page.getByText("Biryani, North Indian")).toBeVisible();
  await expect(page.getByText("45 Ranganathan Street, T Nagar, Chennai")).toBeVisible();

  const categoryHeadings = page.getByRole("heading", { level: 2 });
  await expect(categoryHeadings).toHaveText(["Biryani", "Starters", "Beverages"]);
});

test("TC-3.2 a menu item shows name, description, price and an accessible veg/non-veg marker", async ({ page }) => {
  await page.goto("/restaurants/ranganathan-street-biryani");

  await expect(page.getByText("Chicken Biryani")).toBeVisible();
  await expect(page.getByText("Slow-cooked basmati with spiced chicken.")).toBeVisible();
  await expect(page.getByText("₹220")).toBeVisible();
  await expect(page.getByRole("img", { name: "Non-vegetarian" }).first()).toBeVisible();
});

test("TC-3.3 an unavailable item is marked unavailable and its Add button is disabled", async ({ page }) => {
  await page.goto("/restaurants/ranganathan-street-biryani");

  const row = page.locator("li", { hasText: "Gobi Manchurian" });
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
  await page.goto("/restaurants/ranganathan-street-biryani");
  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();

  const row = page.locator("li", { hasText: "Chicken Biryani" });
  const addButton = row.getByRole("button", { name: "Add" });
  await expect(addButton).toBeEnabled();
  await addButton.click();
});
