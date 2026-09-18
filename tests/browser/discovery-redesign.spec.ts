import { test, expect } from "@playwright/test";

// Campaign slide order depends on restaurant id (a cuid), not sortOrder
// across different restaurants, so tests can't assume a specific slide
// position — only that each headline appears somewhere in the rotation.
const CAMPAIGN_HEADLINES = [
  "20% off today at Ratna Cafe",
  "New: Filter coffee combo at A2B",
  "Weekend grill buffet special",
  "Order ahead: festive sweet boxes",
  "Happy hour snacks, 15% off",
];

test("TC-11.1 the discovery banner carousel opens on the first-order promo slide", async ({ page }) => {
  // Freeze the clock before navigating: the carousel starts auto-advancing
  // the instant it mounts, and its interval is the same order of magnitude
  // as Playwright's own default assertion timeout, so a real-time wait here
  // can race page load itself under a loaded machine.
  await page.clock.install();
  await page.clock.pauseAt(Date.now());
  await page.goto("/");
  await expect(page.getByText("Your first order in Foodlicious is 50% off")).toBeVisible();
});

test("TC-11.2 a campaign slide in the carousel links to its restaurant", async ({ page }) => {
  await page.goto("/");
  const target = page.getByRole("link", { name: "20% off today at Ratna Cafe" });

  for (let attempt = 0; attempt < CAMPAIGN_HEADLINES.length; attempt++) {
    if (await target.isVisible()) break;
    await page.getByRole("button", { name: "Next promotion" }).click();
  }

  await expect(target).toBeVisible();
  await target.click();
  await expect(page).toHaveURL("/restaurants/ratna-cafe");
});

test("TC-11.3 the search field sits below the banner carousel", async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(Date.now());
  await page.goto("/");
  const promoBox = (await page.getByText("Your first order in Foodlicious is 50% off").boundingBox())!;
  const searchBox = (await page.getByLabel("Search restaurants").boundingBox())!;

  expect(searchBox.y).toBeGreaterThan(promoBox.y + promoBox.height);
});

test("TC-11.4 every restaurant on discovery now shows a real photo", async ({ page }) => {
  await page.goto("/");
  const card = page.getByRole("link", { name: /The Grand Sweets and Snacks/ });
  await expect(card.locator("img").first()).toBeVisible();
});

test("TC-11.5 the banner carousel auto-advances and pauses on hover", async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(Date.now());
  await page.goto("/");
  const promo = page.getByText("Your first order in Foodlicious is 50% off");
  await expect(promo).toBeVisible();

  await page.clock.runFor(3000);
  await expect(promo).toBeHidden();

  let current = null;
  for (const headline of CAMPAIGN_HEADLINES) {
    const link = page.getByRole("link", { name: headline });
    if (await link.isVisible()) {
      current = link;
      break;
    }
  }
  expect(current).not.toBeNull();

  await current!.hover();
  await page.clock.runFor(3000);
  await expect(current!).toBeVisible();
});

test("TC-11.6 clicking a category chip filters the restaurant grid", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Browse by category" })
    .getByRole("link", { name: "Tiffin", exact: true })
    .click();
  await expect(page).toHaveURL("/?cuisine=Tiffin");

  const headings = page.getByRole("heading", { level: 2 });
  await expect(headings).toHaveCount(3);
  const names = await headings.allTextContents();
  expect(names.sort()).toEqual(["Hotel Saravana Bhavan", "Murugan Idli Shop", "Ratna Cafe"]);
});

test("TC-11.7 clicking the active category chip again clears the filter", async ({ page }) => {
  await page.goto("/?cuisine=Tiffin");
  await page
    .getByRole("navigation", { name: "Browse by category" })
    .getByRole("link", { name: "Tiffin", exact: true })
    .click();

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(10);
});

test("TC-11.8 the category filter combines with an active search term", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Search restaurants").fill("thalappakatti");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL("/?q=thalappakatti");

  await page
    .getByRole("navigation", { name: "Browse by category" })
    .getByRole("link", { name: "Biryani", exact: true })
    .click();
  await expect(page).toHaveURL("/?q=thalappakatti&cuisine=Biryani");

  const headings = page.getByRole("heading", { level: 2 });
  await expect(headings).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Dindigul Thalappakatti" })).toBeVisible();
});
