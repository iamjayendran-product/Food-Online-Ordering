"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import type { CampaignItem } from "@/lib/campaigns";

export function CampaignMarquee({ campaigns }: { campaigns: CampaignItem[] }) {
  if (campaigns.length === 0) return null;

  // Duplicated so the track can loop seamlessly: once the first copy has
  // scrolled fully offscreen, the second copy is exactly where the first
  // one started.
  const track = [...campaigns, ...campaigns];

  return (
    <Box
      sx={{
        overflow: "hidden",
        mb: 4,
        maskImage: "linear-gradient(90deg, transparent, black 5%, black 95%, transparent)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 2,
          width: "max-content",
          animation: "foodlicious-marquee 24s linear infinite",
          "&:hover, &:focus-within": { animationPlayState: "paused" },
          "@keyframes foodlicious-marquee": {
            from: { transform: "translateX(0)" },
            to: { transform: "translateX(-50%)" },
          },
        }}
      >
        {track.map((campaign, index) => (
          <Box
            key={`${campaign.id}-${index}`}
            component={Link}
            href={`/restaurants/${campaign.restaurantSlug}`}
            // The second half is a visual-only duplicate for the seamless
            // loop; screen readers should only hear each headline once.
            aria-hidden={index >= campaigns.length}
            tabIndex={index >= campaigns.length ? -1 : undefined}
            sx={{
              flexShrink: 0,
              display: "block",
              textDecoration: "none",
              borderRadius: 999,
              px: 2.5,
              py: 1,
              backgroundColor: "primary.main",
              whiteSpace: "nowrap",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#FFFFFF" }}>
              {campaign.headline}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
