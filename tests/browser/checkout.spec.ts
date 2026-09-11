import { test, expect } from "@playwright/test";
import { loginAs } from "../support/auth";
import { testDb } from "../support/db";

async function addChickenBiryaniToBasket(page: import("@playwright/test").Page) {
  await page.goto("/restaurants/ranganathan-street-biryani");
  await page.locator("li", { hasText: "Chicken Biryani" }).getByRole("button", { name: "Add" }).click();
}

test("TC-5.1 a guest is sent to log in and returns to checkout with the basket intact", async ({ page }) => {
  await addChickenBiryaniToBasket(page);
  await page.goto("/basket");
  await page.getByRole("link", { name: "Checkout" }).click();

  await expect(page).toHaveURL("/login?next=%2Fcheckout");
  await page.getByLabel("Email").fill("priya@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL("/checkout");
  await expect(page.getByText("Chicken Biryani")).toBeVisible();
});

test("TC-5.2 checkout shows the restaurant, pickup note, items and totals matching the basket", async ({ page }) => {
  await addChickenBiryaniToBasket(page);
  await loginAs(page, "priya@example.com");
  await page.goto("/checkout");

  await expect(page.getByRole("heading", { name: "Ranganathan Street Biryani" })).toBeVisible();
  await expect(page.getByText("45 Ranganathan Street, T Nagar, Chennai")).toBeVisible();
  await expect(page.getByText("Pickup only: collect at the counter")).toBeVisible();
  await expect(page.getByText("Chicken Biryani")).toBeVisible();
  await expect(page.getByText("Subtotal: ₹220")).toBeVisible();
  await expect(page.getByText("GST (5%): ₹11")).toBeVisible();
  await expect(page.getByText("Total: ₹231")).toBeVisible();
});

test("TC-5.3 opening checkout with an empty basket redirects to the basket page", async ({ page }) => {
  await loginAs(page, "priya@example.com");
  await page.goto("/checkout");
  await expect(page).toHaveURL("/basket");
});

test("TC-5.4 the payment panel defaults to success and the Pay button shows the total", async ({ page }) => {
  await addChickenBiryaniToBasket(page);
  await loginAs(page, "priya@example.com");
  await page.goto("/checkout");

  await expect(page.getByLabel("Simulate successful payment")).toBeChecked();
  await expect(page.getByLabel("Simulate failed payment")).not.toBeChecked();
  await expect(page.getByRole("button", { name: "Pay ₹231" })).toBeVisible();
});

test("TC-5.5 double-clicking Pay disables the button and places exactly one order", async ({ page }) => {
  await addChickenBiryaniToBasket(page);
  await loginAs(page, "priya@example.com");
  await page.goto("/checkout");

  const payButton = page.getByRole("button", { name: "Pay ₹231" });
  const beforeCount = await testDb.order.count();

  // Two native clicks dispatched synchronously in the page, back-to-back,
  // so both reach the handler before the first click's own state update
  // (or the navigation it triggers) can be observed by the second.
  // Playwright's own `.click()` retries actionability against whatever page
  // is current, which fights a click that navigates away — not what this
  // test needs to exercise.
  await payButton.evaluate((button: HTMLButtonElement) => {
    button.click();
    button.click();
  });

  await expect(page).toHaveURL(/\/orders\/.+/);
  await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible();

  const afterCount = await testDb.order.count();
  expect(afterCount - beforeCount).toBe(1);
});
