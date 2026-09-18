import { test, expect } from "@playwright/test";

test("TC-2.1 the home page lists all restaurants alphabetically with cuisine tags and a photo", async ({ page }) => {
  await page.goto("/");

  const headings = page.getByRole("heading", { level: 2 });
  await expect(headings).toHaveCount(10);
  const names = await headings.allTextContents();
  expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));

  // Scoped to the card: the discovery page's category browse chips (F14)
  // also render a "Biryani" chip, so an unscoped match would be ambiguous.
  await expect(
    page.getByRole("link", { name: /Dindigul Thalappakatti/ }).getByText("Biryani", { exact: true }),
  ).toBeVisible();

  // Every restaurant now has a real photo (F19) — a photo-less one is
  // excluded from discovery entirely rather than shown with a placeholder.
  const cards = page.locator("main a img");
  expect(await cards.count()).toBeGreaterThanOrEqual(10);
});

test("TC-2.4 a search with no results shows an empty state with a clear link", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Search restaurants").fill("pizza");
  await page.getByRole("button", { name: "Search" }).click();

  await expect(page.getByText('No restaurants match "pizza".')).toBeVisible();

  await page.getByRole("link", { name: "Clear search" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: "The Grand Sweets and Snacks" })).toBeVisible();
});

test("TC-2.5 the search term survives a reload; Back returns to the unfiltered list", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Search restaurants").fill("thalappakatti");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL("/?q=thalappakatti");
  await expect(page.getByRole("heading", { name: "Dindigul Thalappakatti" })).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Search restaurants")).toHaveValue("thalappakatti");
  await expect(page.getByRole("heading", { name: "Dindigul Thalappakatti" })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: "The Grand Sweets and Snacks" })).toBeVisible();
});

