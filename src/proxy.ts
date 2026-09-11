import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readSession } from "@/lib/session";

const PROTECTED_PREFIXES = ["/checkout", "/orders"];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

// Optimistic: verifies the session JWT but never touches the database.
// Routes still re-check via the DAL, which is the real authorization gate.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await readSession();

  // A Server Action call (identified by this header) expects either a
  // normal action response or a redirect the action itself issued — an
  // external redirect injected in front of it breaks the client's action
  // runtime ("unexpected response from the server"). Let it through; every
  // action here re-checks auth itself (see placeOrderAction's
  // UNAUTHENTICATED branch) and handles it without that framework error.
  const isServerAction = request.headers.has("next-action");

  if (isProtected(pathname) && !session && !isServerAction) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
