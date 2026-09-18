import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { brand } from "@/theme";

const MAX_STARS = 5;

// `onDark`: for use over a photo with a gradient scrim (the menu page's
// hero), where the default ink/warning colors don't have enough contrast.
export function RatingStars({
  rating,
  reviewCount,
  onDark = false,
}: {
  rating: number;
  reviewCount: number;
  onDark?: boolean;
}) {
  const rounded = Math.round(rating * 2) / 2;

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
      // One label for the whole control: five separate icons would otherwise
      // be read out one by one.
      role="img"
      aria-label={`Rated ${rating} out of 5 from ${reviewCount} reviews`}
    >
      <Box sx={{ display: "flex", color: onDark ? brand.sunshineFill : "warning.main" }}>
        {Array.from({ length: MAX_STARS }, (_, index) => {
          const position = index + 1;
          if (rounded >= position) return <StarIcon key={position} sx={{ fontSize: 16 }} />;
          if (rounded >= position - 0.5) return <StarHalfIcon key={position} sx={{ fontSize: 16 }} />;
          return <StarBorderIcon key={position} sx={{ fontSize: 16 }} />;
        })}
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 600, color: onDark ? "#FFFFFF" : undefined }}>
        {rating.toFixed(1)}
      </Typography>
      <Typography
        variant="body2"
        color={onDark ? undefined : "text.secondary"}
        sx={onDark ? { color: "rgba(255, 255, 255, 0.85)" } : undefined}
      >
        ({reviewCount})
      </Typography>
    </Box>
  );
}
