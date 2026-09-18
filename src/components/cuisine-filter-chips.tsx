import Box from "@mui/material/Box";
import CheckIcon from "@mui/icons-material/Check";
import { LinkChip, TextLink } from "@/components/next-link-mui";

function hrefFor(cuisine: string, activeCuisine: string | undefined, q: string | undefined) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (cuisine !== activeCuisine) params.set("cuisine", cuisine);
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

function clearHref(q: string | undefined) {
  return q ? `/?${new URLSearchParams({ q }).toString()}` : "/";
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
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mb: 4 }}>
      <Box component="nav" aria-label="Browse by category" sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {cuisines.map((cuisine) => {
          const active = cuisine === activeCuisine;
          return (
            <LinkChip
              key={cuisine}
              href={hrefFor(cuisine, activeCuisine, q)}
              color={active ? "primary" : "default"}
              // Icon goes inside `label`, not the `icon` prop: MUI clones
              // `icon` via cloneElement, which doesn't render on the first
              // SSR pass under `next dev` and causes a hydration mismatch
              // (see the F7 review notes for the same bug on RestaurantCard).
              label={
                active ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <CheckIcon sx={{ fontSize: 16 }} />
                    {cuisine}
                  </Box>
                ) : (
                  cuisine
                )
              }
            />
          );
        })}
      </Box>
      {activeCuisine && (
        <TextLink href={clearHref(q)} sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
          Clear all
        </TextLink>
      )}
    </Box>
  );
}
