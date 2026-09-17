import { db } from "@/lib/db";

export type RestaurantCard = {
  id: string;
  slug: string;
  name: string;
  cuisines: string[];
  images: string[];
  pickupMinutes: number;
  ratingAvg: number;
  reviewCount: number;
  // Derived from the menu rather than stored: a restaurant counts as
  // vegetarian when every one of its items is. Keeping it computed means it
  // can never drift out of step with the dishes actually on sale.
  isPureVeg: boolean;
};

// Prisma's `contains` compiles to a Postgres ILIKE pattern, so a literal "%"
// or "_" in the search term would otherwise act as a SQL wildcard instead of
// matching itself. Escape both (and the escape character) before querying.
function escapeLikePattern(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export async function listRestaurants(query?: string, cuisine?: string): Promise<RestaurantCard[]> {
  const trimmed = query?.trim();

  const rows = await db.restaurant.findMany({
    where: {
      ...(trimmed ? { name: { contains: escapeLikePattern(trimmed), mode: "insensitive" } } : {}),
      ...(cuisine ? { cuisines: { has: cuisine } } : {}),
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      cuisines: true,
      images: true,
      pickupMinutes: true,
      ratingAvg: true,
      reviewCount: true,
      items: { select: { isVeg: true } },
    },
  });

  return rows.map(({ items, ...restaurant }) => ({
    ...restaurant,
    isPureVeg: items.length > 0 && items.every((item) => item.isVeg),
  }));
}

// The distinct set of cuisine tags across every restaurant, for the
// discovery page's category browse chips. Small, fixed-size dataset, so
// deduping in JS is simpler than a raw unnest query.
export async function listCuisines(): Promise<string[]> {
  const rows = await db.restaurant.findMany({ select: { cuisines: true } });
  const cuisines = new Set(rows.flatMap((row) => row.cuisines));
  return [...cuisines].sort((a, b) => a.localeCompare(b));
}

export type MenuItemDTO = {
  id: string;
  name: string;
  description: string | null;
  pricePaise: number;
  isVeg: boolean;
  isAvailable: boolean;
  imageUrl: string | null;
  isRecommended: boolean;
};

export type MenuCategoryDTO = {
  id: string;
  name: string;
  items: MenuItemDTO[];
};

export type RestaurantMenu = {
  id: string;
  slug: string;
  name: string;
  cuisines: string[];
  address: string;
  images: string[];
  pickupMinutes: number;
  ratingAvg: number;
  reviewCount: number;
  categories: MenuCategoryDTO[];
  // The same items also appear in their own category further down the page;
  // this is a shortcut to the kitchen's picks, not a separate menu.
  recommended: MenuItemDTO[];
};

const MAX_RECOMMENDED = 4;

export async function getRestaurantMenu(slug: string): Promise<RestaurantMenu | null> {
  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      cuisines: true,
      address: true,
      images: true,
      pickupMinutes: true,
      ratingAvg: true,
      reviewCount: true,
      categories: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          items: {
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              name: true,
              description: true,
              pricePaise: true,
              isVeg: true,
              isAvailable: true,
              imageUrl: true,
              isRecommended: true,
            },
          },
        },
      },
    },
  });

  if (!restaurant) return null;

  const categories = restaurant.categories.filter((category) => category.items.length > 0);

  // Only offer something the customer can actually order.
  const recommended = categories
    .flatMap((category) => category.items)
    .filter((item) => item.isRecommended && item.isAvailable)
    .slice(0, MAX_RECOMMENDED);

  return { ...restaurant, categories, recommended };
}
