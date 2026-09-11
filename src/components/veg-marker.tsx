export function VegMarker({ isVeg }: { isVeg: boolean }) {
  const label = isVeg ? "Vegetarian" : "Non-vegetarian";
  const color = isVeg ? "border-green-600" : "border-red-600";
  const dotColor = isVeg ? "bg-green-600" : "bg-red-600";

  return (
    <span
      role="img"
      aria-label={label}
      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center border ${color}`}
    >
      <span className={`h-2 w-2 rounded-full ${dotColor}`} />
    </span>
  );
}
