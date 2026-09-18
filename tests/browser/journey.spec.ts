import { test, expect } from "@playwright/test";

test("TC-J.1 guest journey: search, menu, basket, checkout, login, pay", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Search restaurants").fill("idli");
  await page.getByRole("button", { name: "Search" }).click();
  await page.getByRole("link", { name: /Murugan Idli Shop/ }).click();

  await page.locator("#menu-categories li", { hasText: "Idli (4 pcs)" }).getByRole("button", { name: "Add" }).click();
  const dosaRow = page.locator("#menu-categories li", { hasText: "Kal Dosa" });
  await dosaRow.getByRole("button", { name: "Add" }).click();
  await dosaRow.getByRole("button", { name: "Increase quantity of Kal Dosa" }).click();

  await page.goto("/basket");
  await expect(page.getByLabel("Quantity of Kal Dosa", { exact: true })).toHaveText("2");

  await page.getByRole("link", { name: "Checkout" }).click();
  await expect(page).toHaveURL("/login?next=%2Fcheckout");
  await page.getByLabel("Email").fill("priya@example.com");
  await page.getByLabel("Password").fill("password123");
  // Scoped to the form: the F24 guest-login mode toggle also has a
  // same-named "Log in" control (switching modes, not submitting).
  await page.locator("form").getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL("/checkout");
  // Cash is now the default (F27) — switch to online to keep this journey
  // exercising the online-pay path end to end.
  await page.getByRole("button", { name: "Pay later online" }).click();
  const payButton = page.getByRole("button", { name: "Pay ₹294" });
  await expect(payButton).toBeVisible();
  await payButton.click();

  await expect(page).toHaveURL(/\/orders\/.+/);
  await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible();
  await expect(page.getByText("Idli (4 pcs) × 1")).toBeVisible();
  await expect(page.getByText("Kal Dosa × 2")).toBeVisible();
  await expect(page.getByText("Total: ₹294")).toBeVisible();
});
