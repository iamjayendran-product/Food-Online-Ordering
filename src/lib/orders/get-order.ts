import { db } from "@/lib/db";

export async function getPlacedOrderForUser(orderId: string, userId: string) {
  return db.order.findFirst({
    where: { id: orderId, userId, status: "PLACED" },
    include: {
      restaurant: { select: { name: true, address: true } },
      items: true,
    },
  });
}
