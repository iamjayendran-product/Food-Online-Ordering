import Box from "@mui/material/Box";
import { brand } from "@/theme";

const MEDIA_HEIGHT = 168;

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

/**
 * Stand-in for a restaurant with no photos. Deliberately not an <img>: a
 * photo-less restaurant must render no image element at all, only this
 * labelled tile.
 */
export function RestaurantImage({ name }: { name: string }) {
  return (
    <Box
      role="img"
      aria-label={name}
      className="restaurant-card__media"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: MEDIA_HEIGHT,
        width: "100%",
        // Literal, not an sx callback: a theme callback is a function, and a
        // Server Component can't pass one to a Client Component.
        background: `linear-gradient(135deg, ${brand.tomatoLight} 0%, ${brand.tomatoDark} 100%)`,
        color: "#FFFFFF",
        fontSize: "1.75rem",
        fontWeight: 700,
        letterSpacing: "0.02em",
        transition: "transform 240ms ease",
      }}
    >
      {initials(name)}
    </Box>
  );
}
