import { db } from "@/lib/db";

export type RestaurantCard = {
  id: string;
  slug: string;
  name: string;
  cuisines: string[];
  imageUrl: string | null;
};

// Prisma's `contains` compiles to a Postgres ILIKE pattern, so a literal "%"
// or "_" in the search term would otherwise act as a SQL wildcard instead of
// matching itself. Escape both (and the escape character) before querying.
function escapeLikePattern(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export async function listRestaurants(query?: string): Promise<RestaurantCard[]> {
  const trimmed = query?.trim();

  return db.restaurant.findMany({
    where: trimmed ? { name: { contains: escapeLikePattern(trimmed), mode: "insensitive" } } : undefined,
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true, cuisines: true, imageUrl: true },
  });
}
