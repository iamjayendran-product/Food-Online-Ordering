import { test, expect } from "@playwright/test";
import { loginAs } from "../support/auth";

async function addChickenBiryaniToBasket(page: import("@playwright/test").Page) {
  await page.goto("/restaurants/dindigul-thalappakatti");
  await page
    .locator("#menu-categories li", { hasText: "Seeraga Samba Chicken Biryani" })
    .getByRole("button", { name: "Add" })
    .click();
}

test("TC-10.1 checkout offers cash and online payment, with online selected by default", async ({ page }) => {
  await addChickenBiryaniToBasket(page);
  await loginAs(page, "priya@example.com");
  await page.goto("/checkout");

  await expect(page.getByRole("button", { name: "Pay in cash" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Pay later online", pressed: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Pay ₹273" })).toBeVisible();
});

test("TC-10.2 paying in cash places the order with no charge and shows a cash pickup message", async ({ page }) => {
  await addChickenBiryaniToBasket(page);
  await loginAs(page, "priya@example.com");
  await page.goto("/checkout");

  await page.getByRole("button", { name: "Pay in cash" }).click();
  await page.getByRole("button", { name: "Place order" }).click();

  await expect(page).toHaveURL(/\/orders\/.+/);
  await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible();
  await expect(page.getByText("Payment: Pay ₹273 in cash at pickup")).toBeVisible();
});

test("TC-10.4 switching payment method updates the pay button label", async ({ page }) => {
  await addChickenBiryaniToBasket(page);
  await loginAs(page, "priya@example.com");
  await page.goto("/checkout");

  await page.getByRole("button", { name: "Pay in cash" }).click();
  await expect(page.getByRole("button", { name: "Place order" })).toBeVisible();

  await page.getByRole("button", { name: "Pay later online" }).click();
  await expect(page.getByRole("button", { name: "Pay ₹273" })).toBeVisible();
});

test("TC-10.5 the confirmation page shows a simulated kitchen view with a LIVE badge", async ({ page }) => {
  await addChickenBiryaniToBasket(page);
  await loginAs(page, "priya@example.com");
  await page.goto("/checkout");
  await page.getByRole("button", { name: "Pay ₹273" }).click();
  await expect(page).toHaveURL(/\/orders\/.+/);

  await expect(page.getByRole("heading", { name: "Kitchen view" })).toBeVisible();
  await expect(page.getByText("LIVE", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Simulated live view — Dindigul Thalappakatti’s kitchen"),
  ).toBeVisible();
});
