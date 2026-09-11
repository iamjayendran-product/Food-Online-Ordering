function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

export function RestaurantImage({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- external, unconfigured image domains
    return <img src={imageUrl} alt="" className="h-32 w-full rounded object-cover" />;
  }

  return (
    <div
      role="img"
      aria-label={name}
      className="flex h-32 w-full items-center justify-center rounded bg-zinc-200 text-lg font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
    >
      {initials(name)}
    </div>
  );
}
