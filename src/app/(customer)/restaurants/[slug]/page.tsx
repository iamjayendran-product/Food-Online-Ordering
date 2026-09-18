import { notFound } from "next/navigation";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { getRestaurantMenu } from "@/lib/restaurants";
import { MenuItemRow } from "@/components/menu-item-row";
import { FloatingBasketButton } from "@/components/floating-basket-button";
import { RestaurantHeroBanner } from "@/components/restaurant-hero-banner";
import { brand } from "@/theme";

// Cycled by category index so adjacent categories read as visually distinct
// sections; all four are already deepened to clear WCAG text contrast on
// white (see theme.ts).
const CATEGORY_COLORS = [brand.tomato, brand.forest, brand.kiwi, brand.sunshine];

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
    <Box>
      <RestaurantHeroBanner
        images={menu.images}
        name={menu.name}
        cuisines={menu.cuisines}
        address={menu.address}
        pickupMinutes={menu.pickupMinutes}
        ratingAvg={menu.ratingAvg}
        reviewCount={menu.reviewCount}
      />

      {menu.categories.length > 1 && (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            overflowX: "auto",
            pb: 1.5,
            mb: 1,
            position: "sticky",
            top: { xs: 60, sm: 68 },
            zIndex: 1,
            backgroundColor: "background.default",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {menu.categories.map((category) => (
            <Chip
              key={category.id}
              component="a"
              href={`#category-${category.id}`}
              clickable
              label={category.name}
              variant="outlined"
              sx={{ flexShrink: 0, borderColor: "primary.main", color: "primary.main", backgroundColor: "#FFFFFF" }}
            />
          ))}
        </Box>
      )}

      <Box id="menu-categories" sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {menu.categories.map((category, index) => (
          <Box component="section" key={category.id} id={`category-${category.id}`}>
            <Typography
              variant="h2"
              component="h2"
              sx={{ mb: 0.5, color: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
            >
              {category.name}
            </Typography>
            <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
              {category.items.map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  restaurantSlug={menu.slug}
                  restaurantName={menu.name}
                  restaurantAddress={menu.address}
                />
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      <FloatingBasketButton />
    </Box>
  );
}
