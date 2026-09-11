import { test, expect } from "@playwright/test";
import { getRestaurantMenu } from "../../src/lib/restaurants";
import { formatInr } from "../../src/lib/format";

test("TC-3.5 an empty category is dropped; an unknown restaurant returns nothing", async () => {
  const menu = await getRestaurantMenu("thyagaraya-filter-kaapi");
  expect(menu).not.toBeNull();
  expect(menu?.categories.map((c) => c.name)).not.toContain("Seasonal Specials");

  const unknown = await getRestaurantMenu("does-not-exist");
  expect(unknown).toBeNull();
});

test("TC-3.7 formatInr formats paise as rupees", () => {
  expect(formatInr(25000)).toBe("₹250");
  expect(formatInr(1250)).toBe("₹12.50");
  expect(formatInr(0)).toBe("₹0");
});
