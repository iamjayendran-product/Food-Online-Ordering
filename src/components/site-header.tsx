import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { logout } from "@/app/(customer)/login/actions";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold">
          T Nagar Food
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <span>Hi {user.name.split(" ")[0]}</span>
              <form action={logout}>
                <button type="submit" className="underline">
                  Logout
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="underline">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
