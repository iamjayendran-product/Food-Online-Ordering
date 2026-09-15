"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { toggleFavoriteAction } from "@/app/(customer)/actions";

export function FavoriteButton({
  restaurantId,
  restaurantName,
  initialIsFavorite,
}: {
  restaurantId: string;
  restaurantName: string;
  initialIsFavorite: boolean;
}) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    // Optimistic: flip straight away, put it back if the server disagrees.
    const next = !isFavorite;
    setIsFavorite(next);

    startTransition(async () => {
      const result = await toggleFavoriteAction(restaurantId);
      if (result.status === "UNAUTHENTICATED") {
        setIsFavorite(!next);
        router.push("/login?next=%2F");
        return;
      }
      if (result.status === "INVALID_RESTAURANT") {
        setIsFavorite(!next);
        return;
      }
      setIsFavorite(result.isFavorite);
    });
  }

  return (
    <IconButton
      onClick={handleClick}
      disabled={pending}
      aria-label={
        isFavorite ? `Remove ${restaurantName} from favourites` : `Add ${restaurantName} to favourites`
      }
      aria-pressed={isFavorite}
      size="small"
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.92)",
        color: isFavorite ? "primary.main" : "text.secondary",
        "&:hover": { backgroundColor: "#FFFFFF" },
      }}
    >
      {isFavorite ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
    </IconButton>
  );
}
