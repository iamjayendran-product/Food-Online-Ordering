"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useBasket } from "@/components/basket-provider";
import { calculateTotals } from "@/lib/pricing";
import { formatInr } from "@/lib/format";
import { placeOrderAction } from "./actions";

export function CheckoutView() {
  const router = useRouter();
  const { basket, hydrated, remove, clear, refreshBasket } = useBasket();
  const [paymentChoice, setPaymentChoice] = useState<"success" | "failure">("success");
  const [pending, setPending] = useState(false);
  const [unavailableItemIds, setUnavailableItemIds] = useState<string[]>([]);
  const [priceNotice, setPriceNotice] = useState(false);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
  // A ref, not state: state updates aren't guaranteed to commit before a
  // near-simultaneous second click reaches this handler, which would let a
  // stale closure's `pending` check pass. The ref is set synchronously.
  const payingRef = useRef(false);
  // Clearing the basket on a successful order also makes lines.length hit 0
  // on this page, which would otherwise race the "empty basket" redirect
  // below against the navigation to the confirmation page.
  const hasPlacedOrderRef = useRef(false);

  useEffect(() => {
    if (hydrated && basket.lines.length === 0 && !hasPlacedOrderRef.current) {
      router.replace("/basket");
    }
  }, [hydrated, basket.lines.length, router]);

  if (!hydrated || basket.lines.length === 0 || !basket.restaurantSlug) {
    return null;
  }

  const totals = calculateTotals(basket.lines);

  async function handlePay() {
    if (payingRef.current) return;
    payingRef.current = true;
    setPending(true);
    setFailureMessage(null);

    const result = await placeOrderAction({
      restaurantSlug: basket.restaurantSlug,
      items: basket.lines.map((line) => ({ itemId: line.itemId, quantity: line.quantity })),
      expectedTotalPaise: totals.totalPaise,
      simulateSuccess: paymentChoice === "success",
    });

    if (result.status === "UNAUTHENTICATED") {
      payingRef.current = false;
      router.push("/login?next=%2Fcheckout");
      return;
    }

    if (result.status === "PLACED") {
      hasPlacedOrderRef.current = true;
      clear();
      router.push(`/orders/${result.orderId}`);
      return;
    }

    if (result.status === "PAYMENT_FAILED") {
      payingRef.current = false;
      setFailureMessage("Payment failed. You have not been charged. Please try again.");
      setPending(false);
      return;
    }

    if (result.status === "ITEMS_UNAVAILABLE") {
      payingRef.current = false;
      setUnavailableItemIds(result.unavailableItemIds);
      setPending(false);
      return;
    }

    if (result.status === "PRICE_CHANGED") {
      payingRef.current = false;
      const correctedByItemId = new Map(result.correctedLines.map((line) => [line.itemId, line.unitPricePaise]));
      refreshBasket({
        ...basket,
        lines: basket.lines.map((line) =>
          correctedByItemId.has(line.itemId)
            ? { ...line, unitPricePaise: correctedByItemId.get(line.itemId)! }
            : line,
        ),
      });
      setPriceNotice(true);
      setPending(false);
      return;
    }

    payingRef.current = false;
    setFailureMessage("Something went wrong. Please try again.");
    setPending(false);
  }

  function removeUnavailable(itemId: string) {
    remove(itemId);
    setUnavailableItemIds((ids) => ids.filter((id) => id !== itemId));
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Checkout</h1>

      <section className="mt-4">
        <h2 className="font-semibold">{basket.restaurantName}</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{basket.restaurantAddress}</p>
        <p className="mt-1 text-sm">Pickup only: collect at the counter</p>
      </section>

      <ul className="mt-4 flex flex-col gap-2">
        {basket.lines.map((line) => (
          <li key={line.itemId} className="flex items-center justify-between gap-4">
            <p>
              {line.name} × {line.quantity}
              {unavailableItemIds.includes(line.itemId) && (
                <>
                  <span className="ml-2 text-sm text-red-600">No longer available</span>
                  <button
                    type="button"
                    onClick={() => removeUnavailable(line.itemId)}
                    className="ml-2 text-sm underline"
                  >
                    Remove
                  </button>
                </>
              )}
            </p>
            <p className="text-sm font-medium">{formatInr(line.unitPricePaise * line.quantity)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-col items-end gap-1 text-sm">
        <p>Subtotal: {formatInr(totals.subtotalPaise)}</p>
        <p>GST (5%): {formatInr(totals.gstPaise)}</p>
        <p className="font-semibold">Total: {formatInr(totals.totalPaise)}</p>
      </div>

      {priceNotice && (
        <p className="mt-4 text-sm text-amber-600">
          Prices changed since you added these items. Your basket has been updated — please review the new
          total.
        </p>
      )}

      {unavailableItemIds.length > 0 && (
        <p className="mt-4 text-sm text-red-600">
          Some items are no longer available. Remove them from your basket to continue.
        </p>
      )}

      {failureMessage && <p className="mt-4 text-sm text-red-600">{failureMessage}</p>}

      <fieldset className="mt-6">
        <legend className="text-sm font-medium">Payment</legend>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="payment"
            checked={paymentChoice === "success"}
            onChange={() => setPaymentChoice("success")}
          />
          Simulate successful payment
        </label>
        <label className="mt-1 flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="payment"
            checked={paymentChoice === "failure"}
            onChange={() => setPaymentChoice("failure")}
          />
          Simulate failed payment
        </label>
      </fieldset>

      <button
        type="button"
        onClick={handlePay}
        disabled={pending || unavailableItemIds.length > 0}
        className="mt-4 rounded bg-black px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black"
      >
        Pay {formatInr(totals.totalPaise)}
      </button>
    </div>
  );
}
