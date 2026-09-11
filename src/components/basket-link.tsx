"use client";

import Link from "next/link";
import { useBasket } from "@/components/basket-provider";

export function BasketLink() {
  const { itemCount } = useBasket();

  return (
    <Link href="/basket" className="underline">
      Basket{itemCount > 0 ? ` (${itemCount})` : ""}
    </Link>
  );
}
