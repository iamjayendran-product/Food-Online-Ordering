import { notFound } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { getRestaurantMenu } from "@/lib/restaurants";
import { MenuItemRow } from "@/components/menu-item-row";
import { RatingStars } from "@/components/rating-stars";
import { AddToBasketButton } from "@/components/add-to-basket-button";
import { formatInr } from "@/lib/format";

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
        <Box sx={{ mt: 1.25 }}>
          <RatingStars rating={menu.ratingAvg} reviewCount={menu.reviewCount} />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1.5 }}>
          <PlaceOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary">
            {menu.address}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 2 }}>
          <Chip
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <ScheduleIcon sx={{ fontSize: 15 }} />
                {`Ready in ${menu.pickupMinutes} mins`}
              </Box>
            }
            size="small"
            sx={{ backgroundColor: "#FFFFFF", border: "1px solid", borderColor: "divider" }}
          />
          <Chip
            label="Pickup only"
            size="small"
            sx={{ backgroundColor: "#FFFFFF", border: "1px solid", borderColor: "divider" }}
          />
        </Box>
      </Box>

      {menu.recommended.length > 0 && (
        <Box component="section" sx={{ mb: 4 }}>
          <Typography variant="h2" component="h2" sx={{ mb: 1.5 }}>
            Recommended
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              overflowX: "auto",
              pb: 1,
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {menu.recommended.map((item) => (
              <Card key={item.id} sx={{ width: 208, flexShrink: 0, overflow: "hidden" }}>
                {item.imageUrl && (
                  <Box
                    component="img"
                    src={item.imageUrl}
                    alt=""
                    sx={{ display: "block", height: 116, width: "100%", objectFit: "cover" }}
                  />
                )}
                <Box sx={{ p: 1.5 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }} noWrap>
                    {item.name}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      mt: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatInr(item.pricePaise)}
                    </Typography>
                    <AddToBasketButton
                      isAvailable={item.isAvailable}
                      restaurantSlug={menu.slug}
                      restaurantName={menu.name}
                      restaurantAddress={menu.address}
                      itemId={item.id}
                      name={item.name}
                      unitPricePaise={item.pricePaise}
                    />
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        </Box>
      )}

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

      {/* Recommended repeats items that also live in a category below, so the
          full menu is wrapped in a stable id that tests can scope to. */}
      <Box id="menu-categories" sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
