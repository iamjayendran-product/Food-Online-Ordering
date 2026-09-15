import { test, expect } from "@playwright/test";
import { loginAs } from "../support/auth";
import { testDb } from "../support/db";

test("TC-7.1 a store card shows a star rating and the number of reviews", async ({ page }) => {
  await page.goto("/");
  const card = page.getByRole("link", { name: /Usman Road Mess/ });

  await expect(card.getByRole("img", { name: "Rated 4.7 out of 5 from 741 reviews" })).toBeVisible();
  await expect(card.getByText("4.7", { exact: true })).toBeVisible();
  await expect(card.getByText("(741)", { exact: true })).toBeVisible();
});

test("TC-7.2 a store card shows its own pickup time in minutes", async ({ page }) => {
  await page.goto("/");

  // Dynamic per store, not a fixed label.
  await expect(page.getByRole("link", { name: /Usman Road Mess/ }).getByText("22 mins")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Thyagaraya Filter Kaapi/ }).getByText("6 mins"),
  ).toBeVisible();
});

test("TC-7.3 store cards mark vegetarian and non-vegetarian kitchens", async ({ page }) => {
  await page.goto("/");

  // Every dish at the mess is vegetarian; the biryani house serves meat.
  await expect(
    page.getByRole("link", { name: /Usman Road Mess/ }).getByRole("img", { name: "Vegetarian" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("link", { name: /Ranganathan Street Biryani/ })
      .getByRole("img", { name: "Non-vegetarian" }),
  ).toBeVisible();
});

test("TC-7.4 a store card carousel moves between photos without leaving the page", async ({ page }) => {
  await page.goto("/");
  const card = page.getByRole("link", { name: /Ranganathan Street Biryani/ });

  await expect(
    card.getByRole("img", { name: "Ranganathan Street Biryani photo 1 of 3" }),
  ).toBeVisible();

  await card.getByRole("button", { name: "Next photo" }).click();
  await expect(
    card.getByRole("img", { name: "Ranganathan Street Biryani photo 2 of 3" }),
  ).toBeVisible();
  await expect(page).toHaveURL("/");

  await card.getByRole("button", { name: "Previous photo" }).click();
  await expect(
    card.getByRole("img", { name: "Ranganathan Street Biryani photo 1 of 3" }),
  ).toBeVisible();
});

test("TC-7.5 a signed-in customer can favourite a store and it survives a reload", async ({ page }) => {
  await loginAs(page, "priya@example.com");
  await page.goto("/");

  await page.getByRole("button", { name: "Add Panagal Park Chaat Corner to favourites" }).click();
  await expect(
    page.getByRole("button", { name: "Remove Panagal Park Chaat Corner from favourites" }),
  ).toBeVisible();

  // The real check: it came from the database, not component state.
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Remove Panagal Park Chaat Corner from favourites" }),
  ).toBeVisible();

  // Put the shared seed data back the way it was found.
  await page.getByRole("button", { name: "Remove Panagal Park Chaat Corner from favourites" }).click();
  await expect(
    page.getByRole("button", { name: "Add Panagal Park Chaat Corner to favourites" }),
  ).toBeVisible();
});

test("TC-7.6 a logged-out visitor who favourites a store is asked to log in", async ({ page }) => {
  const restaurant = await testDb.restaurant.findFirstOrThrow({
    where: { name: "Usman Road Mess" },
  });
  const beforeCount = await testDb.favorite.count({ where: { restaurantId: restaurant.id } });

  await page.goto("/");
  await page.getByRole("button", { name: "Add Usman Road Mess to favourites" }).click();
  await expect(page).toHaveURL(/\/login/);

  // The click must not have favourited the restaurant for anyone.
  expect(await testDb.favorite.count({ where: { restaurantId: restaurant.id } })).toBe(beforeCount);
});

test("TC-7.7 every menu item shows a photo", async ({ page }) => {
  await page.goto("/restaurants/ranganathan-street-biryani");

  const row = page.locator("#menu-categories li", { hasText: "Chicken Biryani" });
  await expect(row.locator("img")).toHaveCount(1);

  // No item is left without one.
  const rows = page.locator("#menu-categories li");
  const rowCount = await rows.count();
  const images = page.locator("#menu-categories li img");
  expect(await images.count()).toBe(rowCount);
});

test("TC-7.8 the menu opens with a Recommended section", async ({ page }) => {
  await page.goto("/restaurants/ranganathan-street-biryani");

  await expect(page.getByRole("heading", { level: 2 }).first()).toHaveText("Recommended");

  // A recommended dish deliberately appears twice: once in the shortcut and
  // once in its own category.
  await expect(page.getByText("Chicken Biryani", { exact: true })).toHaveCount(2);

  // Gobi Manchurian is marked recommended in the seed data too, but it's
  // unavailable — it must be excluded from the Recommended shortcut and
  // appear only once, in its own category.
  await expect(page.getByText("Gobi Manchurian", { exact: true })).toHaveCount(1);
  await expect(
    page.locator("#menu-categories li", { hasText: "Gobi Manchurian" }),
  ).toHaveCount(1);
});

test("TC-7.9 the application is branded FoodStation", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("FoodStation");
  await expect(page.getByRole("link", { name: "FoodStation" })).toBeVisible();
});
