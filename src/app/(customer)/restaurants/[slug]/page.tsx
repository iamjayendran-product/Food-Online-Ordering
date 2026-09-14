import { notFound } from "next/navigation";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
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
    <Box>
      <Box
        sx={{
          borderRadius: 4,
          px: { xs: 2.5, sm: 4 },
          py: { xs: 3, sm: 4 },
          mb: 3,
          backgroundColor: "#FAF7F2",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h1">{menu.name}</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75 }}>
          {menu.cuisines.join(", ")}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1.5 }}>
          <PlaceOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary">
            {menu.address}
          </Typography>
        </Box>
        <Chip
          label="Pickup only"
          size="small"
          sx={{ mt: 2, backgroundColor: "#FFFFFF", border: "1px solid", borderColor: "divider" }}
        />
      </Box>

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
              sx={{ flexShrink: 0 }}
            />
          ))}
        </Box>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {menu.categories.map((category) => (
          <Box component="section" key={category.id} id={`category-${category.id}`}>
            <Typography variant="h2" component="h2" sx={{ mb: 0.5 }}>
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
    </Box>
  );
}
