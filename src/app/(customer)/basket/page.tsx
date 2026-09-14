"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { useBasket } from "@/components/basket-provider";
import { calculateTotals } from "@/lib/pricing";
import { formatInr } from "@/lib/format";

export default function BasketPage() {
  const { basket, increment, decrement, remove } = useBasket();

  if (basket.lines.length === 0) {
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <ShoppingBagOutlinedIcon sx={{ fontSize: 48, color: "primary.light" }} />
        <Typography sx={{ mt: 1.5, fontWeight: 600 }}>Your basket is empty.</Typography>
        <Button component={Link} href="/" variant="contained" sx={{ mt: 3 }}>
          Browse restaurants
        </Button>
      </Box>
    );
  }

  const totals = calculateTotals(basket.lines);

  return (
    <Box>
      <Typography variant="h1">Your basket</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5 }}>
        {basket.restaurantName}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          mt: 3,
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 320px" },
          alignItems: "start",
        }}
      >
        <Card sx={{ px: { xs: 2, sm: 3 }, py: 1 }}>
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
            {basket.lines.map((line) => (
              <Box
                component="li"
                key={line.itemId}
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  py: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-of-type": { borderBottom: "none" },
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }}>{line.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatInr(line.unitPricePaise)} each
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 999,
                      px: 0.5,
                    }}
                  >
                    <IconButton
                      size="small"
                      aria-label={`Decrease quantity of ${line.name}`}
                      onClick={() => decrement(line.itemId)}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography
                      aria-label={`Quantity of ${line.name}`}
                      sx={{ minWidth: 20, textAlign: "center", fontWeight: 600 }}
                    >
                      {line.quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      aria-label={`Increase quantity of ${line.name}`}
                      onClick={() => increment(line.itemId)}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Button size="small" color="inherit" onClick={() => remove(line.itemId)}>
                    Remove
                  </Button>

                  <Typography sx={{ minWidth: 72, textAlign: "right", fontWeight: 600 }}>
                    {formatInr(line.unitPricePaise * line.quantity)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Card>

        <Card sx={{ p: 3, position: { md: "sticky" }, top: { md: 88 } }}>
          <Typography variant="h3" component="h2" sx={{ mb: 2 }}>
            Order summary
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            <Typography variant="body2">Subtotal: {formatInr(totals.subtotalPaise)}</Typography>
            <Typography variant="body2">GST (5%): {formatInr(totals.gstPaise)}</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography sx={{ fontWeight: 700 }}>
              Total: {formatInr(totals.totalPaise)}
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/checkout"
            variant="contained"
            fullWidth
            sx={{ mt: 3, height: 48 }}
          >
            Checkout
          </Button>
        </Card>
      </Box>
    </Box>
  );
}
