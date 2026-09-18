import { test, expect } from "@playwright/test";
import { loginAs } from "../support/auth";
import { testDb } from "../support/db";
import { BASKET_STORAGE_KEY } from "../support/basket";

async function addChickenBiryaniToBasket(page: import("@playwright/test").Page) {
  await page.goto("/restaurants/dindigul-thalappakatti");
  await page.locator("#menu-categories li", { hasText: "Seeraga Samba Chicken Biryani" }).getByRole("button", { name: "Add" }).click();
}

test("TC-6.4 an item that becomes unavailable after being added is flagged and blocks payment until removed", async ({ page }) => {
  const item = await testDb.menuItem.findFirstOrThrow({ where: { name: "Seeraga Samba Chicken Biryani" } });

  await addChickenBiryaniToBasket(page);
  await loginAs(page, "priya@example.com");
  await page.goto("/checkout");

  await testDb.menuItem.update({ where: { id: item.id }, data: { isAvailable: false } });
  try {
    const payButton = page.getByRole("button", { name: "Place order" });
    await payButton.click();

    await expect(page.getByText("No longer available", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Some items are no longer available. Remove them from your basket to continue."),
    ).toBeVisible();
    await expect(payButton).toBeDisabled();

    await page.locator("li", { hasText: "Seeraga Samba Chicken Biryani" }).getByRole("button", { name: "Remove" }).click();
    await expect(page).toHaveURL("/basket");
  } finally {
    await testDb.menuItem.update({ where: { id: item.id }, data: { isAvailable: true } });
  }
});

test("TC-6.6 a tampered basket price is corrected with a notice before payment", async ({ page }) => {
  await addChickenBiryaniToBasket(page);
  await loginAs(page, "priya@example.com");

  // Simulate a stale/edited client: tamper the saved basket's price directly.
  await page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) return;
    const basket = JSON.parse(raw);
    basket.lines = basket.lines.map((line: { unitPricePaise: number }) => ({ ...line, unitPricePaise: 1 }));
    window.localStorage.setItem(key, JSON.stringify(basket));
  }, BASKET_STORAGE_KEY);

  await page.goto("/checkout");
  await page.getByRole("button", { name: "Place order" }).click();

  await expect(page.getByText(/Prices changed since you added these items/)).toBeVisible();
  await expect(page.getByText("Total: ₹273")).toBeVisible();
  await expect(page.getByRole("button", { name: "Place order" })).toBeVisible();
});

test("TC-6.8 clearing cookies mid-checkout sends Pay to login with no new order", async ({ page, context }) => {
  await addChickenBiryaniToBasket(page);
  await loginAs(page, "priya@example.com");
  await page.goto("/checkout");

  const beforeCount = await testDb.order.count();
  await context.clearCookies();
  await page.getByRole("button", { name: "Place order" }).click();

  await expect(page).toHaveURL("/login?next=%2Fcheckout");
  expect(await testDb.order.count()).toBe(beforeCount);
});

test("TC-6.12 the confirmation page shows order details and the header basket count is 0", async ({ page }) => {
  await addChickenBiryaniToBasket(page);
  await loginAs(page, "priya@example.com");
  await page.goto("/checkout");
  // Explicitly online: this test asserts the "Paid online" confirmation
  // wording, and cash (F27's new default) would show different text.
  await page.getByRole("button", { name: "Pay later online" }).click();
  await page.getByRole("button", { name: "Pay ₹273" }).click();
  await expect(page).toHaveURL(/\/orders\/.+/);

  await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible();
  await expect(page.getByText(/Order #\d+/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dindigul Thalappakatti" })).toBeVisible();
  await expect(page.getByText("Habibullah Road, T Nagar, Chennai")).toBeVisible();
  await expect(page.getByText("Seeraga Samba Chicken Biryani")).toBeVisible();
  await expect(page.getByText("Payment: Paid online (simulated)")).toBeVisible();
  await expect(page.getByRole("link", { name: "Basket", exact: true })).toBeVisible();
});

test("TC-6.17 the confirmation page plays a confetti animation around the checkmark", async ({ page }) => {
  await addChickenBiryaniToBasket(page);
  await loginAs(page, "priya@example.com");
  await page.goto("/checkout");
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page).toHaveURL(/\/orders\/.+/);

  const confetti = page.getByTestId("confetti-burst");
  await expect(confetti).toBeVisible();
  // Randomized client-side after mount (see confetti-burst.tsx) — assert it
  // actually rendered pieces, not just an empty container.
  expect(await confetti.locator("> div").count()).toBeGreaterThan(0);
});

test("TC-6.13 reloading the confirmation page shows the same order", async ({ page }) => {
  await addChickenBiryaniToBasket(page);
  await loginAs(page, "priya@example.com");
  await page.goto("/checkout");
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page).toHaveURL(/\/orders\/.+/);
  const url = page.url();

  await page.reload();
  await expect(page).toHaveURL(url);
  await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible();
});

test("TC-6.14 another customer cannot view someone else's confirmation", async ({ page, context }) => {
  await addChickenBiryaniToBasket(page);
  await loginAs(page, "priya@example.com");
  await page.goto("/checkout");
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page).toHaveURL(/\/orders\/.+/);
  const orderUrl = page.url();

  await context.clearCookies();
  await loginAs(page, "arjun@example.com");
  await page.goto(orderUrl);
  await expect(page.getByText("This page could not be found.")).toBeVisible();
});

test("TC-6.15 a logged-out visitor is asked to log in and returned to the confirmation", async ({ page, context }) => {
  await addChickenBiryaniToBasket(page);
  await loginAs(page, "priya@example.com");
  await page.goto("/checkout");
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page).toHaveURL(/\/orders\/.+/);
  const orderUrl = page.url();

  await context.clearCookies();
  await page.goto(orderUrl);
  await expect(page).toHaveURL(/\/login\?next=/);

  await page.getByLabel("Email").fill("priya@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.locator("form").getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL(orderUrl);
  await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible();
});

test("TC-6.16 a payment-failed order's URL is not found", async ({ page }) => {
  // Checkout no longer exposes a way to simulate a failed payment, so this
  // creates the PAYMENT_FAILED order directly — the confirmation page must
  // still 404 it, since that mechanism is still real (see place-order.ts and
  // TC-6.3), just no longer reachable through the UI.
  const user = await testDb.user.findUniqueOrThrow({ where: { email: "priya@example.com" } });
  const restaurant = await testDb.restaurant.findUniqueOrThrow({
    where: { slug: "dindigul-thalappakatti" },
  });
  const failedOrder = await testDb.order.create({
    data: {
      userId: user.id,
      restaurantId: restaurant.id,
      status: "PAYMENT_FAILED",
      subtotalPaise: 26000,
      gstPaise: 1300,
      totalPaise: 27300,
      paymentProvider: "mock",
      paymentMethod: "ONLINE",
    },
  });

  await loginAs(page, "priya@example.com");
  await page.goto(`/orders/${failedOrder.id}`);
  await expect(page.getByText("This page could not be found.")).toBeVisible();
});
