import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

// A stand-in for a real kitchen camera feed, which this project has no way
// to provide — an animated illustration, not a video file, so there is
// nothing to source, host or license. Clearly labeled as simulated, in the
// same spirit as the checkout page's simulated payment.
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
          height: 160,
          borderRadius: 2,
          backgroundColor: "#1C1917",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          component="svg"
          viewBox="0 0 200 100"
          sx={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          {/* Stove */}
          <rect x="70" y="70" width="60" height="20" rx="2" fill="#3A3532" />
          <circle cx="85" cy="70" r="6" fill="#5B564F" />
          <circle cx="115" cy="70" r="6" fill="#5B564F" />
          <rect x="88" y="55" width="24" height="16" rx="2" fill="#6F6259" />

          {/* Flames flickering under both burners */}
          {[85, 115].map((cx, index) => (
            <path
              key={cx}
              d={`M ${cx - 4} 78 Q ${cx} 68 ${cx + 4} 78 Q ${cx} 74 ${cx - 4} 78 Z`}
              fill="#F4B400"
              opacity="0.85"
              style={{
                transformOrigin: `${cx}px 78px`,
                animation: `foodlicious-flame 0.9s ease-in-out ${index * 0.25}s infinite`,
              }}
            />
          ))}

          {/* Spoon stirring the pot */}
          <g style={{ transformOrigin: "100px 63px", animation: "foodlicious-stir 1.8s ease-in-out infinite" }}>
            <rect x="99" y="45" width="2" height="20" fill="#D8CFC4" />
          </g>

          {/* Chef silhouette, gently swaying */}
          <g
            style={{
              transformOrigin: "150px 90px",
              animation: "foodlicious-chef-sway 2.4s ease-in-out infinite",
            }}
          >
            <circle cx="150" cy="55" r="8" fill="#FAF7F2" />
            <rect x="140" y="63" width="20" height="27" rx="6" fill="#FAF7F2" />
          </g>

          {/* Steam */}
          {[0, 1, 2].map((index) => (
            <circle
              key={index}
              cx={92 + index * 12}
              cy="52"
              r="3"
              fill="#FFFFFF"
              opacity="0.6"
              style={{
                animation: `foodlicious-steam 2.2s ease-in ${index * 0.4}s infinite`,
              }}
            />
          ))}

          <style>
            {`
              @keyframes foodlicious-chef-sway {
                0%, 100% { transform: rotate(-2deg); }
                50% { transform: rotate(2deg); }
              }
              @keyframes foodlicious-steam {
                0% { transform: translateY(0); opacity: 0.6; }
                100% { transform: translateY(-30px); opacity: 0; }
              }
              @keyframes foodlicious-flame {
                0%, 100% { transform: scaleY(1); opacity: 0.85; }
                50% { transform: scaleY(1.3); opacity: 1; }
              }
              @keyframes foodlicious-stir {
                0%, 100% { transform: rotate(-18deg); }
                50% { transform: rotate(18deg); }
              }
            `}
          </style>
        </Box>
      </Box>
    </Card>
  );
}
