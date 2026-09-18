"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { brand } from "@/theme";

const COLORS = [brand.tomato, brand.sunshineFill, brand.forest, brand.kiwiFill];
const PIECE_COUNT = 28;
const VARIANTS = ["a", "b", "c", "d"] as const;

type Piece = {
  left: number;
  delay: number;
  duration: number;
  color: string;
  variant: (typeof VARIANTS)[number];
};

// Random values are impure, so they're generated after mount rather than
// during render — the same reasoning as checkout-view.tsx's date bounds:
// a server render and the client's hydration pass must produce identical
// markup, and Math.random() can't guarantee that.
export function ConfettiBurst() {
  const [pieces, setPieces] = useState<Piece[] | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPieces(
      Array.from({ length: PIECE_COUNT }, () => ({
        left: 50 + (Math.random() - 0.5) * 70,
        delay: Math.random() * 0.3,
        duration: 1.3 + Math.random() * 0.7,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        variant: VARIANTS[Math.floor(Math.random() * VARIANTS.length)],
      })),
    );
  }, []);

  if (!pieces) return null;

  return (
    <Box
      aria-hidden
      data-testid="confetti-burst"
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {pieces.map((piece, index) => (
        <Box
          key={index}
          sx={{
            position: "absolute",
            top: "-12px",
            left: `${piece.left}%`,
            width: 7,
            height: 12,
            borderRadius: "1px",
            backgroundColor: piece.color,
            opacity: 0,
            animation: `foodlicious-confetti-${piece.variant} ${piece.duration}s ease-out ${piece.delay}s forwards`,
          }}
        />
      ))}

      <style>
        {`
          @keyframes foodlicious-confetti-a {
            0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
            100% { transform: translate(-70px, 220px) rotate(260deg); opacity: 0; }
          }
          @keyframes foodlicious-confetti-b {
            0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
            100% { transform: translate(60px, 230px) rotate(-300deg); opacity: 0; }
          }
          @keyframes foodlicious-confetti-c {
            0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
            100% { transform: translate(-30px, 200px) rotate(-200deg); opacity: 0; }
          }
          @keyframes foodlicious-confetti-d {
            0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
            100% { transform: translate(35px, 210px) rotate(180deg); opacity: 0; }
          }
        `}
      </style>
    </Box>
  );
}
