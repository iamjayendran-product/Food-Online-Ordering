import { test, expect } from "@playwright/test";
import { calculateTotals } from "../../src/lib/pricing";

test("TC-4.10 totals for ₹250 × 2 + ₹120", () => {
  const totals = calculateTotals([
    { unitPricePaise: 25000, quantity: 2 },
    { unitPricePaise: 12000, quantity: 1 },
  ]);
  expect(totals).toEqual({ subtotalPaise: 62000, gstPaise: 3100, totalPaise: 65100 });
});

test("TC-4.11 totals for ₹250 × 1", () => {
  const totals = calculateTotals([{ unitPricePaise: 25000, quantity: 1 }]);
  expect(totals).toEqual({ subtotalPaise: 25000, gstPaise: 1250, totalPaise: 26250 });
});
