import { formatInr } from "@/lib/format";
import { VegMarker } from "@/components/veg-marker";
import { AddToBasketButton } from "@/components/add-to-basket-button";
import type { MenuItemDTO } from "@/lib/restaurants";

type MenuItemRowProps = {
  item: MenuItemDTO;
  restaurantSlug: string;
  restaurantName: string;
};

export function MenuItemRow({ item, restaurantSlug, restaurantName }: MenuItemRowProps) {
  return (
    <li className="flex items-start justify-between gap-4 border-b border-black/10 py-3 last:border-b-0 dark:border-white/10">
      <div className="flex gap-2">
        <VegMarker isVeg={item.isVeg} />
        <div>
          <p className="font-medium">{item.name}</p>
          {item.description && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.description}</p>
          )}
          <p className="mt-1 text-sm font-medium">{formatInr(item.pricePaise)}</p>
          {!item.isAvailable && (
            <p className="mt-1 text-sm text-red-600">Currently unavailable</p>
          )}
        </div>
      </div>
      <AddToBasketButton
        isAvailable={item.isAvailable}
        restaurantSlug={restaurantSlug}
        restaurantName={restaurantName}
        itemId={item.id}
        name={item.name}
        unitPricePaise={item.pricePaise}
      />
    </li>
  );
}
