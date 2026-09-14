import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { LinkButton } from "@/components/next-link-mui";

export default function RestaurantNotFound() {
  return (
    <Box sx={{ py: 8, textAlign: "center" }}>
      <StorefrontOutlinedIcon sx={{ fontSize: 48, color: "primary.light" }} />
      <Typography variant="h2" component="h1" sx={{ mt: 1.5 }}>
        Restaurant not found
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        This restaurant may have been removed, or the link is wrong.
      </Typography>
      <LinkButton href="/" variant="contained" sx={{ mt: 3 }}>
        Back to restaurants
      </LinkButton>
    </Box>
  );
}
