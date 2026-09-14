import Box from "@mui/material/Box";

export function VegMarker({ isVeg }: { isVeg: boolean }) {
  const label = isVeg ? "Vegetarian" : "Non-vegetarian";
  const color = isVeg ? "success.main" : "error.main";

  return (
    <Box
      role="img"
      aria-label={label}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        height: 16,
        width: 16,
        borderRadius: "3px",
        border: "1.5px solid",
        borderColor: color,
      }}
    >
      <Box sx={{ height: 8, width: 8, borderRadius: "50%", backgroundColor: color }} />
    </Box>
  );
}
