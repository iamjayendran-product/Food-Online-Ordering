import { z } from "zod";
import { db } from "@/lib/db";
import { MAX_QTY } from "@/lib/basket";
import { GST_RATE } from "@/lib/pricing";
import type { PaymentProvider } from "@/lib/payments/types";

// .strict() so a browser-supplied price (or any other unrecognized field) on
// a line fails validation instead of being silently stripped — the server
// is the only source of truth for price.
const orderLineInputSchema = z
  .object({
    itemId: z.string().min(1),
    quantity: z.number().int().min(1).max(MAX_QTY),
  })
  .strict();

export const placeOrderInputSchema = z
  .object({
    restaurantSlug: z.string().min(1),
    items: z.array(orderLineInputSchema).min(1),
    expectedTotalPaise: z.number().int().nonnegative(),
    simulateSuccess: z.boolean(),
    // Absent/undefined = ASAP pickup. Structural validity only here — the
    // pickup-window business rule (future, within 7 days, 9am-10pm IST) is
    // checked separately so it can return its own INVALID_SCHEDULE status.
    scheduledFor: z.coerce.date().optional(),
  })
  .strict();

export type PlaceOrderInput = z.infer<typeof placeOrderInputSchema>;

export type PlaceOrderResult =
  | { status: "PLACED"; orderId: string; orderNumber: number }
  | { status: "PAYMENT_FAILED" }
  | { status: "ITEMS_UNAVAILABLE"; unavailableItemIds: string[] }
  | { status: "PRICE_CHANGED"; correctedLines: { itemId: string; unitPricePaise: number }[] }
  | { status: "INVALID_SCHEDULE" }
  | { status: "VALIDATION_ERROR" };

const SCHEDULE_MAX_DAYS_AHEAD = 7;
const SCHEDULE_WINDOW_START_HOUR = 9;
const SCHEDULE_WINDOW_END_HOUR = 22;

function isValidSchedule(scheduledFor: Date, now: Date): boolean {
  if (scheduledFor.getTime() <= now.getTime()) return false;
  const maxDate = new Date(now.getTime() + SCHEDULE_MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000);
  if (scheduledFor.getTime() > maxDate.getTime()) return false;

  const istHour = Number(
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      hour12: false,
    }).format(scheduledFor),
  );
  return istHour >= SCHEDULE_WINDOW_START_HOUR && istHour < SCHEDULE_WINDOW_END_HOUR;
}

export async function placeOrder(
  userId: string,
  rawInput: unknown,
  provider: PaymentProvider,
): Promise<PlaceOrderResult> {
  const parsed = placeOrderInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { status: "VALIDATION_ERROR" };
  }
  const input = parsed.data;

  if (input.scheduledFor && !isValidSchedule(input.scheduledFor, new Date())) {
    return { status: "INVALID_SCHEDULE" };
  }

  const restaurant = await db.restaurant.findUnique({ where: { slug: input.restaurantSlug } });
  if (!restaurant) {
    return { status: "ITEMS_UNAVAILABLE", unavailableItemIds: input.items.map((line) => line.itemId) };
  }

  const menuItems = await db.menuItem.findMany({
    where: { id: { in: input.items.map((line) => line.itemId) } },
  });
  const menuItemsById = new Map(menuItems.map((item) => [item.id, item]));

  // Unknown items, items from a different restaurant, and unavailable items
  // are all treated the same way: the customer can no longer order them.
  const unavailableItemIds = input.items
    .filter((line) => {
      const item = menuItemsById.get(line.itemId);
      return !item || item.restaurantId !== restaurant.id || !item.isAvailable;
    })
    .map((line) => line.itemId);

  if (unavailableItemIds.length > 0) {
    return { status: "ITEMS_UNAVAILABLE", unavailableItemIds };
  }

  const subtotalPaise = input.items.reduce((sum, line) => {
    const item = menuItemsById.get(line.itemId)!;
    return sum + item.pricePaise * line.quantity;
  }, 0);
  const gstPaise = Math.round(subtotalPaise * GST_RATE);
  const totalPaise = subtotalPaise + gstPaise;

  if (totalPaise !== input.expectedTotalPaise) {
    return {
      status: "PRICE_CHANGED",
      correctedLines: input.items.map((line) => ({
        itemId: line.itemId,
        unitPricePaise: menuItemsById.get(line.itemId)!.pricePaise,
      })),
    };
  }

  const order = await db.$transaction((tx) =>
    tx.order.create({
      data: {
        userId,
        restaurantId: restaurant.id,
        status: "PENDING_PAYMENT",
        subtotalPaise,
        gstPaise,
        totalPaise,
        paymentProvider: provider.name,
        scheduledFor: input.scheduledFor,
        items: {
          create: input.items.map((line) => {
            const item = menuItemsById.get(line.itemId)!;
            return {
              menuItemId: item.id,
              name: item.name,
              unitPricePaise: item.pricePaise,
              quantity: line.quantity,
              lineTotalPaise: item.pricePaise * line.quantity,
            };
          }),
        },
      },
    }),
  );

  // Charging happens outside the transaction — the order row (and its price
  // snapshot) must exist before we ever call out to a payment provider.
  const paymentResult = await provider.charge({ amountPaise: totalPaise, simulateSuccess: input.simulateSuccess });

  if (!paymentResult.success) {
    await db.order.update({ where: { id: order.id }, data: { status: "PAYMENT_FAILED" } });
    return { status: "PAYMENT_FAILED" };
  }

  await db.order.update({
    where: { id: order.id },
    data: { status: "PLACED", paymentRef: paymentResult.reference },
  });

  return { status: "PLACED", orderId: order.id, orderNumber: order.orderNumber };
}
