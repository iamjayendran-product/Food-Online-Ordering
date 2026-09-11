import Link from "next/link";
import { RestaurantImage } from "@/components/restaurant-image";
import type { RestaurantCard as RestaurantCardData } from "@/lib/restaurants";

export function RestaurantCard({ restaurant }: { restaurant: RestaurantCardData }) {
  return (
    <Link
      href={`/restaurants/${restaurant.slug}`}
      className="block rounded-lg border border-black/10 p-3 transition hover:border-black/30 dark:border-white/10 dark:hover:border-white/30"
    >
      <RestaurantImage name={restaurant.name} imageUrl={restaurant.imageUrl} />
      <h2 className="mt-3 font-semibold">{restaurant.name}</h2>
      <ul className="mt-1 flex flex-wrap gap-1 text-xs text-zinc-500 dark:text-zinc-400">
        {restaurant.cuisines.map((cuisine) => (
          <li key={cuisine} className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
            {cuisine}
          </li>
        ))}
      </ul>
    </Link>
  );
}
