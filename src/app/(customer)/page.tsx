import Link from "next/link";
import { listRestaurants } from "@/lib/restaurants";
import { RestaurantCard } from "@/components/restaurant-card";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const restaurants = await listRestaurants(q);

  return (
    <div>
      <form className="mb-6 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search restaurants"
          aria-label="Search restaurants"
          className="w-full max-w-sm rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
        >
          Search
        </button>
      </form>

      {restaurants.length === 0 ? (
        <div className="flex flex-col items-start gap-2">
          <p>{q ? `No restaurants match "${q}".` : "No restaurants available."}</p>
          <Link href="/" className="underline">
            Clear search
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
}
