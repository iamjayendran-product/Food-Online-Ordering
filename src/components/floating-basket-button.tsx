"use client";

import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import Link from "next/link";
import { useBasket } from "@/components/basket-provider";

export function FloatingBasketButton() {
  const { hydrated, itemCount } = useBasket();

  if (!hydrated || itemCount === 0) return null;

  return (
    <Box sx={{ position: "fixed", bottom: { xs: 16, sm: 24 }, right: { xs: 16, sm: 24 }, zIndex: 10 }}>
      <Fab
        component={Link}
        href="/basket"
        color="primary"
        variant="extended"
        // Distinct from the header's "Basket (N)" link, which is visible on
        // the same page — an identical accessible name would collide.
        aria-label={`View basket, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
        sx={{ boxShadow: "0 8px 24px rgba(28, 25, 23, 0.24)" }}
      >
        <ShoppingBagOutlinedIcon sx={{ mr: 1 }} />
        {itemCount}
      </Fab>
    </Box>
  );
}
