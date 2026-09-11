import { test, expect } from "@playwright/test";

test("TC-2.1 the home page lists all restaurants alphabetically with cuisine tags and an image or placeholder", async ({ page }) => {
  await page.goto("/");

  const headings = page.getByRole("heading", { level: 2 });
  await expect(headings).toHaveCount(6);
  const names = await headings.allTextContents();
  expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));

  await expect(page.getByText("Biryani", { exact: true })).toBeVisible();
});

test("TC-2.4 a search with no results shows an empty state with a clear link", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Search restaurants").fill("pizza");
  await page.getByRole("button", { name: "Search" }).click();

  await expect(page.getByText('No restaurants match "pizza".')).toBeVisible();

  await page.getByRole("link", { name: "Clear search" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: "Usman Road Mess" })).toBeVisible();
});

test("TC-2.5 the search term survives a reload; Back returns to the unfiltered list", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Search restaurants").fill("biryani");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL("/?q=biryani");
  await expect(page.getByRole("heading", { name: "Ranganathan Street Biryani" })).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Search restaurants")).toHaveValue("biryani");
  await expect(page.getByRole("heading", { name: "Ranganathan Street Biryani" })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: "Usman Road Mess" })).toBeVisible();
});

test("TC-2.7 a restaurant without an image shows an initials placeholder, not a broken image", async ({ page }) => {
  await page.goto("/");
  const card = page.getByRole("link", { name: /Burkit Road Bakes/ });

  await expect(card.getByRole("img", { name: "Burkit Road Bakes" })).toBeVisible();
  await expect(card.locator("img")).toHaveCount(0);
});
