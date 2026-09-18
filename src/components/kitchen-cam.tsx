import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

// A stand-in for a real kitchen camera feed, which this project has no way
// to provide. `/images/kitchen-masterchef.gif` (F30) is a single GIF
// downloaded once from Giphy and committed as a static asset — not a live
// hotlink to Giphy's CDN — so it can't silently rot or resolve to the wrong
// clip the way a seeded Unsplash URL once did (see the F26 bug fix). It's
// sourced from MasterChef Australia, so self-hosting this one copy (rather
// than redistributing it more widely) is the deliberate choice here. The
// GIF is encoded with an infinite Netscape loop count, confirmed by
// inspecting its bytes, so a plain <img> loops it forever with no extra
// code. Still clearly labeled simulated, in the same spirit as the
// checkout page's simulated payment.
export function KitchenCam({ restaurantName }: { restaurantName: string }) {
  return (
    <Card sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h3" component="h2">
          Kitchen view
        </Typography>
        <Chip
          label="LIVE"
          size="small"
          sx={{
            backgroundColor: "error.main",
            color: "#FFFFFF",
            fontWeight: 700,
            animation: "foodlicious-live-pulse 1.6s ease-in-out infinite",
            "@keyframes foodlicious-live-pulse": {
              "0%, 100%": { opacity: 1 },
              "50%": { opacity: 0.45 },
            },
          }}
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
        Simulated live view — {restaurantName}&rsquo;s kitchen
      </Typography>

      <Box
        role="img"
        aria-label={`Simulated live view of ${restaurantName}'s kitchen`}
        sx={{
          height: 220,
          borderRadius: 2,
          backgroundColor: "#1C1917",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src="/images/kitchen-masterchef.gif"
          alt=""
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 30%",
          }}
        />
      </Box>
    </Card>
  );
}
