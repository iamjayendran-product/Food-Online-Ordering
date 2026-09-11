import type { Page } from "@playwright/test";

// Logs in through the real /login form (built in F1) rather than seeding a
// session cookie directly, so tests exercise the same path a user takes.
export async function loginAs(page: Page, email: string, password = "password123") {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
}
