"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

export function MenuItemImage({ src, name }: { src: string; name: string }) {
  const [open, setOpen] = useState(false);
  // A seeded or admin-entered URL can 404 (or later stop resolving) even
  // though it looked valid when saved — drop the whole control rather than
  // showing a broken-image icon next to a real dish.
  const [broken, setBroken] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // The server-rendered <img> starts loading as soon as the HTML streams
  // in, which can finish (and fail) before React hydrates and attaches
  // `onError` below — that failure is otherwise silently missed. Checking
  // `complete`/`naturalWidth` once on mount catches it retroactively.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setBroken(true);
    }
  }, []);

  if (broken) return null;

  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View larger photo of ${name}`}
        sx={{
          p: 0,
          border: "none",
          background: "none",
          cursor: "pointer",
          borderRadius: 2,
          overflow: "hidden",
          flexShrink: 0,
          display: "block",
        }}
      >
        <Box
          component="img"
          ref={imgRef}
          src={src}
          alt=""
          onError={() => setBroken(true)}
          sx={{ display: "block", height: 96, width: 120, objectFit: "cover" }}
        />
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{ position: "relative" }}>
          <IconButton
            aria-label="Close"
            onClick={() => setOpen(false)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              "&:hover": { backgroundColor: "#FFFFFF" },
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box
            component="img"
            src={src}
            alt={name}
            sx={{ display: "block", width: "100%", maxHeight: "80vh", objectFit: "contain" }}
          />
        </Box>
      </Dialog>
    </>
  );
}
