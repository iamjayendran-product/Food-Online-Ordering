import { test, expect } from "@playwright/test";

test("TC-16.1 clicking Continue as Guest on the login page shows a Name field", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel("Name")).not.toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();

  await page.getByRole("group").getByRole("button", { name: "Continue as Guest" }).click();

  await expect(page.getByLabel("Name")).toBeVisible();
  await expect(page.locator("form").getByRole("button", { name: "Continue as Guest" })).toBeVisible();
  // "Replace", not just add: the email/password form must be gone, not
  // merely hidden behind the guest form.
  await expect(page.getByLabel("Email")).not.toBeVisible();
  await expect(page.getByLabel("Password")).not.toBeVisible();
});

test("TC-16.2 continuing as a guest signs them in with no email or password and returns to checkout", async ({
  page,
}) => {
  await page.goto("/restaurants/dindigul-thalappakatti");
  await page
    .locator("#menu-categories li", { hasText: "Seeraga Samba Chicken Biryani" })
    .getByRole("button", { name: "Add" })
    .click();
  await page.goto("/basket");
  await page.getByRole("link", { name: "Checkout" }).click();
  await expect(page).toHaveURL("/login?next=%2Fcheckout");

  await page.getByRole("group").getByRole("button", { name: "Continue as Guest" }).click();
  await page.getByLabel("Name").fill("Casual Visitor");
  await page.locator("form").getByRole("button", { name: "Continue as Guest" }).click();

  await expect(page).toHaveURL("/checkout");
  await expect(page.getByText("Hi Casual")).toBeVisible();
});

test("TC-16.3 a blank guest name shows a field error and creates no session", async ({ page, context }) => {
  await page.goto("/login");
  await page.getByRole("group").getByRole("button", { name: "Continue as Guest" }).click();
  await page.locator("form").getByRole("button", { name: "Continue as Guest" }).click();

  await expect(page.getByText("Name is required.")).toBeVisible();
  await expect(page).toHaveURL("/login");
  const cookies = await context.cookies();
  expect(cookies.find((c) => c.name === "session")).toBeUndefined();
});

test("TC-16.4 a guest can complete checkout through to the order confirmation", async ({ page }) => {
  await page.goto("/restaurants/dindigul-thalappakatti");
  await page
    .locator("#menu-categories li", { hasText: "Seeraga Samba Chicken Biryani" })
    .getByRole("button", { name: "Add" })
    .click();
  await page.goto("/basket");
  await page.getByRole("link", { name: "Checkout" }).click();

  await page.getByRole("group").getByRole("button", { name: "Continue as Guest" }).click();
  await page.getByLabel("Name").fill("Casual Visitor");
  await page.locator("form").getByRole("button", { name: "Continue as Guest" }).click();

  await expect(page).toHaveURL("/checkout");
  await page.getByRole("button", { name: "Place order" }).click();

  await expect(page).toHaveURL(/\/orders\/.+/);
  await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible();
  await expect(page.getByText("Seeraga Samba Chicken Biryani")).toBeVisible();
  await expect(page.getByText("Total: ₹273")).toBeVisible();
});
