"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
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
  const { basket, addItem, increment, decrement } = useBasket();
  const quantity = basket.lines.find((line) => line.itemId === itemId)?.quantity ?? 0;

  if (quantity === 0) {
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

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        flexShrink: 0,
        border: "1px solid",
        borderColor: "primary.main",
        borderRadius: 999,
        px: 0.5,
        // Plays once, the moment this replaces the "Add" button — a quick
        // acknowledgement that the click registered.
        animation: "foodlicious-add-pop 380ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        "@keyframes foodlicious-add-pop": {
          "0%": { transform: "scale(0.82)", opacity: 0.4 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
      }}
    >
      <IconButton size="small" aria-label={`Decrease quantity of ${name}`} onClick={() => decrement(itemId)}>
        <RemoveIcon fontSize="small" />
      </IconButton>
      <Typography aria-label={`Quantity of ${name}`} sx={{ minWidth: 18, textAlign: "center", fontWeight: 600 }}>
        {quantity}
      </Typography>
      <IconButton
        size="small"
        aria-label={`Increase quantity of ${name}`}
        disabled={!isAvailable}
        onClick={() => increment(itemId)}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
