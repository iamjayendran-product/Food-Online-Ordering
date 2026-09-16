# Foodlicious

An online food ordering webapp (Foodhub-style) for restaurants in T Nagar, Chennai. See [CLAUDE.md](./CLAUDE.md) for full project scope, architecture, and conventions.

## Getting started

1. Copy the env files:
   ```bash
   cp .env.example .env
   ```
   Fill in `SESSION_SECRET` (any long random string locally, e.g. `openssl rand -base64 32`) and confirm `TEST_DATABASE_URL` points at a separate database name from `DATABASE_URL` — the test suite resets it on every run.
2. Start Postgres locally:
   ```bash
   npm run db:up
   ```
3. Run migrations and seed demo data:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000).

To stop the database:

```bash
npm run db:down
```

### Demo accounts

Seeded customers (email + password, no sign-up):

| Email | Password |
|---|---|
| `priya@example.com` | `password123` |
| `arjun@example.com` | `password123` |

## Testing

Every test case is a Playwright test — there's no separate unit test runner. Browser specs live in `tests/browser/`, DB/logic specs (no browser) in `tests/logic/`; every test title starts with its PRD test-case ID (e.g. `TC-2.4 …`).

```bash
npm test              # run the full suite (resets and seeds the test database first)
npm run test:ui       # same, with Playwright's UI runner
npm run tc:check       # confirm every PRD Appendix B test case has a matching test
npm run tc:check -- 1 2   # scope tc:check to specific features
```

`npm test` needs `TEST_DATABASE_URL` reachable and will run `prisma migrate reset` against it on every invocation — never point it at the same database as `DATABASE_URL`.

## Independent review

Every feature is reviewed by a separate agent with no access to the implementing session's context, via `.claude/skills/review-feature` (forks to `.claude/agents/feature-reviewer.md`). It fixes what it finds rather than only reporting; a *fresh* instance must then return a clean `PASS` before a feature counts as reviewed.

```bash
/review-feature F3       # review one feature
/review-feature F5 F6    # review features built together
```

A Stop hook (`.claude/hooks/require-review.sh`, registered in `.claude/settings.json`) blocks ending a session if `src/` or `tests/` changed since the last recorded `PASS`.

## Status

**v1 customer journey complete (F0–F6):** login, restaurant discovery and search, menus, basket, checkout, and simulated payment through to order confirmation. See [docs/features.md](docs/features.md) for the full feature-by-feature build log and [docs/prd/customer-ordering.md](docs/prd/customer-ordering.md) for requirements.

Not yet built: restaurant-admin and platform-admin features (the `(restaurant-admin)` and `(super-admin)` route groups are still placeholder stubs), order history/cancellation, and anything beyond pickup-only fulfillment with simulated payment.
