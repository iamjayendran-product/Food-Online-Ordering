import Link from "next/link";

export default function RestaurantNotFound() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Restaurant not found</h1>
      <Link href="/" className="mt-2 inline-block underline">
        Back to restaurants
      </Link>
    </div>
  );
}
