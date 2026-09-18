"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { RatingStars } from "@/components/rating-stars";
import { brand } from "@/theme";

const BANNER_HEIGHT = 360;
const AUTO_ADVANCE_MS = 4000;

type RestaurantHeroBannerProps = {
  images: string[];
  name: string;
  cuisines: string[];
  address: string;
  pickupMinutes: number;
  ratingAvg: number;
  reviewCount: number;
};

export function RestaurantHeroBanner({
  images,
  name,
  cuisines,
  address,
  pickupMinutes,
  ratingAvg,
  reviewCount,
}: RestaurantHeroBannerProps) {
  const [index, setIndex] = useState(0);
  const count = images.length;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- start/stop close over `count`, which is stable for a given restaurant
  }, [count]);

  return (
    <Box
      onMouseEnter={stop}
      onMouseLeave={start}
      sx={{ position: "relative", height: BANNER_HEIGHT, overflow: "hidden", borderRadius: 4, mb: 3 }}
    >
      {count > 0 ? (
        <Box
          component="img"
          src={images[index]}
          alt={`${name} banner photo ${index + 1} of ${count}`}
          sx={{ display: "block", height: BANNER_HEIGHT, width: "100%", objectFit: "cover" }}
        />
      ) : (
        // No photos: a solid brand-gradient fallback so the store info below
        // still has something to sit on, instead of an empty gap.
        <Box
          sx={{
            height: BANNER_HEIGHT,
            width: "100%",
            background: `linear-gradient(135deg, ${brand.tomatoLight} 0%, ${brand.tomatoDark} 100%)`,
          }}
        />
      )}

      {count > 1 && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: 0.75,
          }}
        >
          {images.map((image, dot) => (
            <Box
              key={image}
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
      )}

      {/* Store info superimposed over the photo, legible via a bottom-up
          gradient scrim instead of a separate stacked card below. */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(0deg, rgba(28, 25, 23, 0.9) 0%, rgba(28, 25, 23, 0.55) 55%, rgba(28, 25, 23, 0.05) 85%)",
          display: "flex",
          alignItems: "flex-end",
          px: { xs: 2.5, sm: 4 },
          pb: { xs: 2.5, sm: 3 },
        }}
      >
        <Box sx={{ maxWidth: 640 }}>
          <Typography variant="h1" sx={{ color: "#FFFFFF" }}>
            {name}
          </Typography>
          <Typography sx={{ mt: 0.75, color: "rgba(255, 255, 255, 0.9)" }}>
            {cuisines.join(", ")}
          </Typography>
          <Box sx={{ mt: 1.25 }}>
            <RatingStars rating={ratingAvg} reviewCount={reviewCount} onDark />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1.5 }}>
            <PlaceOutlinedIcon fontSize="small" sx={{ color: "rgba(255, 255, 255, 0.9)" }} />
            <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
              {address}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 2 }}>
            <Chip
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <ScheduleIcon sx={{ fontSize: 15 }} />
                  {`Ready in ${pickupMinutes} mins`}
                </Box>
              }
              size="small"
              sx={{ backgroundColor: "rgba(255, 255, 255, 0.94)" }}
            />
            <Chip label="Pickup only" size="small" sx={{ backgroundColor: "rgba(255, 255, 255, 0.94)" }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
