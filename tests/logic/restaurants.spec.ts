import { test, expect } from "@playwright/test";
import { listRestaurants } from "../../src/lib/restaurants";

test("TC-2.2 search matches partial, case-insensitive text", async () => {
  const results = await listRestaurants("biryani");
  expect(results.map((r) => r.name)).toEqual(["Ranganathan Street Biryani"]);

  const upper = await listRestaurants("BIRYANI");
  expect(upper.map((r) => r.name)).toEqual(["Ranganathan Street Biryani"]);
});

test("TC-2.3 a blank search or no search returns everything", async () => {
  const blank = await listRestaurants("   ");
  const none = await listRestaurants(undefined);
  expect(blank.length).toBe(6);
  expect(none.length).toBe(6);
});

test("TC-2.6 special characters are matched literally, not as wildcards", async () => {
  await expect(listRestaurants("%")).resolves.toEqual([]);
  await expect(listRestaurants("_")).resolves.toEqual([]);
  await expect(listRestaurants("'")).resolves.toEqual([]);
});
