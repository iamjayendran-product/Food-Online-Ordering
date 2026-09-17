import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import { listRestaurants, listCuisines } from "@/lib/restaurants";
import { listFavoriteRestaurantIds } from "@/lib/favorites";
import { listCampaigns } from "@/lib/campaigns";
import { getCurrentUser } from "@/lib/dal";
import { RestaurantCard } from "@/components/restaurant-card";
import { BannerCarousel } from "@/components/banner-carousel";
import { CuisineFilterChips } from "@/components/cuisine-filter-chips";
import { TextLink } from "@/components/next-link-mui";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cuisine?: string }>;
}) {
  const { q, cuisine } = await searchParams;
  const [restaurants, user, campaigns, cuisines] = await Promise.all([
    listRestaurants(q, cuisine),
    getCurrentUser(),
    listCampaigns(),
    listCuisines(),
  ]);
  const favoriteIds = user ? await listFavoriteRestaurantIds(user.id) : [];
  const favorites = new Set(favoriteIds);

  const emptyMessage = q
    ? cuisine
      ? `No restaurants match "${q}" in ${cuisine}.`
      : `No restaurants match "${q}".`
    : cuisine
      ? `No restaurants in ${cuisine} yet.`
      : "No restaurants available.";

  const resultSuffix = q ? ` matching "${q}"` : cuisine ? ` in ${cuisine}` : " in T Nagar";

  return (
    <Box>
      <Typography variant="h1" sx={{ mb: 3, fontSize: { xs: "1.75rem", sm: "2.25rem" } }}>
        Order ahead. Skip the queue.
      </Typography>

      <BannerCarousel campaigns={campaigns} />

      <Box
        component="form"
        sx={{ display: "flex", gap: 1.5, maxWidth: 560, flexWrap: { xs: "wrap", sm: "nowrap" }, mb: 4 }}
      >
        <TextField
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search restaurants, items, cuisines..."
          size="small"
          fullWidth
          slotProps={{
            htmlInput: { "aria-label": "Search restaurants" },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 999, height: 40, fontSize: "0.875rem" },
            },
          }}
        />
        {cuisine ? <input type="hidden" name="cuisine" value={cuisine} /> : null}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="small"
          sx={{ height: 40, flexShrink: 0, px: 3 }}
        >
          Search
        </Button>
      </Box>

      <CuisineFilterChips cuisines={cuisines} activeCuisine={cuisine} q={q} />

      {restaurants.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography sx={{ fontWeight: 600 }}>{emptyMessage}</Typography>
          <TextLink href="/" sx={{ display: "inline-block", mt: 1.5 }}>
            Clear search
          </TextLink>
        </Box>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {restaurants.length} {restaurants.length === 1 ? "restaurant" : "restaurants"}
            {resultSuffix}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gap: 2.5,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
            }}
          >
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isFavorite={favorites.has(restaurant.id)}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
