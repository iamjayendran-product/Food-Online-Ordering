import { notFound } from "next/navigation";
import { getRestaurantMenu } from "@/lib/restaurants";
import { MenuItemRow } from "@/components/menu-item-row";

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const menu = await getRestaurantMenu(slug);

  if (!menu) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">{menu.name}</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{menu.cuisines.join(", ")}</p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{menu.address}</p>

      <div className="mt-6 flex flex-col gap-8">
        {menu.categories.map((category) => (
          <section key={category.id}>
            <h2 className="mb-2 text-lg font-semibold">{category.name}</h2>
            <ul>
              {category.items.map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  restaurantSlug={menu.slug}
                  restaurantName={menu.name}
                  restaurantAddress={menu.address}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
