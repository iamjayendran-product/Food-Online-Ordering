"use server";

import { getCurrentUser } from "@/lib/dal";
import { placeOrder, type PlaceOrderResult } from "@/lib/orders/place-order";
import { mockPaymentProvider } from "@/lib/payments/mock-provider";

export async function placeOrderAction(
  input: unknown,
): Promise<PlaceOrderResult | { status: "UNAUTHENTICATED" }> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "UNAUTHENTICATED" };
  }
  return placeOrder(user.id, input, mockPaymentProvider);
}
