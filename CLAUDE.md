@AGENTS.md

# T Nagar Food Ordering

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

- **Next.js (App Router, TypeScript)** — full-stack only. No separate backend/API service; API routes live inside the Next.js app (`src/app/api/`).
- **PostgreSQL** via **Prisma ORM** — relational data (restaurants → menu items, users → orders → order items) fits a relational DB much better than NoSQL.
- **Tailwind CSS** for styling.
- **Docker Compose** runs Postgres locally (`docker-compose.yml`).

Why this stack: one language (TypeScript) across the whole app keeps context-switching low for a learning project, and Prisma gives type-safe queries and migrations that match the relational shape of this domain (orders referencing menu items, restaurants, and users with foreign keys and transactional integrity).

## Project structure

```
src/
  app/
    (customer)/           # Customer-facing routes (browse restaurants, cart, checkout, order history)
    (restaurant-admin)/
      admin/               # Restaurant admin routes (menu management, incoming orders) -> /admin
    (super-admin)/
      platform/            # Platform super-admin routes (restaurant onboarding/approval) -> /platform
    api/                   # Route handlers backing all of the above
  lib/                     # Shared server-side code: Prisma client singleton, auth config, validation
  components/              # Shared React components
prisma/
  schema.prisma            # Database schema (models not defined yet)
docker-compose.yml          # Local Postgres
```

The `(customer)`, `(restaurant-admin)`, and `(super-admin)` folders are [route groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups) — they organize routes by role without affecting the URL, except where a named segment inside them (`admin`, `platform`) does add a path segment.

**Current state: structure only.** No database models, no auth, no pages beyond stubs exist yet. Features will be added incrementally on request — do not build ahead of what's asked.

## Local development

```bash
cp .env.example .env
npm run db:up      # start Postgres via Docker Compose
npm run dev         # start Next.js dev server
```

- `npm run db:up` / `npm run db:down` — start/stop the local Postgres container.
- Prisma config lives in `prisma7.config.ts` (Prisma 7 config format); `DATABASE_URL` is read from `.env`.
- Keep `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` in `.env` in sync with the credentials embedded in `DATABASE_URL`.

## Conventions

- TypeScript strict mode; avoid `any`.
- No comments unless explaining a non-obvious *why* (a workaround, a subtle constraint) — never restate what the code already says.
- Tailwind CSS for all styling; avoid separate CSS files per component.
- Use `zod` for input validation at API boundaries once API routes are built.
- Prefer editing/extending existing files over introducing new patterns; keep the three role-based route groups as the organizing structure for pages.
- Don't add features, roles, or infrastructure (delivery tracking, real payments, social login, deployment configs) beyond what's been explicitly requested — this project grows one confirmed feature at a time.
