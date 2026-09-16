@AGENTS.md

# Foodlicious

## Overview

A Foodhub-style online food ordering webapp scoped to **T Nagar, Chennai**. This is a **multi-restaurant marketplace** (not a single restaurant's site): many T Nagar restaurants list menus, and end consumers browse and order from any of them. This is a learning/portfolio project — prioritize clean, understandable code over production hardening.

Key scope decisions:
- **Fulfillment: pickup only.** No delivery logistics, no courier/delivery-partner role, no live tracking.
- **Payments: mocked/simulated.** No real payment gateway is integrated. Checkout should be structured so a real gateway (e.g. Razorpay) could be swapped in later without a redesign.
- **Auth: email + password.** No social login, no phone OTP.
- **Deployment: local only for now.** No cloud hosting/CI setup yet.

## Roles

- **Customer** — browses restaurants/menus, places pickup orders, views order history/status.
- **Restaurant Admin** — manages their own restaurant's menu and incoming orders.
- **Platform Super-Admin** — onboards/approves restaurants, oversees the platform.

There is no delivery-partner role.

## Tech stack

- **Next.js (App Router, TypeScript)** — full-stack only. No separate backend/API service.
- **Mutations use Server Actions**, not route handlers — `"use server"` functions in `actions.ts` files next to the pages that call them (e.g. `src/app/(customer)/login/actions.ts`, `.../checkout/actions.ts`). Pages read data in Server Components via `src/lib`. `src/app/api/` stays empty unless something genuinely needs a route handler (a webhook, a non-Next.js client) — don't add one for ordinary form submissions.
- **PostgreSQL** via **Prisma ORM**, using the `prisma-client` generator + `@prisma/adapter-pg` driver adapter (Prisma 7). Relational data (restaurants → menu items, users → orders → order items) fits a relational DB much better than NoSQL.
- **Material UI (MUI v9)** with Emotion for styling. The theme — palette, typography, component defaults — lives in `src/theme.ts` and is applied by `src/components/theme-registry.tsx`; `@mui/material-nextjs/v16-appRouter` handles Emotion SSR from `src/app/layout.tsx`. Brand colours are white (canvas and surfaces) and Tomato Burst (every interactive element), with Sunshine for ratings/highlight badges, Forest Green for success/vegetarian markers, and Kiwi as a secondary accent. There is no utility-class framework: Tailwind was removed during the MUI migration, because two CSS resets and competing layer order is not worth maintaining.
- **Docker Compose** runs Postgres locally (`docker-compose.yml`).

Why this stack: one language (TypeScript) across the whole app keeps context-switching low for a learning project, and Prisma gives type-safe queries and migrations that match the relational shape of this domain (orders referencing menu items, restaurants, and users with foreign keys and transactional integrity).

## Project structure

```
src/
  app/
    (customer)/            # Customer-facing routes — the v1 journey lives entirely here
      login/                 # F1: login/logout (page, form, Server Actions)
      basket/                # F4: basket page
      checkout/              # F5/F6: checkout page, CheckoutView, placeOrderAction
      orders/[orderId]/      # F6: order confirmation page
      restaurants/[slug]/    # F3: restaurant menu page
      page.tsx               # F2: restaurant discovery (search + card grid)
      layout.tsx              # BasketProvider + SiteHeader
    (restaurant-admin)/
      admin/               # Restaurant admin routes — still a placeholder stub -> /admin
    (super-admin)/
      platform/            # Platform super-admin routes — still a placeholder stub -> /platform
    api/                   # Empty. Mutations are Server Actions, not route handlers — see Tech stack.
  proxy.ts                 # Optimistic route protection (this Next.js version's renamed middleware)
  lib/                     # Server-side code: db.ts, session.ts, dal.ts, restaurants.ts, basket.ts,
                            # pricing.ts, format.ts, favorites.ts, auth/, orders/, payments/
  components/              # Shared React components (BasketProvider, SiteHeader, menu/basket UI,
                            # restaurant card carousel, rating stars, favourite button)
prisma/
  schema.prisma            # User, Restaurant, MenuCategory, MenuItem, Order, OrderItem, Favorite
  seed.ts                  # Idempotent seed: 10 real T Nagar restaurants (ratings, pickup times,
                            # photo carousels), 91 items with photos, 30 recommended, 2 demo customers
tests/
  browser/                 # Playwright specs that drive a page
  logic/                   # Playwright specs that call src/lib directly, no browser
  support/                 # Shared test helpers (db, auth, basket, global-setup)
docs/
  prd/customer-ordering.md # Requirements + Appendix B test cases (source of truth for behavior)
  features.md              # Feature-by-feature build log — read this first when resuming work
.claude/
  agents/feature-reviewer.md   # Independent reviewer, no author context
  skills/review-feature/       # /review-feature F<n> — forks to feature-reviewer, fixes what it finds
  hooks/                       # Stop hook blocking an unreviewed src/tests change
docker-compose.yml          # Local Postgres
```

The `(customer)`, `(restaurant-admin)`, and `(super-admin)` folders are [route groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups) — they organize routes by role without affecting the URL, except where a named segment inside them (`admin`, `platform`) does add a path segment.

**Current state: v1 customer journey complete (F0–F6).** Login, restaurant discovery/search, menus, basket, checkout, and simulated payment through to order confirmation all work end to end — see [docs/features.md](docs/features.md) for the full build log. The UI was rebuilt on Material UI (white and bronze, UberEats-style) on 2026-09-14, and F7 added the discovery and menu experience: per-store photo carousels, star ratings with review counts, pickup times, vegetarian markers, per-user favourites, menu item photos and a Recommended section. **Recommended repeats dishes that also appear in their category, so anything locating a menu item must scope to `#menu-categories`.** Restaurant-admin and platform-admin are still placeholder stubs. Features are added incrementally on request — do not build ahead of what's asked.

## Local development

```bash
cp .env.example .env
npm run db:up      # start Postgres via Docker Compose
npm run dev         # start Next.js dev server
```

- `npm run db:up` / `npm run db:down` — start/stop the local Postgres container.
- Prisma config lives in `prisma7.config.ts` (Prisma 7 config format); `DATABASE_URL` is read from `.env`.
- Keep `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` in `.env` in sync with the credentials embedded in `DATABASE_URL`.
- `npm run db:migrate` / `npm run db:seed` — apply migrations / run the idempotent seed (`prisma/seed.ts`). Prisma 7's `migrate reset` does **not** auto-seed even with `migrations.seed` configured — always run seed as its own step.
- Demo accounts: `priya@example.com` / `arjun@example.com`, password `password123`.

## Testing

**Every test case is a Playwright test — there is no other test runner.** Test cases live in `docs/prd/customer-ordering.md`'s Appendix B; every test title starts with its ID (e.g. `TC-4.6 …`).

- `tests/browser/*.spec.ts` — drive a real page with `page`.
- `tests/logic/*.spec.ts` — call `src/lib` functions directly, no `page` fixture, no browser launched.
- `npm test` runs the full suite. `globalSetup` (`tests/support/global-setup.ts`) resets and reseeds `TEST_DATABASE_URL` first — **never** point it at the same database as `DATABASE_URL`.
- `npm run tc:check` (optionally `-- 1 2 …`) fails, listing them, if any Appendix B test case has no matching test title.
- `playwright.config.ts` sets `process.env.DATABASE_URL = TEST_DATABASE_URL` for the whole test process (not just the spawned dev-server child) — logic tests import `src/lib/db.ts` directly, with no HTTP hop that would otherwise carry an env override.

## Independent review

Every feature is reviewed by `.claude/skills/review-feature` (`/review-feature F<n>`, e.g. `/review-feature F3` or `/review-feature F5 F6` for features built together). It forks to `.claude/agents/feature-reviewer.md` — an agent with **no access to the implementing session's context** — which fixes what it finds rather than only reporting. A feature counts as reviewed only once a *fresh* instance returns a clean `PASS` with no changes. A Stop hook (`.claude/hooks/require-review.sh`) blocks ending a session if `src/` or `tests/` changed since the last recorded `PASS`.

## Conventions

- TypeScript strict mode; avoid `any`.
- No comments unless explaining a non-obvious *why* (a workaround, a subtle constraint) — never restate what the code already says.
- Style with MUI — the `sx` prop and theme tokens (`primary.main`, `text.secondary`, `divider`) — not per-component CSS files. `src/app/globals.css` carries base document rules only.
- **A Server Component cannot pass a function to a MUI component.** Both `component={NextLink}` and an `sx` callback (`sx={{ background: (theme) => … }}`) push a function across the RSC boundary, and the page dies with "Functions cannot be passed directly to Client Components". Use the pre-bound wrappers in `src/components/next-link-mui.tsx` (`LinkButton`, `LinkTypography`, `LinkCardActionArea`, `TextLink`) and literal values in `sx`. Inside a `"use client"` file both forms are fine.
- Interactive Tomato is `#C43A2F` (5.26:1 on white). The lighter `#E4573F` companion is only 3.66:1, which fails WCAG AA for text and button fills, so it is limited to gradients, borders and large accents. Sunshine (`#A87900` for icons, `#F4B400` for filled badge backgrounds) and Kiwi (`#5B8C2A` for icons/borders, `#8BC34A` for filled badge backgrounds) follow the same text-vs-fill split — see `src/theme.ts`'s `brand` export.
- The Playwright suite pins the accessibility contract (roles, labels, exact strings). Before changing markup, check what the tests assert — e.g. menu and basket rows must stay `<li>`, totals must stay single strings like `Subtotal: ₹220`, and the basket link's name must be exactly `Basket` or `Basket (1)`.
- Use `zod` for input validation at every server boundary: Server Action inputs, localStorage-persisted state (`parseStoredBasket`). Prefer `.strict()` when the shape must reject unrecognized fields outright rather than silently drop them (e.g. a client-supplied price).
- Prefer editing/extending existing files over introducing new patterns; keep the three role-based route groups as the organizing structure for pages.
- Don't add features, roles, or infrastructure (delivery tracking, real payments, social login, deployment configs) beyond what's been explicitly requested — this project grows one confirmed feature at a time.
