import { test, expect } from "@playwright/test";

test("TC-8.1 the search field's placeholder invites searching items and cuisines too", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByLabel("Search restaurants")).toHaveAttribute(
    "placeholder",
    "Search restaurants, items, cuisines...",
  );
});

test("TC-8.2 the home page shows a campaigns marquee with a seeded headline", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "20% off today at Ratna Cafe" }).first()).toBeVisible();
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

test("TC-8.4 the campaigns marquee pauses its scroll animation on hover", async ({ page }) => {
  await page.goto("/");
  const track = page.getByRole("link", { name: "20% off today at Ratna Cafe" }).first().locator("..");

  const playingState = await track.evaluate((el) => getComputedStyle(el).animationPlayState);
  expect(playingState).toBe("running");

  // force: true — the track is continuously translating via CSS animation,
  // so Playwright's actionability check (which waits for the target to be
  // visually stable) would otherwise never resolve. This is a hover-state
  // assertion, not a click, so skipping that wait is safe here.
  await track.hover({ force: true });
  const pausedState = await track.evaluate((el) => getComputedStyle(el).animationPlayState);
  expect(pausedState).toBe("paused");
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
  await page.goto("/restaurants/the-grand-sweets-and-snacks");

  await expect(page.getByRole("img", { name: /banner photo/ })).toHaveCount(0);
});
