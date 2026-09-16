"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";

const BANNER_HEIGHT = 280;
const AUTO_ADVANCE_MS = 4000;

export function RestaurantHeroBanner({ images, name }: { images: string[]; name: string }) {
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

  if (count === 0) return null;

  return (
    <Box
      onMouseEnter={stop}
      onMouseLeave={start}
      sx={{
        position: "relative",
        height: BANNER_HEIGHT,
        overflow: "hidden",
        borderRadius: 4,
        mb: 3,
      }}
    >
      <Box
        component="img"
        src={images[index]}
        alt={`${name} banner photo ${index + 1} of ${count}`}
        sx={{ display: "block", height: BANNER_HEIGHT, width: "100%", objectFit: "cover" }}
      />

      {count > 1 && (
        <Box
          sx={{
            position: "absolute",
            bottom: 12,
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
    </Box>
  );
}
