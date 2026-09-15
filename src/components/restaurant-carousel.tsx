"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const MEDIA_HEIGHT = 168;

// The carousel sits inside the card's link, so every control here has to
// cancel the click before it turns into a navigation. They are spans with a
// button role rather than <button>, because a button inside an <a> is invalid
// markup.
function ArrowControl({
  label,
  onActivate,
  side,
  children,
}: {
  label: string;
  onActivate: () => void;
  side: "left" | "right";
  children: React.ReactNode;
}) {
  return (
    <Box
      component="span"
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={(event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        onActivate();
      }}
      onKeyDown={(event: React.KeyboardEvent) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        event.stopPropagation();
        onActivate();
      }}
      sx={{
        position: "absolute",
        top: "50%",
        [side]: 8,
        transform: "translateY(-50%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 28,
        width: 28,
        borderRadius: "50%",
        cursor: "pointer",
        backgroundColor: "rgba(255, 255, 255, 0.92)",
        color: "text.primary",
        "&:hover": { backgroundColor: "#FFFFFF" },
      }}
    >
      {children}
    </Box>
  );
}

export function RestaurantCarousel({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const show = (next: number) => setIndex(((next % count) + count) % count);

  return (
    <Box sx={{ position: "relative", height: MEDIA_HEIGHT, overflow: "hidden" }}>
      <Box
        component="img"
        src={images[index]}
        alt={`${name} photo ${index + 1} of ${count}`}
        className="restaurant-card__media"
        sx={{
          display: "block",
          height: MEDIA_HEIGHT,
          width: "100%",
          objectFit: "cover",
          transition: "transform 240ms ease",
        }}
      />

      {count > 1 && (
        <>
          <ArrowControl label="Previous photo" side="left" onActivate={() => show(index - 1)}>
            <ChevronLeftIcon sx={{ fontSize: 20 }} />
          </ArrowControl>
          <ArrowControl label="Next photo" side="right" onActivate={() => show(index + 1)}>
            <ChevronRightIcon sx={{ fontSize: 20 }} />
          </ArrowControl>

          <Box
            sx={{
              position: "absolute",
              bottom: 8,
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
                  width: dot === index ? 16 : 6,
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
