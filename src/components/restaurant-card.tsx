import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { RestaurantImage } from "@/components/restaurant-image";
import { RestaurantCarousel } from "@/components/restaurant-carousel";
import { RatingStars } from "@/components/rating-stars";
import { FavoriteButton } from "@/components/favorite-button";
import { VegMarker } from "@/components/veg-marker";
import { LinkCardActionArea } from "@/components/next-link-mui";
import type { RestaurantCard as RestaurantCardData } from "@/lib/restaurants";

export function RestaurantCard({
  restaurant,
  isFavorite,
}: {
  restaurant: RestaurantCardData;
  isFavorite: boolean;
}) {
  return (
    <Card
      sx={{
        position: "relative",
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
      {/* Outside the link on purpose: favouriting is its own action and must
          not navigate to the restaurant. */}
      <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}>
        <FavoriteButton
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
          initialIsFavorite={isFavorite}
        />
      </Box>

      <LinkCardActionArea
        href={`/restaurants/${restaurant.slug}`}
        sx={{ display: "block", height: "100%" }}
      >
        {restaurant.images.length > 0 ? (
          <RestaurantCarousel images={restaurant.images} name={restaurant.name} />
        ) : (
          <RestaurantImage name={restaurant.name} />
        )}

        <CardContent sx={{ px: 2, py: 1.75 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <VegMarker isVeg={restaurant.isPureVeg} />
            <Typography variant="h3" component="h2">
              {restaurant.name}
            </Typography>
          </Box>

          <Box sx={{ mt: 1 }}>
            <RatingStars rating={restaurant.ratingAvg} reviewCount={restaurant.reviewCount} />
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0.75, mt: 1.25 }}>
            <Chip
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <ScheduleIcon sx={{ fontSize: 15 }} />
                  {`${restaurant.pickupMinutes} mins`}
                </Box>
              }
              size="small"
            />
            {restaurant.cuisines.map((cuisine) => (
              <Chip key={cuisine} label={cuisine} size="small" />
            ))}
          </Box>
        </CardContent>
      </LinkCardActionArea>
    </Card>
  );
}
