import { requireUser } from "@/lib/dal";
import { CheckoutView } from "./checkout-view";

export default async function CheckoutPage() {
  await requireUser("/checkout");
  return <CheckoutView />;
}
