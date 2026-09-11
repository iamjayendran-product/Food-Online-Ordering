"use client";

import { useBasket } from "@/components/basket-provider";

type AddToBasketButtonProps = {
  isAvailable: boolean;
  restaurantSlug: string;
  restaurantName: string;
  itemId: string;
  name: string;
  unitPricePaise: number;
};

export function AddToBasketButton({
  isAvailable,
  restaurantSlug,
  restaurantName,
  itemId,
  name,
  unitPricePaise,
}: AddToBasketButtonProps) {
  const { addItem } = useBasket();

  return (
    <button
      type="button"
      disabled={!isAvailable}
      onClick={() => addItem({ restaurantSlug, restaurantName, itemId, name, unitPricePaise })}
      className="shrink-0 rounded bg-black px-3 py-1.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black"
    >
      Add
    </button>
  );
}
