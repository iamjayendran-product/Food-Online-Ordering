import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import { listRestaurants } from "@/lib/restaurants";
import { listFavoriteRestaurantIds } from "@/lib/favorites";
import { getCurrentUser } from "@/lib/dal";
import { RestaurantCard } from "@/components/restaurant-card";
import { TextLink } from "@/components/next-link-mui";
import { brand } from "@/theme";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [restaurants, user] = await Promise.all([listRestaurants(q), getCurrentUser()]);
  const favoriteIds = user ? await listFavoriteRestaurantIds(user.id) : [];
  const favorites = new Set(favoriteIds);

  return (
    <Box>
      <Box
        sx={{
          borderRadius: 4,
          px: { xs: 2.5, sm: 5 },
          py: { xs: 4, sm: 6 },
          mb: 4,
          // Literal, not an sx callback: a theme callback is a function, and a
          // Server Component can't pass one to a Client Component.
          background: `linear-gradient(135deg, ${brand.tomatoDark} 0%, ${brand.tomatoLight} 100%)`,
          color: "#FFFFFF",
        }}
      >
        <Typography variant="h1" sx={{ maxWidth: 560, fontSize: { xs: "1.75rem", sm: "2.25rem" } }}>
          Order ahead. Skip the queue.
        </Typography>
        <Typography sx={{ mt: 1, mb: 3, opacity: 0.92 }}>
          Pickup from restaurants across T Nagar, Chennai.
        </Typography>

        <Box
          component="form"
          sx={{ display: "flex", gap: 1.5, maxWidth: 560, flexWrap: { xs: "wrap", sm: "nowrap" } }}
        >
          <TextField
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search restaurants"
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
                sx: { borderRadius: 999, height: 48 },
              },
            }}
            sx={{ "& fieldset": { border: "none" } }}
          />
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            sx={{ height: 48, flexShrink: 0, px: 3 }}
          >
            Search
          </Button>
        </Box>
      </Box>

      {restaurants.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography sx={{ fontWeight: 600 }}>
            {q ? `No restaurants match "${q}".` : "No restaurants available."}
          </Typography>
          <TextLink href="/" sx={{ display: "inline-block", mt: 1.5 }}>
            Clear search
          </TextLink>
        </Box>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {restaurants.length} {restaurants.length === 1 ? "restaurant" : "restaurants"}
            {q ? ` matching "${q}"` : " in T Nagar"}
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
