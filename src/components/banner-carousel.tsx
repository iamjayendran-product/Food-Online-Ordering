"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Link from "next/link";
import { brand } from "@/theme";
import type { CampaignItem } from "@/lib/campaigns";

const BANNER_HEIGHT = 260;
const AUTO_ADVANCE_MS = 5000;

type Slide =
  | { kind: "promo" }
  | { kind: "campaign"; campaign: CampaignItem };

export function BannerCarousel({ campaigns }: { campaigns: CampaignItem[] }) {
  const slides: Slide[] = [
    { kind: "promo" },
    ...campaigns.map((campaign) => ({ kind: "campaign" as const, campaign })),
  ];
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const show = (next: number) => setIndex(((next % count) + count) % count);

  const advanceInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const start = () => {
    if (count <= 1 || advanceInterval.current) return;
    advanceInterval.current = setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTO_ADVANCE_MS);
  };
  const stop = () => {
    if (!advanceInterval.current) return;
    clearInterval(advanceInterval.current);
    advanceInterval.current = null;
  };
  useEffect(() => {
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- start/stop close over `count`, which is stable for a given campaign list
  }, [count]);

  const slide = slides[index]!;

  return (
    <Box
      onMouseEnter={stop}
      onMouseLeave={start}
      onFocus={stop}
      onBlur={start}
      sx={{
        position: "relative",
        height: BANNER_HEIGHT,
        overflow: "hidden",
        borderRadius: 4,
        mb: 4,
      }}
    >
      {slide.kind === "promo" ? (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            px: { xs: 3, sm: 6 },
            color: "#FFFFFF",
            // Literal gradient, not an sx callback: a theme callback is a
            // function, and although this file is a Client Component, the
            // brand tokens are plain strings — keeping them literal here
            // matches the convention used everywhere else in the app.
            background: `linear-gradient(120deg, ${brand.tomato} 0%, ${brand.sunshineFill} 55%, ${brand.kiwi} 100%)`,
            backgroundSize: "200% 200%",
            animation: "foodlicious-promo-shift 6s ease infinite",
            "@keyframes foodlicious-promo-shift": {
              "0%": { backgroundPosition: "0% 50%" },
              "50%": { backgroundPosition: "100% 50%" },
              "100%": { backgroundPosition: "0% 50%" },
            },
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.9 }}
          >
            Welcome to Foodlicious
          </Typography>
          <Typography
            component="p"
            sx={{
              display: "inline-block",
              mt: 0.5,
              maxWidth: 480,
              fontFamily: "var(--font-space-grotesk), var(--font-geist-sans), system-ui, sans-serif",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              fontSize: { xs: "1.5rem", sm: "2.125rem" },
              animation: "foodlicious-promo-pulse 1.8s ease-in-out infinite",
              "@keyframes foodlicious-promo-pulse": {
                "0%, 100%": { transform: "scale(1)" },
                "50%": { transform: "scale(1.03)" },
              },
            }}
          >
            Your first order in Foodlicious is 50% off
          </Typography>
        </Box>
      ) : (
        <Box
          component={Link}
          href={`/restaurants/${slide.campaign.restaurantSlug}`}
          sx={{ display: "block", height: "100%", position: "relative" }}
        >
          {slide.campaign.imageUrl && (
            <Box
              component="img"
              src={slide.campaign.imageUrl}
              alt=""
              sx={{ display: "block", height: "100%", width: "100%", objectFit: "cover" }}
            />
          )}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(0deg, rgba(28,25,23,0.72) 0%, rgba(28,25,23,0.15) 55%, rgba(28,25,23,0) 100%)",
              display: "flex",
              alignItems: "flex-end",
              px: { xs: 3, sm: 6 },
              pb: { xs: 4, sm: 5 },
            }}
          >
            <Typography
              component="p"
              sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: { xs: "1.125rem", sm: "1.5rem" }, maxWidth: 480 }}
            >
              {slide.campaign.headline}
            </Typography>
          </Box>
        </Box>
      )}

      {count > 1 && (
        <>
          <IconButton
            aria-label="Previous promotion"
            onClick={() => show(index - 1)}
            sx={{
              position: "absolute",
              top: "50%",
              left: 8,
              transform: "translateY(-50%)",
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              "&:hover": { backgroundColor: "#FFFFFF" },
            }}
            size="small"
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label="Next promotion"
            onClick={() => show(index + 1)}
            sx={{
              position: "absolute",
              top: "50%",
              right: 8,
              transform: "translateY(-50%)",
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              "&:hover": { backgroundColor: "#FFFFFF" },
            }}
            size="small"
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>

          <Box
            sx={{
              position: "absolute",
              bottom: 10,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              gap: 0.75,
            }}
          >
            {slides.map((_, dot) => (
              <Box
                key={dot}
                sx={{
                  height: 6,
                  width: dot === index ? 20 : 6,
                  borderRadius: 999,
                  transition: "width 160ms ease, background-color 160ms ease",
                  backgroundColor: dot === index ? "#FFFFFF" : "rgba(255, 255, 255, 0.6)",
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
