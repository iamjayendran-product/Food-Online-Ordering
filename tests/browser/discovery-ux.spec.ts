import { test, expect } from "@playwright/test";

test("TC-8.1 the search field's placeholder invites searching items and cuisines too", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByLabel("Search restaurants")).toHaveAttribute(
    "placeholder",
    "Search restaurants, items, cuisines...",
  );
});

test("TC-8.3 hovering a card carousel advances its photo without a click", async ({ page }) => {
  // A fake clock makes the auto-advance deterministic: waiting a real
  // wall-clock margin around the interval is racy under a loaded machine
  // (page/network load alone can eat past the margin). `install()` on its
  // own keeps timers ticking in real time — only `pauseAt` actually freezes
  // the clock — so we let the page load for real, then pause and
  // fast-forward virtual time by exactly one interval.
  await page.clock.install();
  await page.goto("/");
  const card = page.getByRole("link", { name: /Dindigul Thalappakatti/ });

  await expect(card.getByRole("img", { name: "Dindigul Thalappakatti photo 1 of 3" })).toBeVisible();
  await page.clock.pauseAt(Date.now());

  await card.hover();
  await page.clock.runFor(900);

  await expect(card.getByRole("img", { name: "Dindigul Thalappakatti photo 2 of 3" })).toBeVisible();
  await expect(page).toHaveURL("/");
});

test("TC-8.5 a restaurant with photos shows an auto-advancing hero banner", async ({ page }) => {
  // Same reasoning as TC-8.3: a real-time wait raced page load itself under
  // load (observed flake — the banner had already advanced twice by the
  // time the first assertion polled, because `install()` alone doesn't
  // freeze time). Pause the clock once the page has actually loaded, then
  // fast-forward deterministically.
  await page.clock.install();
  await page.goto("/restaurants/dindigul-thalappakatti");

  await expect(
    page.getByRole("img", { name: "Dindigul Thalappakatti banner photo 1 of 3" }),
  ).toBeVisible();
  await page.clock.pauseAt(Date.now());

  await page.clock.runFor(4000);

  await expect(
    page.getByRole("img", { name: "Dindigul Thalappakatti banner photo 2 of 3" }),
  ).toBeVisible();
});

test("TC-8.6 a restaurant with no photos shows no hero banner", async ({ page }) => {
  await page.goto("/restaurants/pakwan");

  await expect(page.getByRole("img", { name: /banner photo/ })).toHaveCount(0);
});
