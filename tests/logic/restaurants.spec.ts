import { test, expect } from "@playwright/test";
import { testDb } from "../support/db";
import { listRestaurants } from "../../src/lib/restaurants";

test("TC-2.2 search matches partial, case-insensitive text", async () => {
  const results = await listRestaurants("thalappakatti");
  expect(results.map((r) => r.name)).toEqual(["Dindigul Thalappakatti"]);

  const upper = await listRestaurants("THALAPPAKATTI");
  expect(upper.map((r) => r.name)).toEqual(["Dindigul Thalappakatti"]);
});

test("TC-2.3 a blank search or no search returns everything", async () => {
  const blank = await listRestaurants("   ");
  const none = await listRestaurants(undefined);
  expect(blank.length).toBe(10);
  expect(none.length).toBe(10);
});

test("TC-2.7 a restaurant with no photos is excluded from discovery", async () => {
  const restaurant = await testDb.restaurant.create({
    data: {
      slug: "temp-no-photo-restaurant",
      name: "Zzz Temp No Photo Restaurant",
      cuisines: ["Test"],
      address: "Test Address, T Nagar, Chennai",
      images: [],
    },
  });
  try {
    const results = await listRestaurants();
    expect(results.some((r) => r.id === restaurant.id)).toBe(false);
    expect(results.length).toBe(10);
  } finally {
    await testDb.restaurant.delete({ where: { id: restaurant.id } });
  }
});

test("TC-2.6 special characters are matched literally, not as wildcards", async () => {
  await expect(listRestaurants("%")).resolves.toEqual([]);
  await expect(listRestaurants("_")).resolves.toEqual([]);
  await expect(listRestaurants("'")).resolves.toEqual([]);
});

test("TC-11.9 filtering by cuisine narrows results and combines with a name search", async () => {
  const tiffin = await listRestaurants(undefined, "Tiffin");
  expect(tiffin.map((r) => r.name).sort()).toEqual([
    "Hotel Saravana Bhavan",
    "Murugan Idli Shop",
    "Ratna Cafe",
  ]);

  const combined = await listRestaurants("ratna", "Tiffin");
  expect(combined.map((r) => r.name)).toEqual(["Ratna Cafe"]);

  const noMatch = await listRestaurants("ratna", "Barbecue");
  expect(noMatch).toEqual([]);
});
