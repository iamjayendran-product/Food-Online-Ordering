import { notFound } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { requireUser } from "@/lib/dal";
import { getPlacedOrderForUser } from "@/lib/orders/get-order";
import { formatInr } from "@/lib/format";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const user = await requireUser(`/orders/${orderId}`);
  const order = await getPlacedOrderForUser(orderId, user.id);

  if (!order) {
    notFound();
  }

  const placedAt = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(order.createdAt);

  return (
    <Box sx={{ maxWidth: 640, mx: "auto" }}>
      <Box sx={{ textAlign: "center", py: 2 }}>
        <CheckCircleIcon sx={{ fontSize: 56, color: "primary.main" }} />
        <Typography variant="h1" sx={{ mt: 1 }}>
          Order confirmed
        </Typography>
        <Chip label={`Order #${order.orderNumber}`} sx={{ mt: 1.5, fontWeight: 600 }} />
      </Box>

      <Card component="section" sx={{ p: 3, mt: 2 }}>
        <Typography variant="h3" component="h2">{order.restaurant.name}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1 }}>
          <PlaceOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary">
            {order.restaurant.address}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 600 }}>
          Pickup: ASAP
        </Typography>
      </Card>

      <Card sx={{ px: 3, py: 1, mt: 3 }}>
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
          {order.items.map((item) => (
            <Box
              component="li"
              key={item.id}
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
                {item.name} × {item.quantity}
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>{formatInr(item.lineTotalPaise)}</Typography>
            </Box>
          ))}
        </Box>
      </Card>

      <Card sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          <Typography variant="body2">Subtotal: {formatInr(order.subtotalPaise)}</Typography>
          <Typography variant="body2">GST (5%): {formatInr(order.gstPaise)}</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography sx={{ fontWeight: 700 }}>Total: {formatInr(order.totalPaise)}</Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2">Payment: Paid (simulated)</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {placedAt} IST
        </Typography>
      </Card>
    </Box>
  );
}
