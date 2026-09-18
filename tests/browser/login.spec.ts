import { test, expect } from "@playwright/test";
import { loginAs } from "../support/auth";

test("TC-1.1 log in with correct email and password", async ({ page }) => {
  await loginAs(page, "priya@example.com");
  await expect(page).toHaveURL("/");
  await expect(page.getByText("Hi Priya")).toBeVisible();
  await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
});

test("TC-1.2 correct email, wrong password shows a generic error", async ({ page, context }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("priya@example.com");
  await page.getByLabel("Password").fill("wrongpassword");
  await page.locator("form").getByRole("button", { name: "Log in" }).click();

  await expect(page.getByText("Invalid email or password.")).toBeVisible();
  const cookies = await context.cookies();
  expect(cookies.find((c) => c.name === "session")).toBeUndefined();
});

test("TC-1.3 unknown email shows the same generic error", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("nobody@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.locator("form").getByRole("button", { name: "Log in" }).click();

  await expect(page.getByText("Invalid email or password.")).toBeVisible();
});

test("TC-1.5 email with surrounding whitespace and mixed case still logs in", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("  Priya@Example.COM ");
  await page.getByLabel("Password").fill("password123");
  await page.locator("form").getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByText("Hi Priya")).toBeVisible();
});

test("TC-1.6 session survives a reload and a new tab", async ({ page, context }) => {
  await loginAs(page, "priya@example.com");
  await page.reload();
  await expect(page.getByText("Hi Priya")).toBeVisible();

  const secondPage = await context.newPage();
  await secondPage.goto("/");
  await expect(secondPage.getByText("Hi Priya")).toBeVisible();
});

test("TC-1.7 after logout, a protected route redirects to login", async ({ page }) => {
  await loginAs(page, "priya@example.com");
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();

  await page.goto("/checkout");
  await expect(page).toHaveURL("/login?next=%2Fcheckout");
});

test("TC-1.8 a signed-in customer visiting /login is redirected home", async ({ page }) => {
  await loginAs(page, "priya@example.com");
  await page.goto("/login");
  await expect(page).toHaveURL("/");
});

test("TC-1.9 an unsafe next parameter is ignored after login", async ({ page }) => {
  await page.goto("/login?next=%2F%2Fevil.com");
  await page.getByLabel("Email").fill("priya@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.locator("form").getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL("/");
});

test("TC-1.10 a tampered session cookie is treated as logged out", async ({ page, context }) => {
  await context.addCookies([
    { name: "session", value: "garbage.not-a-jwt.token", url: "http://localhost:3100" },
  ]);
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();

  await page.goto("/checkout");
  await expect(page).toHaveURL("/login?next=%2Fcheckout");
});

test("TC-1.12 the login page has no sign-up or forgot-password links", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("link", { name: /sign.?up/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /forgot/i })).toHaveCount(0);
});
