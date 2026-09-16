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
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { useBasket } from "@/components/basket-provider";
import { calculateTotals } from "@/lib/pricing";
import { formatInr } from "@/lib/format";
import { placeOrderAction } from "./actions";

const SCHEDULE_MAX_DAYS_AHEAD = 7;
const SCHEDULE_WINDOW_START = "09:00";
const SCHEDULE_WINDOW_END = "21:59";

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function CheckoutView() {
  const router = useRouter();
  const { basket, hydrated, remove, clear, refreshBasket } = useBasket();
  const [paymentChoice, setPaymentChoice] = useState<"success" | "failure">("success");
  const [scheduleMode, setScheduleMode] = useState<"asap" | "schedule">("asap");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  // Computed after mount, not during render: `new Date()` is impure, and
  // calling it at render time can differ between the server render and the
  // client hydration pass — the same class of bug as the F7 Chip mismatch.
  const [dateBounds, setDateBounds] = useState<{ min: string; max: string } | null>(null);
  useEffect(() => {
    const now = new Date();
    // There is no pure way to derive "today" during render; this is the
    // standard pattern for a client-only value that must not run during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDateBounds({
      min: toDateInputValue(now),
      max: toDateInputValue(new Date(now.getTime() + SCHEDULE_MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000)),
    });
  }, []);
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

    let scheduledFor: string | undefined;
    if (scheduleMode === "schedule") {
      if (!scheduleDate || !scheduleTime) {
        setScheduleError("Choose a pickup date and time.");
        return;
      }
      // The date/time inputs are a Chennai pickup slot, not a moment in the
      // browser's own timezone — build the instant with an explicit IST
      // offset so a customer whose device clock isn't IST still gets the
      // slot they picked (the server validates the 9am-10pm window in IST).
      scheduledFor = `${scheduleDate}T${scheduleTime}:00+05:30`;
    }
    setScheduleError(null);

    payingRef.current = true;
    setPending(true);
    setFailureMessage(null);

    const result = await placeOrderAction({
      restaurantSlug: basket.restaurantSlug,
      items: basket.lines.map((line) => ({ itemId: line.itemId, quantity: line.quantity })),
      expectedTotalPaise: totals.totalPaise,
      simulateSuccess: paymentChoice === "success",
      scheduledFor,
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

    if (result.status === "INVALID_SCHEDULE") {
      payingRef.current = false;
      setScheduleError(
        `Choose a pickup time between ${SCHEDULE_WINDOW_START} and ${SCHEDULE_WINDOW_END}, within the next ${SCHEDULE_MAX_DAYS_AHEAD} days.`,
      );
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

          <Card sx={{ p: 3 }}>
            <FormLabel sx={{ fontWeight: 600, color: "text.primary" }}>Pickup time</FormLabel>
            <ToggleButtonGroup
              exclusive
              value={scheduleMode}
              onChange={(_event, value) => {
                if (value) setScheduleMode(value);
              }}
              sx={{ display: "flex", mt: 1 }}
            >
              <ToggleButton value="asap" sx={{ flex: 1 }}>
                ASAP
              </ToggleButton>
              <ToggleButton value="schedule" sx={{ flex: 1 }}>
                Schedule for later
              </ToggleButton>
            </ToggleButtonGroup>

            {scheduleMode === "schedule" && (
              <Box sx={{ display: "flex", gap: 1.5, mt: 2, flexWrap: "wrap" }}>
                <TextField
                  type="date"
                  label="Pickup date"
                  size="small"
                  value={scheduleDate}
                  onChange={(event) => setScheduleDate(event.target.value)}
                  slotProps={{
                    htmlInput: { min: dateBounds?.min, max: dateBounds?.max },
                  }}
                />
                <TextField
                  type="time"
                  label="Pickup time"
                  size="small"
                  value={scheduleTime}
                  onChange={(event) => setScheduleTime(event.target.value)}
                  slotProps={{
                    htmlInput: { min: SCHEDULE_WINDOW_START, max: SCHEDULE_WINDOW_END },
                  }}
                />
              </Box>
            )}

            {scheduleError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {scheduleError}
              </Alert>
            )}
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
