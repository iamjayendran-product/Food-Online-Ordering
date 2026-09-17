import Box from "@mui/material/Box";
import { LinkChip } from "@/components/next-link-mui";

function hrefFor(cuisine: string, activeCuisine: string | undefined, q: string | undefined) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (cuisine !== activeCuisine) params.set("cuisine", cuisine);
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export function CuisineFilterChips({
  cuisines,
  activeCuisine,
  q,
}: {
  cuisines: string[];
  activeCuisine?: string;
  q?: string;
}) {
  if (cuisines.length === 0) return null;

  return (
    <Box component="nav" aria-label="Browse by category" sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 4 }}>
      {cuisines.map((cuisine) => (
        <LinkChip
          key={cuisine}
          href={hrefFor(cuisine, activeCuisine, q)}
          label={cuisine}
          color={cuisine === activeCuisine ? "primary" : "default"}
        />
      ))}
    </Box>
  );
}
