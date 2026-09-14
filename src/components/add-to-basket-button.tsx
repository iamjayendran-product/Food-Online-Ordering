"use client";

import Button from "@mui/material/Button";
import { useBasket } from "@/components/basket-provider";

type AddToBasketButtonProps = {
  isAvailable: boolean;
  restaurantSlug: string;
  restaurantName: string;
  restaurantAddress: string;
  itemId: string;
  name: string;
  unitPricePaise: number;
};

export function AddToBasketButton({
  isAvailable,
  restaurantSlug,
  restaurantName,
  restaurantAddress,
  itemId,
  name,
  unitPricePaise,
}: AddToBasketButtonProps) {
  const { addItem } = useBasket();

  return (
    <Button
      variant="outlined"
      size="small"
      disabled={!isAvailable}
      onClick={() =>
        addItem({ restaurantSlug, restaurantName, restaurantAddress, itemId, name, unitPricePaise })
      }
      sx={{
        flexShrink: 0,
        minWidth: 84,
        borderColor: "divider",
        color: "primary.main",
        "&:hover": { borderColor: "primary.main", backgroundColor: "primary.main", color: "#FFFFFF" },
      }}
    >
      Add
    </Button>
  );
}
