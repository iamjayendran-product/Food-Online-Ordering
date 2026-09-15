import { test, expect } from "@playwright/test";

test("TC-J.1 guest journey: search, menu, basket, checkout, login, pay", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Search restaurants").fill("tiffin");
  await page.getByRole("button", { name: "Search" }).click();
  await page.getByRole("link", { name: /Pondy Bazaar Tiffin House/ }).click();

  await page.locator("#menu-categories li", { hasText: "Idli" }).getByRole("button", { name: "Add" }).click();
  const dosaRow = page.locator("#menu-categories li", { hasText: "Masala Dosa" });
  await dosaRow.getByRole("button", { name: "Add" }).click();
  await dosaRow.getByRole("button", { name: "Add" }).click();

  await page.goto("/basket");
  await expect(page.getByLabel("Quantity of Masala Dosa", { exact: true })).toHaveText("2");

  await page.getByRole("link", { name: "Checkout" }).click();
  await expect(page).toHaveURL("/login?next=%2Fcheckout");
  await page.getByLabel("Email").fill("priya@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL("/checkout");
  const payButton = page.getByRole("button", { name: "Pay ₹252" });
  await expect(payButton).toBeVisible();
  await payButton.click();

  await expect(page).toHaveURL(/\/orders\/.+/);
  await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible();
  await expect(page.getByText("Idli × 1")).toBeVisible();
  await expect(page.getByText("Masala Dosa × 2")).toBeVisible();
  await expect(page.getByText("Total: ₹252")).toBeVisible();
});
