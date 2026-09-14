import Box from "@mui/material/Box";

const MEDIA_HEIGHT = 168;

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

export function RestaurantImage({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  if (imageUrl) {
    return (
      <Box
        component="img"
        src={imageUrl}
        alt=""
        className="restaurant-card__media"
        sx={{
          display: "block",
          height: MEDIA_HEIGHT,
          width: "100%",
          objectFit: "cover",
          transition: "transform 240ms ease",
        }}
      />
    );
  }

  // Deliberately not an <img>: a restaurant without a photo must render no
  // image element at all, only this labelled stand-in.
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
        background: "linear-gradient(135deg, #CD7F32 0%, #5C3A16 100%)",
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
