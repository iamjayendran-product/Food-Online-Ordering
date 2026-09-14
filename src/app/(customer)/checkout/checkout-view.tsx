"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { useBasket } from "@/components/basket-provider";
import { calculateTotals } from "@/lib/pricing";
import { formatInr } from "@/lib/format";
import { placeOrderAction } from "./actions";

export function CheckoutView() {
  const router = useRouter();
  const { basket, hydrated, remove, clear, refreshBasket } = useBasket();
  const [paymentChoice, setPaymentChoice] = useState<"success" | "failure">("success");
  const [pending, setPending] = useState(false);
  const [unavailableItemIds, setUnavailableItemIds] = useState<string[]>([]);
  const [priceNotice, setPriceNotice] = useState(false);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
  // A ref, not state: state updates aren't guaranteed to commit before a
  // near-simultaneous second click reaches this handler, which would let a
  // stale closure's `pending` check pass. The ref is set synchronously.
  const payingRef = useRef(false);
  // Clearing the basket on a successful order also makes lines.length hit 0
  // on this page, which would otherwise race the "empty basket" redirect
  // below against the navigation to the confirmation page.
  const hasPlacedOrderRef = useRef(false);

  useEffect(() => {
    if (hydrated && basket.lines.length === 0 && !hasPlacedOrderRef.current) {
      router.replace("/basket");
    }
  }, [hydrated, basket.lines.length, router]);

  if (!hydrated || basket.lines.length === 0 || !basket.restaurantSlug) {
    return null;
  }

  const totals = calculateTotals(basket.lines);

  async function handlePay() {
    if (payingRef.current) return;
    payingRef.current = true;
    setPending(true);
    setFailureMessage(null);

    const result = await placeOrderAction({
      restaurantSlug: basket.restaurantSlug,
      items: basket.lines.map((line) => ({ itemId: line.itemId, quantity: line.quantity })),
      expectedTotalPaise: totals.totalPaise,
      simulateSuccess: paymentChoice === "success",
    });

    if (result.status === "UNAUTHENTICATED") {
      payingRef.current = false;
      router.push("/login?next=%2Fcheckout");
      return;
    }

    if (result.status === "PLACED") {
      hasPlacedOrderRef.current = true;
      clear();
      router.push(`/orders/${result.orderId}`);
      return;
    }

    if (result.status === "PAYMENT_FAILED") {
      payingRef.current = false;
      setFailureMessage("Payment failed. You have not been charged. Please try again.");
      setPending(false);
      return;
    }

    if (result.status === "ITEMS_UNAVAILABLE") {
      payingRef.current = false;
      setUnavailableItemIds(result.unavailableItemIds);
      setPending(false);
      return;
    }

    if (result.status === "PRICE_CHANGED") {
      payingRef.current = false;
      const correctedByItemId = new Map(
        result.correctedLines.map((line) => [line.itemId, line.unitPricePaise]),
      );
      refreshBasket({
        ...basket,
        lines: basket.lines.map((line) =>
          correctedByItemId.has(line.itemId)
            ? { ...line, unitPricePaise: correctedByItemId.get(line.itemId)! }
            : line,
        ),
      });
      setPriceNotice(true);
      setPending(false);
      return;
    }

    payingRef.current = false;
    setFailureMessage("Something went wrong. Please try again.");
    setPending(false);
  }

  function removeUnavailable(itemId: string) {
    remove(itemId);
    setUnavailableItemIds((ids) => ids.filter((id) => id !== itemId));
  }

  return (
    <Box>
      <Typography variant="h1">Checkout</Typography>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          mt: 3,
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 340px" },
          alignItems: "start",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Card component="section" sx={{ p: 3 }}>
            <Typography variant="h3" component="h2">{basket.restaurantName}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1 }}>
              <PlaceOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                {basket.restaurantAddress}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 1.5 }}>
              Pickup only: collect at the counter
            </Typography>
          </Card>

          <Card sx={{ px: 3, py: 1 }}>
            <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
              {basket.lines.map((line) => (
                <Box
                  component="li"
                  key={line.itemId}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    py: 1.75,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:last-of-type": { borderBottom: "none" },
                  }}
                >
                  <Typography component="p">
                    {line.name} × {line.quantity}
                    {unavailableItemIds.includes(line.itemId) && (
                      <>
                        <Box
                          component="span"
                          sx={{ ml: 1, fontSize: "0.875rem", color: "error.main" }}
                        >
                          No longer available
                        </Box>
                        <Button
                          size="small"
                          color="inherit"
                          sx={{ ml: 1 }}
                          onClick={() => removeUnavailable(line.itemId)}
                        >
                          Remove
                        </Button>
                      </>
                    )}
                  </Typography>
                  <Typography sx={{ fontWeight: 600 }}>
                    {formatInr(line.unitPricePaise * line.quantity)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>

          <Card sx={{ p: 3 }}>
            <FormControl>
              <FormLabel sx={{ fontWeight: 600, color: "text.primary" }}>Payment</FormLabel>
              <RadioGroup
                value={paymentChoice}
                onChange={(event) =>
                  setPaymentChoice(event.target.value === "failure" ? "failure" : "success")
                }
                sx={{ mt: 1 }}
              >
                <FormControlLabel
                  value="success"
                  control={<Radio size="small" />}
                  label="Simulate successful payment"
                />
                <FormControlLabel
                  value="failure"
                  control={<Radio size="small" />}
                  label="Simulate failed payment"
                />
              </RadioGroup>
            </FormControl>
          </Card>
        </Box>

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

          {priceNotice && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Prices changed since you added these items. Your basket has been updated — please
              review the new total.
            </Alert>
          )}

          {unavailableItemIds.length > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Some items are no longer available. Remove them from your basket to continue.
            </Alert>
          )}

          {failureMessage && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {failureMessage}
            </Alert>
          )}

          <Button
            variant="contained"
            fullWidth
            onClick={handlePay}
            disabled={pending || unavailableItemIds.length > 0}
            sx={{ mt: 3, height: 48 }}
          >
            Pay {formatInr(totals.totalPaise)}
          </Button>
        </Card>
      </Box>
    </Box>
  );
}
