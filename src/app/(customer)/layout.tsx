import { SiteHeader } from "@/components/site-header";
import { BasketProvider } from "@/components/basket-provider";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <BasketProvider>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </BasketProvider>
  );
}
