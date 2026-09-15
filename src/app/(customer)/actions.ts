"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/dal";
import { toggleFavorite } from "@/lib/favorites";

const restaurantIdSchema = z.string().min(1);

export type ToggleFavoriteResult =
  | { status: "UNAUTHENTICATED" }
  | { status: "INVALID_RESTAURANT" }
  | { status: "OK"; isFavorite: boolean };

export async function toggleFavoriteAction(restaurantId: unknown): Promise<ToggleFavoriteResult> {
  const user = await getCurrentUser();
  if (!user) return { status: "UNAUTHENTICATED" };

  const parsed = restaurantIdSchema.safeParse(restaurantId);
  if (!parsed.success) return { status: "INVALID_RESTAURANT" };

  const isFavorite = await toggleFavorite(user.id, parsed.data);
  if (isFavorite === null) return { status: "INVALID_RESTAURANT" };

  revalidatePath("/");
  return { status: "OK", isFavorite };
}
