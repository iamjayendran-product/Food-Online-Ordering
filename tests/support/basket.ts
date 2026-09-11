import type { Page } from "@playwright/test";

// Key under which BasketProvider (built in F4) persists the basket.
export const BASKET_STORAGE_KEY = "tnagar-basket";

// Seeds localStorage before any page script runs, so BasketProvider picks
// this up on its very first mount instead of starting from an empty basket.
export async function setStoredBasket(page: Page, basket: unknown) {
  await page.addInitScript(
    ([key, value]) => {
      window.localStorage.setItem(key as string, value as string);
    },
    [BASKET_STORAGE_KEY, JSON.stringify(basket)] as const,
  );
}
