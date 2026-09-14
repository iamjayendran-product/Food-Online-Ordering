import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { formatInr } from "@/lib/format";
import { VegMarker } from "@/components/veg-marker";
import { AddToBasketButton } from "@/components/add-to-basket-button";
import type { MenuItemDTO } from "@/lib/restaurants";

type MenuItemRowProps = {
  item: MenuItemDTO;
  restaurantSlug: string;
  restaurantName: string;
  restaurantAddress: string;
};

export function MenuItemRow({
  item,
  restaurantSlug,
  restaurantName,
  restaurantAddress,
}: MenuItemRowProps) {
  return (
    <Box
      component="li"
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 2,
        py: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:last-of-type": { borderBottom: "none" },
        opacity: item.isAvailable ? 1 : 0.72,
      }}
    >
      <Box sx={{ display: "flex", gap: 1.25, minWidth: 0 }}>
        <Box sx={{ pt: 0.35 }}>
          <VegMarker isVeg={item.isVeg} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600 }}>{item.name}</Typography>
          {item.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {item.description}
            </Typography>
          )}
          <Typography sx={{ mt: 0.75, fontWeight: 600 }}>
            {formatInr(item.pricePaise)}
          </Typography>
          {!item.isAvailable && (
            <Typography variant="body2" color="error.main" sx={{ mt: 0.5 }}>
              Currently unavailable
            </Typography>
          )}
        </Box>
      </Box>

      <AddToBasketButton
        isAvailable={item.isAvailable}
        restaurantSlug={restaurantSlug}
        restaurantName={restaurantName}
        restaurantAddress={restaurantAddress}
        itemId={item.id}
        name={item.name}
        unitPricePaise={item.pricePaise}
      />
    </Box>
  );
}
