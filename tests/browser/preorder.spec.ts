import { test, expect } from "@playwright/test";
import { loginAs } from "../support/auth";

async function addChickenBiryaniToBasket(page: import("@playwright/test").Page) {
  await page.goto("/restaurants/dindigul-thalappakatti");
  await page
    .locator("#menu-categories li", { hasText: "Seeraga Samba Chicken Biryani" })
    .getByRole("button", { name: "Add" })
    .click();
}

function tomorrowDateInputValue(): string {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

test("TC-9.1 scheduling a valid future pickup time places the order for that time", async ({ page }) => {
  await addChickenBiryaniToBasket(page);
  await loginAs(page, "priya@example.com");
  await page.goto("/checkout");

  await page.getByRole("button", { name: "Schedule for later" }).click();
  await page.getByLabel("Pickup date").fill(tomorrowDateInputValue());
  await page.getByLabel("Pickup time").fill("14:00");
  await page.getByRole("button", { name: /^Pay ₹/ }).click();

  await expect(page).toHaveURL(/\/orders\/.+/);
  await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible();
  await expect(page.getByText(/^Pickup: /)).not.toHaveText("Pickup: ASAP");
  await expect(page.getByText(/^Pickup: /)).toContainText("2:00");
});

test("TC-9.4 checking out without scheduling still shows Pickup: ASAP", async ({ page }) => {
  await addChickenBiryaniToBasket(page);
  await loginAs(page, "priya@example.com");
  await page.goto("/checkout");
  await page.getByRole("button", { name: /^Pay ₹/ }).click();

  await expect(page).toHaveURL(/\/orders\/.+/);
  await expect(page.getByText("Pickup: ASAP")).toBeVisible();
});
