"use client";

import Link from "next/link";
import Button from "@mui/material/Button";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { useBasket } from "@/components/basket-provider";

export function BasketLink() {
  const { itemCount } = useBasket();

  // The label text is the link's accessible name ("Basket" / "Basket (1)").
  // The icon is decorative — MUI marks SvgIcon aria-hidden — so it doesn't
  // change that name.
  return (
    <Button
      component={Link}
      href="/basket"
      size="small"
      color="inherit"
      startIcon={<ShoppingBagOutlinedIcon fontSize="small" />}
      sx={{ color: "text.primary" }}
    >
      {`Basket${itemCount > 0 ? ` (${itemCount})` : ""}`}
    </Button>
  );
}
