import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import StarBorderIcon from "@mui/icons-material/StarBorder";

const MAX_STARS = 5;

export function RatingStars({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const rounded = Math.round(rating * 2) / 2;

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
      // One label for the whole control: five separate icons would otherwise
      // be read out one by one.
      role="img"
      aria-label={`Rated ${rating} out of 5 from ${reviewCount} reviews`}
    >
      <Box sx={{ display: "flex", color: "primary.light" }}>
        {Array.from({ length: MAX_STARS }, (_, index) => {
          const position = index + 1;
          if (rounded >= position) return <StarIcon key={position} sx={{ fontSize: 16 }} />;
          if (rounded >= position - 0.5) return <StarHalfIcon key={position} sx={{ fontSize: 16 }} />;
          return <StarBorderIcon key={position} sx={{ fontSize: 16 }} />;
        })}
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {rating.toFixed(1)}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        ({reviewCount})
      </Typography>
    </Box>
  );
}
