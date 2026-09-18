import { test, expect } from "@playwright/test";
import { testDb } from "../support/db";

test("TC-8.1 the search field's placeholder invites searching items and cuisines too", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByLabel("Search restaurants")).toHaveAttribute(
    "placeholder",
    "Search restaurants, items, cuisines...",
  );
});

test("TC-8.3 hovering a card carousel advances its photo without a click", async ({ page }) => {
  // Freeze the clock before navigating: the home page now also runs the
  // discovery banner's own auto-advancing carousel (F14) as a second
  // real-time interval, so pausing only after the page loads is no longer
  // reliably "the past" relative to that interval's own real-time tracking.
  // Pausing up front avoids the ambiguity entirely.
  await page.clock.install();
  await page.clock.pauseAt(Date.now());
  await page.goto("/");
  const card = page.getByRole("link", { name: /Dindigul Thalappakatti/ });

  await expect(card.getByRole("img", { name: "Dindigul Thalappakatti photo 1 of 3" })).toBeVisible();

  await card.hover();
  await page.clock.runFor(900);

  await expect(card.getByRole("img", { name: "Dindigul Thalappakatti photo 2 of 3" })).toBeVisible();
  await expect(page).toHaveURL("/");
});

test("TC-8.5 a restaurant with photos shows an auto-advancing hero banner", async ({ page }) => {
  // Freeze the clock before navigating, same reasoning as TC-8.3 — a
  // real-time wait after the page loads can still race the auto-advance
  // interval, which starts ticking the instant the banner mounts.
  await page.clock.install();
  await page.clock.pauseAt(Date.now());
  await page.goto("/restaurants/dindigul-thalappakatti");

  await expect(
    page.getByRole("img", { name: "Dindigul Thalappakatti banner photo 1 of 3" }),
  ).toBeVisible();

  await page.clock.runFor(4000);

  await expect(
    page.getByRole("img", { name: "Dindigul Thalappakatti banner photo 2 of 3" }),
  ).toBeVisible();
});

test("TC-8.6 a restaurant with no photos shows no hero banner", async ({ page }) => {
  // Every seeded restaurant has photos now (F19) — a photo-less one is
  // excluded from discovery entirely, but its own page must still degrade
  // gracefully if reached directly, so this constructs one to prove that.
  const restaurant = await testDb.restaurant.create({
    data: {
      slug: "temp-no-photo-restaurant-page",
      name: "Zzz Temp No Photo Restaurant Page",
      cuisines: ["Test"],
      address: "Test Address, T Nagar, Chennai",
      images: [],
    },
  });
  try {
    await page.goto(`/restaurants/${restaurant.slug}`);
    await expect(page.getByRole("img", { name: /banner photo/ })).toHaveCount(0);

    // The gradient-fallback banner must still host the store info, not
    // render an empty gap.
    await expect(
      page.getByRole("heading", { level: 1, name: "Zzz Temp No Photo Restaurant Page" }),
    ).toBeVisible();
    await expect(page.getByText("Test Address, T Nagar, Chennai")).toBeVisible();
  } finally {
    await testDb.restaurant.delete({ where: { id: restaurant.id } });
  }
});
