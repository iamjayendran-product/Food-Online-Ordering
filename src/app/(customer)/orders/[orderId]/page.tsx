import { notFound } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getPlacedOrderForUser } from "@/lib/orders/get-order";
import { formatInr } from "@/lib/format";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const user = await requireUser(`/orders/${orderId}`);
  const order = await getPlacedOrderForUser(orderId, user.id);

  if (!order) {
    notFound();
  }

  const placedAt = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(order.createdAt);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Order confirmed</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Order #{order.orderNumber}</p>

      <section className="mt-4">
        <h2 className="font-semibold">{order.restaurant.name}</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{order.restaurant.address}</p>
        <p className="mt-1 text-sm">Pickup: ASAP</p>
      </section>

      <ul className="mt-4 flex flex-col gap-2">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4">
            <p>
              {item.name} × {item.quantity}
            </p>
            <p className="text-sm font-medium">{formatInr(item.lineTotalPaise)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-col items-end gap-1 text-sm">
        <p>Subtotal: {formatInr(order.subtotalPaise)}</p>
        <p>GST (5%): {formatInr(order.gstPaise)}</p>
        <p className="font-semibold">Total: {formatInr(order.totalPaise)}</p>
      </div>

      <p className="mt-4 text-sm">Payment: Paid (simulated)</p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{placedAt} IST</p>
    </div>
  );
}
