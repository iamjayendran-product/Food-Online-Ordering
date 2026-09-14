import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <Box sx={{ maxWidth: 420, mx: "auto", py: { xs: 2, sm: 5 } }}>
      <Typography variant="h1" sx={{ mb: 1 }}>
        Log in
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Log in to place your pickup order.
      </Typography>
      <Card sx={{ p: 3 }}>
        <LoginForm next={next ?? "/"} />
      </Card>
    </Box>
  );
}
