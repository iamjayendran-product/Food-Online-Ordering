"use client";

import Link from "next/link";
import { useBasket } from "@/components/basket-provider";
import { calculateTotals } from "@/lib/pricing";
import { formatInr } from "@/lib/format";

export default function BasketPage() {
  const { basket, increment, decrement, remove } = useBasket();

  if (basket.lines.length === 0) {
    return (
      <div className="flex flex-col items-start gap-2">
        <p>Your basket is empty.</p>
        <Link href="/" className="underline">
          Browse restaurants
        </Link>
      </div>
    );
  }

  const totals = calculateTotals(basket.lines);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Your basket</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{basket.restaurantName}</p>

      <ul className="mt-4 flex flex-col gap-3">
        {basket.lines.map((line) => (
          <li
            key={line.itemId}
            className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-3 dark:border-white/10"
          >
            <div>
              <p className="font-medium">{line.name}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {formatInr(line.unitPricePaise)} each
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={`Decrease quantity of ${line.name}`}
                onClick={() => decrement(line.itemId)}
                className="h-7 w-7 rounded border border-black/20 dark:border-white/20"
              >
                −
              </button>
              <span aria-label={`Quantity of ${line.name}`}>{line.quantity}</span>
              <button
                type="button"
                aria-label={`Increase quantity of ${line.name}`}
                onClick={() => increment(line.itemId)}
                className="h-7 w-7 rounded border border-black/20 dark:border-white/20"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => remove(line.itemId)}
                className="ml-2 text-sm underline"
              >
                Remove
              </button>
              <span className="ml-2 w-16 text-right text-sm font-medium">
                {formatInr(line.unitPricePaise * line.quantity)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-col items-end gap-1 text-sm">
        <p>Subtotal: {formatInr(totals.subtotalPaise)}</p>
        <p>GST (5%): {formatInr(totals.gstPaise)}</p>
        <p className="font-semibold">Total: {formatInr(totals.totalPaise)}</p>
      </div>

      <div className="mt-4 flex justify-end">
        <Link
          href="/checkout"
          className="rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}
