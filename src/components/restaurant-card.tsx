import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { RestaurantImage } from "@/components/restaurant-image";
import { LinkCardActionArea } from "@/components/next-link-mui";
import type { RestaurantCard as RestaurantCardData } from "@/lib/restaurants";

export function RestaurantCard({ restaurant }: { restaurant: RestaurantCardData }) {
  return (
    <Card
      sx={{
        height: "100%",
        overflow: "hidden",
        transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: "primary.light",
          boxShadow: "0 10px 28px rgba(28, 25, 23, 0.10)",
        },
        "&:hover .restaurant-card__media": { transform: "scale(1.04)" },
      }}
    >
      <LinkCardActionArea
        href={`/restaurants/${restaurant.slug}`}
        sx={{ display: "block", height: "100%" }}
      >
        <Box sx={{ overflow: "hidden" }}>
          <RestaurantImage name={restaurant.name} imageUrl={restaurant.imageUrl} />
        </Box>
        <CardContent sx={{ px: 2, py: 1.75 }}>
          <Typography variant="h3" component="h2">
            {restaurant.name}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1 }}>
            {restaurant.cuisines.map((cuisine) => (
              <Chip key={cuisine} label={cuisine} size="small" />
            ))}
          </Box>
        </CardContent>
      </LinkCardActionArea>
    </Card>
  );
}
