import { test, expect } from "@playwright/test";
import { loginAs } from "../support/auth";
import { testDb } from "../support/db";

test("TC-7.1 a store card shows a star rating and the number of reviews", async ({ page }) => {
  await page.goto("/");
  const card = page.getByRole("link", { name: /Hotel Saravana Bhavan/ });

  await expect(card.getByRole("img", { name: "Rated 4.7 out of 5 from 812 reviews" })).toBeVisible();
  await expect(card.getByText("4.7", { exact: true })).toBeVisible();
  await expect(card.getByText("(812)", { exact: true })).toBeVisible();
});

test("TC-7.2 a store card shows its own pickup time in minutes", async ({ page }) => {
  await page.goto("/");

  // Dynamic per store, not a fixed label.
  await expect(page.getByRole("link", { name: /Absolute Barbecues/ }).getByText("28 mins")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /The Grand Sweets and Snacks/ }).getByText("9 mins"),
  ).toBeVisible();
});

test("TC-7.3 store cards mark vegetarian and non-vegetarian kitchens", async ({ page }) => {
  await page.goto("/");

  // Every dish at Saravana Bhavan is vegetarian; Thalappakatti serves meat.
  await expect(
    page.getByRole("link", { name: /Hotel Saravana Bhavan/ }).getByRole("img", { name: "Vegetarian" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("link", { name: /Dindigul Thalappakatti/ })
      .getByRole("img", { name: "Non-vegetarian" }),
  ).toBeVisible();
});

test("TC-7.4 a store card carousel moves between photos without leaving the page", async ({ page }) => {
  await page.goto("/");
  const card = page.getByRole("link", { name: /Dindigul Thalappakatti/ });

  await expect(
    card.getByRole("img", { name: "Dindigul Thalappakatti photo 1 of 3" }),
  ).toBeVisible();

  await card.getByRole("button", { name: "Next photo" }).click();
  await expect(
    card.getByRole("img", { name: "Dindigul Thalappakatti photo 2 of 3" }),
  ).toBeVisible();
  await expect(page).toHaveURL("/");

  await card.getByRole("button", { name: "Previous photo" }).click();
  await expect(
    card.getByRole("img", { name: "Dindigul Thalappakatti photo 1 of 3" }),
  ).toBeVisible();
});

test("TC-7.5 a signed-in customer can favourite a store and it survives a reload", async ({ page }) => {
  await loginAs(page, "priya@example.com");
  await page.goto("/");

  await page.getByRole("button", { name: "Add Ratna Cafe to favourites" }).click();
  await expect(
    page.getByRole("button", { name: "Remove Ratna Cafe from favourites" }),
  ).toBeVisible();

  // The real check: it came from the database, not component state.
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Remove Ratna Cafe from favourites" }),
  ).toBeVisible();

  // Put the shared seed data back the way it was found.
  await page.getByRole("button", { name: "Remove Ratna Cafe from favourites" }).click();
  await expect(
    page.getByRole("button", { name: "Add Ratna Cafe to favourites" }),
  ).toBeVisible();
});

test("TC-7.6 a logged-out visitor who favourites a store is asked to log in", async ({ page }) => {
  const restaurant = await testDb.restaurant.findFirstOrThrow({
    where: { name: "Hotel Saravana Bhavan" },
  });
  const beforeCount = await testDb.favorite.count({ where: { restaurantId: restaurant.id } });

  await page.goto("/");
  await page.getByRole("button", { name: "Add Hotel Saravana Bhavan to favourites" }).click();
  await expect(page).toHaveURL(/\/login/);

  // The click must not have favourited the restaurant for anyone.
  expect(await testDb.favorite.count({ where: { restaurantId: restaurant.id } })).toBe(beforeCount);
});

test("TC-7.7 every menu item shows a photo", async ({ page }) => {
  await page.goto("/restaurants/dindigul-thalappakatti");

  const row = page.locator("#menu-categories li", { hasText: "Seeraga Samba Chicken Biryani" });
  await expect(row.locator("img")).toHaveCount(1);

  // No item is left without one.
  const rows = page.locator("#menu-categories li");
  const rowCount = await rows.count();
  const images = page.locator("#menu-categories li img");
  expect(await images.count()).toBe(rowCount);
});

test("TC-7.10 a menu item photo that fails to load is removed, not shown broken", async ({ page }) => {
  // Ratna Cafe's "Tea" is the item the F26 bug fix was spotted on — its seed
  // photo now resolves correctly, so this aborts the request before the page
  // ever loads it, simulating a future failure rather than relying on a URL
  // that's expected to be broken. Routed before navigating so there's no
  // chance of the browser serving an already-cached copy on a reload.
  await page.route("**/photo-1544787219-7f47ccb76574*", (route) => route.abort());
  await page.goto("/restaurants/ratna-cafe");

  // Not `{ hasText: "Tea" }` on its own: "Sambar Idli"'s description
  // ("Steamed rice...") contains "tea" as a substring ("S-tea-med") and
  // sorts earlier in the DOM, so a loose substring match silently grabs the
  // wrong row.
  const row = page.locator("#menu-categories li").filter({ has: page.getByText("Tea", { exact: true }) });
  await expect(row.locator("img")).toHaveCount(0);
  await expect(row.getByText("Milk tea.")).toBeVisible();
});

test("TC-7.9 the application is branded Foodlicious", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Foodlicious");
  await expect(page.getByRole("link", { name: "Foodlicious" })).toBeVisible();
});
