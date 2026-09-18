"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

export function MenuItemImage({ src, name }: { src: string; name: string }) {
  const [open, setOpen] = useState(false);

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
          src={src}
          alt=""
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
