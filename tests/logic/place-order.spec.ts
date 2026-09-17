import { test, expect } from "@playwright/test";
import { testDb } from "../support/db";
import { placeOrder } from "../../src/lib/orders/place-order";
import { mockPaymentProvider } from "../../src/lib/payments/mock-provider";

async function getPriya() {
  return testDb.user.findUniqueOrThrow({ where: { email: "priya@example.com" } });
}

async function getBiryaniItems() {
  const restaurant = await testDb.restaurant.findUniqueOrThrow({
    where: { slug: "dindigul-thalappakatti" },
  });
  const chicken = await testDb.menuItem.findFirstOrThrow({
    where: { restaurantId: restaurant.id, name: "Seeraga Samba Chicken Biryani" },
  });
  const unavailable = await testDb.menuItem.findFirstOrThrow({
    where: { restaurantId: restaurant.id, name: "Gobi Manchurian" },
  });
  return { restaurant, chicken, unavailable };
}

test("TC-6.1 a valid order is placed with current menu prices, item snapshots, and a mock_ payment reference", async () => {
  const user = await getPriya();
  const { restaurant, chicken } = await getBiryaniItems();

  const result = await placeOrder(
    user.id,
    {
      restaurantSlug: restaurant.slug,
      items: [{ itemId: chicken.id, quantity: 2 }],
      expectedTotalPaise: Math.round(chicken.pricePaise * 2 * 1.05),
      paymentMethod: "ONLINE",
      simulateSuccess: true,
    },
    mockPaymentProvider,
  );

  expect(result.status).toBe("PLACED");
  if (result.status !== "PLACED") return;

  const order = await testDb.order.findUniqueOrThrow({
    where: { id: result.orderId },
    include: { items: true },
  });
  expect(order.status).toBe("PLACED");
  expect(order.items).toHaveLength(1);
  expect(order.items[0].name).toBe("Seeraga Samba Chicken Biryani");
  expect(order.items[0].unitPricePaise).toBe(chicken.pricePaise);
  expect(order.paymentRef).toMatch(/^mock_/);
});

test("TC-6.2 a browser-supplied price on a line is rejected with no order created", async () => {
  const user = await getPriya();
  const { restaurant, chicken } = await getBiryaniItems();
  const before = await testDb.order.count();

  const result = await placeOrder(
    user.id,
    {
      restaurantSlug: restaurant.slug,
      items: [{ itemId: chicken.id, quantity: 1, unitPricePaise: 1 }],
      expectedTotalPaise: Math.round(chicken.pricePaise * 1.05),
      paymentMethod: "ONLINE",
      simulateSuccess: true,
    },
    mockPaymentProvider,
  );

  expect(result.status).toBe("VALIDATION_ERROR");
  expect(await testDb.order.count()).toBe(before);
});

test("TC-6.3 a failed payment marks the order payment-failed", async () => {
  const user = await getPriya();
  const { restaurant, chicken } = await getBiryaniItems();

  const result = await placeOrder(
    user.id,
    {
      restaurantSlug: restaurant.slug,
      items: [{ itemId: chicken.id, quantity: 1 }],
      expectedTotalPaise: Math.round(chicken.pricePaise * 1.05),
      paymentMethod: "ONLINE",
      simulateSuccess: false,
    },
    mockPaymentProvider,
  );

  expect(result.status).toBe("PAYMENT_FAILED");
});

test("TC-6.4 an item that became unavailable is rejected with no order", async () => {
  const user = await getPriya();
  const { restaurant, unavailable } = await getBiryaniItems();

  const result = await placeOrder(
    user.id,
    {
      restaurantSlug: restaurant.slug,
      items: [{ itemId: unavailable.id, quantity: 1 }],
      expectedTotalPaise: Math.round(unavailable.pricePaise * 1.05),
      paymentMethod: "ONLINE",
      simulateSuccess: true,
    },
    mockPaymentProvider,
  );

  expect(result).toEqual({ status: "ITEMS_UNAVAILABLE", unavailableItemIds: [unavailable.id] });
});

test("TC-6.5 items from two restaurants, or an unknown item, are rejected as unavailable", async () => {
  const user = await getPriya();
  const { restaurant, chicken } = await getBiryaniItems();
  const other = await testDb.restaurant.findUniqueOrThrow({ where: { slug: "hotel-saravana-bhavan" } });
  const otherItem = await testDb.menuItem.findFirstOrThrow({ where: { restaurantId: other.id } });

  const crossRestaurant = await placeOrder(
    user.id,
    {
      restaurantSlug: restaurant.slug,
      items: [
        { itemId: chicken.id, quantity: 1 },
        { itemId: otherItem.id, quantity: 1 },
      ],
      expectedTotalPaise: 0,
      paymentMethod: "ONLINE",
      simulateSuccess: true,
    },
    mockPaymentProvider,
  );
  expect(crossRestaurant.status).toBe("ITEMS_UNAVAILABLE");

  const unknownItem = await placeOrder(
    user.id,
    {
      restaurantSlug: restaurant.slug,
      items: [{ itemId: "does-not-exist", quantity: 1 }],
      expectedTotalPaise: 0,
      paymentMethod: "ONLINE",
      simulateSuccess: true,
    },
    mockPaymentProvider,
  );
  expect(unknownItem.status).toBe("ITEMS_UNAVAILABLE");
});

test("TC-6.6 a stale total is rejected as a price change, with the current price returned", async () => {
  const user = await getPriya();
  const { restaurant, chicken } = await getBiryaniItems();

  const result = await placeOrder(
    user.id,
    {
      restaurantSlug: restaurant.slug,
      items: [{ itemId: chicken.id, quantity: 1 }],
      expectedTotalPaise: 100,
      paymentMethod: "ONLINE",
      simulateSuccess: true,
    },
    mockPaymentProvider,
  );

  expect(result).toEqual({
    status: "PRICE_CHANGED",
    correctedLines: [{ itemId: chicken.id, unitPricePaise: chicken.pricePaise }],
  });
});

test("TC-6.7 invalid quantities and an empty basket are rejected as validation errors", async () => {
  const user = await getPriya();
  const { restaurant, chicken } = await getBiryaniItems();

  for (const quantity of [0, -1, 11, 1.5]) {
    const result = await placeOrder(
      user.id,
      {
        restaurantSlug: restaurant.slug,
        items: [{ itemId: chicken.id, quantity }],
        expectedTotalPaise: 0,
        paymentMethod: "ONLINE",
        simulateSuccess: true,
      },
      mockPaymentProvider,
    );
    expect(result.status).toBe("VALIDATION_ERROR");
  }

  const emptyBasket = await placeOrder(
    user.id,
    { restaurantSlug: restaurant.slug, items: [], expectedTotalPaise: 0, paymentMethod: "ONLINE", simulateSuccess: true },
    mockPaymentProvider,
  );
  expect(emptyBasket.status).toBe("VALIDATION_ERROR");
});

test("TC-6.9 two successful orders get unique, increasing order numbers", async () => {
  const user = await getPriya();
  const { restaurant, chicken } = await getBiryaniItems();
  const input = {
    restaurantSlug: restaurant.slug,
    items: [{ itemId: chicken.id, quantity: 1 }],
    expectedTotalPaise: Math.round(chicken.pricePaise * 1.05),
    paymentMethod: "ONLINE",
    simulateSuccess: true,
  };

  const first = await placeOrder(user.id, input, mockPaymentProvider);
  const second = await placeOrder(user.id, input, mockPaymentProvider);

  expect(first.status).toBe("PLACED");
  expect(second.status).toBe("PLACED");
  if (first.status !== "PLACED" || second.status !== "PLACED") return;

  expect(second.orderNumber).toBeGreaterThan(first.orderNumber);
});

test("TC-10.3 a cash order is placed outright, with no charge attempted, even when simulateSuccess is false", async () => {
  const user = await getPriya();
  const { restaurant, chicken } = await getBiryaniItems();

  const result = await placeOrder(
    user.id,
    {
      restaurantSlug: restaurant.slug,
      items: [{ itemId: chicken.id, quantity: 1 }],
      expectedTotalPaise: Math.round(chicken.pricePaise * 1.05),
      paymentMethod: "CASH",
      simulateSuccess: false,
    },
    mockPaymentProvider,
  );

  expect(result.status).toBe("PLACED");
  if (result.status !== "PLACED") return;

  const order = await testDb.order.findUniqueOrThrow({ where: { id: result.orderId } });
  expect(order.status).toBe("PLACED");
  expect(order.paymentMethod).toBe("CASH");
  expect(order.paymentProvider).toBe("cash");
  expect(order.paymentRef).toBeNull();
});

test("TC-9.2 a past scheduledFor is rejected as an invalid schedule", async () => {
  const user = await getPriya();
  const { restaurant, chicken } = await getBiryaniItems();
  const before = await testDb.order.count();

  const result = await placeOrder(
    user.id,
    {
      restaurantSlug: restaurant.slug,
      items: [{ itemId: chicken.id, quantity: 1 }],
      expectedTotalPaise: Math.round(chicken.pricePaise * 1.05),
      paymentMethod: "ONLINE",
      simulateSuccess: true,
      scheduledFor: new Date(Date.now() - 60_000).toISOString(),
    },
    mockPaymentProvider,
  );

  expect(result.status).toBe("INVALID_SCHEDULE");
  expect(await testDb.order.count()).toBe(before);
});

test("TC-9.3 a scheduledFor outside the pickup window, or more than 7 days out, is rejected", async () => {
  const user = await getPriya();
  const { restaurant, chicken } = await getBiryaniItems();
  const input = {
    restaurantSlug: restaurant.slug,
    items: [{ itemId: chicken.id, quantity: 1 }],
    expectedTotalPaise: Math.round(chicken.pricePaise * 1.05),
    paymentMethod: "ONLINE",
    simulateSuccess: true,
  };

  // 2 days out, but at 3am IST — well inside the 7-day window, outside the
  // 9am-10pm one. The explicit +05:30 offset makes this unambiguous
  // regardless of the machine running the test.
  const twoDaysOut = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const outsideWindow = await placeOrder(
    user.id,
    { ...input, scheduledFor: `${twoDaysOut}T03:00:00+05:30` },
    mockPaymentProvider,
  );
  expect(outsideWindow.status).toBe("INVALID_SCHEDULE");

  const tooFarAhead = await placeOrder(
    user.id,
    { ...input, scheduledFor: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString() },
    mockPaymentProvider,
  );
  expect(tooFarAhead.status).toBe("INVALID_SCHEDULE");
});
