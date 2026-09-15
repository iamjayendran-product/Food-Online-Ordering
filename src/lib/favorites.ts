import { db } from "@/lib/db";

// No `server-only` import here on purpose: the Playwright logic tests call
// these functions directly, the same way they do for pricing and orders.

export async function listFavoriteRestaurantIds(userId: string): Promise<string[]> {
  const rows = await db.favorite.findMany({
    where: { userId },
    select: { restaurantId: true },
  });
  return rows.map((row) => row.restaurantId);
}

export async function isFavorite(userId: string, restaurantId: string): Promise<boolean> {
  const row = await db.favorite.findUnique({
    where: { userId_restaurantId: { userId, restaurantId } },
    select: { id: true },
  });
  return row !== null;
}

/**
 * Adds the restaurant to the customer's favourites, or removes it if it is
 * already there. Returns the state the restaurant ends up in, or `null` if
 * the restaurant doesn't exist (a client-supplied id is never trusted).
 */
export async function toggleFavorite(userId: string, restaurantId: string): Promise<boolean | null> {
  const existing = await db.favorite.findUnique({
    where: { userId_restaurantId: { userId, restaurantId } },
    select: { id: true },
  });

  if (existing) {
    await db.favorite.delete({ where: { id: existing.id } });
    return false;
  }

  const restaurant = await db.restaurant.findUnique({ where: { id: restaurantId }, select: { id: true } });
  if (!restaurant) return null;

  await db.favorite.create({ data: { userId, restaurantId } });
  return true;
}
