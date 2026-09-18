import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

// A stand-in for a real kitchen camera feed, which this project has no way
// to provide. `/images/kitchen-chef.jpg` is a single photo downloaded once
// and committed as a static asset (not a live hotlink) so it can't silently
// rot or resolve to the wrong picture the way a seeded Unsplash URL can —
// see the F26 bug fix. A slow pan/zoom plus a CSS steam overlay give it
// motion without pretending it's a real feed; it's still clearly labeled
// simulated, in the same spirit as the checkout page's simulated payment.
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
          src="/images/kitchen-chef.jpg"
          alt=""
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 30%",
            animation: "foodlicious-kitchen-pan 14s ease-in-out infinite",
            "@keyframes foodlicious-kitchen-pan": {
              "0%, 100%": { transform: "scale(1.05) translate(0, 0)" },
              "50%": { transform: "scale(1.15) translate(-1.5%, -1%)" },
            },
          }}
        />

        {/* Steam drifting up from the pass, on top of the photo */}
        {[0, 1, 2].map((index) => (
          <Box
            key={index}
            sx={{
              position: "absolute",
              bottom: "42%",
              left: `${30 + index * 14}%`,
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              opacity: 0,
              animation: `foodlicious-steam 2.6s ease-in ${index * 0.5}s infinite`,
              "@keyframes foodlicious-steam": {
                "0%": { transform: "translateY(0) scale(1)", opacity: 0.55 },
                "100%": { transform: "translateY(-46px) scale(1.6)", opacity: 0 },
              },
            }}
          />
        ))}
      </Box>
    </Card>
  );
}
