import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { readSession } from "@/lib/session";
import { db } from "@/lib/db";

// Cached per request so multiple calls during one render don't re-query.
export const getCurrentUser = cache(async () => {
  const session = await readSession();
  if (!session) return null;

  return db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true },
  });
});

export async function requireUser(nextPath: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}
