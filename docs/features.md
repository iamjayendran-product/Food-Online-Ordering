# Feature Tracker: Customer Pickup Ordering v1

This is the single place to see what's being built, in what order, and where each feature stands. **Update it whenever a feature changes status.**

- **Requirements (approved 2026-09-11):** [prd/customer-ordering.md](prd/customer-ordering.md). Acceptance criteria are in *Requirements → P0*; test cases are in *Appendix B*.
- **Implementation plan:** `~/.claude/plans/for-q3-i-choose-snug-gizmo.md` (local to the owner's machine)

**Status values:** `Not started` · `In progress` · `In review` (independent reviewer running or fixing) · `Awaiting sign-off` (reviewer PASS, owner to check) · `Done` · `Blocked`

---

## Status overview

| ID | Feature | PRD requirement | Depends on | Test cases | Status | Reviewer | Owner sign-off |
|---|---|---|---|---|---|---|---|
| F0 | Foundation | (none, technical) | none | none (build/seed checks) | **Done** | reviewed together with F1 | 2026-09-11 |
| F1 | Login and logout | P0-1 | F0 | TC-1.1–1.12 (12) | **Done** | PASS (round 3/3) | 2026-09-11 |
| F2 | Restaurant discovery | P0-2 | F0 | TC-2.1–2.7 (7) | **Done** | PASS (round 1/1) | 2026-09-11 |
| F3 | Restaurant menu | P0-3 | F2 | TC-3.1–3.7 (7) | **Done** | PASS (round 1/1) | 2026-09-11 |
| F4 | Basket | P0-4 | F3 | TC-4.1–4.12 (12) | **Done** | PASS (round 1/1) | 2026-09-11 |
| F5 | Checkout | P0-5 | F1, F4 | TC-5.1–5.5 (5) | Not started | none | none |
| F6 | Place order and confirmation | P0-6 | F5 | TC-6.1–6.16 (16) + TC-J.1 | Not started | none | none |

**Build order:** F0 → F1 → F2 → F3 → F4 → F5 → F6, one feature per cycle.

## Supporting work

| Item | Status | Notes |
|---|---|---|
| PRD via `product-management:write-spec` | **Done**, approved 2026-09-11 | `docs/prd/customer-ordering.md` |
| Plugins installed | **Done** 2026-09-11 | `playwright@claude-plugins-official` (project scope), `product-management@knowledge-work-plugins` (local scope) |
| `.claude/agents/` directory | **Done** | `.gitkeep`, created before a restart so the directory is watched |
| Independent reviewer (agent + `review-feature` skill) | **Done** 2026-09-11 | `.claude/agents/feature-reviewer.md` + `.claude/skills/review-feature/SKILL.md`. RED/GREEN/REFACTOR results in F1 notes below |
| Stop hook forcing review | **Done** 2026-09-11 | `.claude/hooks/{review-fingerprint,mark-reviewed,require-review}.sh`, registered in `.claude/settings.json` |
| `tc:check` coverage script | **Done** 2026-09-11 | `scripts/check-test-cases.mjs`; parses all 60 Appendix B IDs correctly, filters by feature number |

---

## Definition of Done (every feature)

1. The feature is implemented within its PRD scope. Nothing from *Non-Goals* is added.
2. Every test case for the feature has a Playwright test whose **title starts with its ID** (e.g. `TC-2.4 search with no results…`). Browser tests go in `tests/browser/`, logic/DB tests in `tests/logic/`.
3. All of these pass: `npm run lint`, `npx tsc --noEmit`, `npm run tc:check`, `npm test`, `npm run build`.
4. **Independent review:** `/review-feature F<n>` runs in a separate agent with no author context. If it returns `FIXED`, run it again, which starts a fresh reviewer, until one returns **`PASS`** with no changes. After 3 rounds without PASS, escalate to the owner.
5. **Owner sign-off**, then set the status to `Done`.

---

## F0: Foundation

**Purpose:** the technical groundwork every customer feature needs. Not user-facing.

**Deliverables**
- **Dependencies:**
  - deps: `@prisma/adapter-pg`, `pg`, `zod`, `jose`, `bcryptjs`, `server-only`
  - dev: `dotenv`, `tsx`, `@types/pg`, `@playwright/test`
  - then run `npx playwright install chromium`
- **Scripts:** `db:migrate`, `db:seed`, `db:reset`, `postinstall` (`prisma generate`), `test` (`playwright test`), `test:ui`, `tc:check`
- **Prisma schema:**
  - models `User`, `Restaurant`, `MenuCategory`, `MenuItem`, `Order`, `OrderItem`
  - enum `OrderStatus` (`PENDING_PAYMENT`, `PAYMENT_FAILED`, `PLACED`)
  - money in integer paise
  - no `role` field yet
- **`prisma7.config.ts`:** add `migrations.seed: "tsx prisma/seed.ts"`. Prisma 7 doesn't auto-seed.
- **`prisma/seed.ts`**, idempotent (`update` resets every field):
  - 6 fictional T Nagar restaurants: Ranganathan Street Biryani, Pondy Bazaar Tiffin House, Panagal Park Chaat Corner, Usman Road Mess, Burkit Road Bakes, Thyagaraya Filter Kaapi
  - one pure-veg restaurant, one without an image, one with an empty category, at least one unavailable item, about 10 items each
  - customers `priya@example.com` and `arjun@example.com`, password `password123`, bcrypt-hashed
- **`src/lib/db.ts`:** Prisma client singleton using `PrismaPg`. Doesn't import `server-only`, so logic tests can use it.
- **`.env.example`:** add `SESSION_SECRET` and `TEST_DATABASE_URL` (database `tnagar_food_ordering_test`).
- **`playwright.config.ts`:**
  - Chromium; `workers: 1`
  - `webServer`: `next dev --port 3100` with the test DB
  - `globalSetup`: reset + seed the test DB
- **`tests/support/`:** `db.ts` (`reseed()`), `auth.ts` (`loginAs`), `basket.ts` (`setStoredBasket`).
- **`scripts/check-test-cases.mjs`:** reads TC IDs from PRD Appendix B and fails, listing them, if any lacks a test. It accepts feature numbers so it only checks features built so far (e.g. `npm run tc:check -- 1 2`).
- **Layout shell:**
  - **delete `src/app/page.tsx`**, which would clash with `src/app/(customer)/page.tsx` at `/`
  - update metadata in `src/app/layout.tsx`
  - `src/app/(customer)/layout.tsx` with basket provider + site header

**Done when:**
- migrate works, and running the seed twice leaves the same data
- lint, tsc and build pass
- `npm test` runs, even with no specs yet

**Watch out for:**
- confirm the generated client import path (`@/generated/prisma/client`) after the first `prisma generate`
- confirm Playwright's TypeScript loader can import the generated Prisma client

**Built 2026-09-11. Rulings made along the way (no reviewer exists yet for F0 alone; owner to confirm at sign-off):**
- **`(customer)/layout.tsx` ships without `BasketProvider`.** The plan's F0 text names it, but `BasketProvider` isn't built until F4 — wiring a stand-in now would be rework. `SiteHeader` is a minimal placeholder (app name only, no login/basket state) until F1 and F4 land.
- **Prisma 7's `migrate reset` doesn't auto-seed**, even with `migrations.seed` configured (the plan's F0 text already flagged this). `tests/support/global-setup.ts` runs `prisma migrate reset --force` then `tsx prisma/seed.ts` as two explicit steps.
- **`playwright.config.ts` uses `webServer.port`, not `webServer.url`.** The default `url` readiness check requires a 2xx at `/`, but there's no page at `/` until F2 — `port` just waits for the dev server to start listening.
- **Prisma's AI-agent safety guard blocks `migrate reset` without consent.** The owner explicitly consented (2026-09-11) to `global-setup.ts` running it against `tnagar_food_ordering_test` only, on every test run; the script sets `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION` accordingly.
- Added `MenuCategory.@@unique([restaurantId, name])` and `MenuItem.@@unique([categoryId, name])` (not spelled out in the plan) so the seed script's upserts are genuinely idempotent.

**Verified 2026-09-11** (against a Homebrew-installed local Postgres — this sandbox has no Docker; the committed `docker-compose.yml` setup is unaffected and is what CLAUDE.md's local-dev instructions still describe):
- `npx prisma validate` / `generate` clean; `prisma migrate dev --name init` created and applied `prisma/migrations/20260911122904_init`
- `npm run db:seed` run twice: same row counts both times (6 restaurants, 17 categories, 60 items, 2 users); `priya@example.com`'s stored password is a bcrypt hash
- `npm run lint`, `npx tsc --noEmit`, `npm run build` all pass clean
- `npm run tc:check` correctly finds and lists all 60 Appendix B IDs as missing (expected — no spec files exist yet)
- `npm test`: globalSetup resets + seeds `tnagar_food_ordering_test`, the dev server becomes ready, Playwright correctly reports "No tests found" (expected — F1 adds the first specs)

---

## F1: Login and logout (P0-1)

**User value:** returning customers sign in with email + password so their order is tied to them. There is no sign-up.

**Deliverables**
- `src/lib/session.ts` (server-only): `jose` HS256 JWT `{ userId }`, 7 days, `httpOnly` / `sameSite: lax` cookie `session`
- `src/lib/dal.ts` (server-only): `getCurrentUser()`, `requireUser(nextPath)`
- `src/lib/auth/login-schema.ts`, `authenticate.ts` (trim + lowercase, then bcrypt compare), `safe-redirect.ts` (`safeNextPath`)
- `src/app/(customer)/login/`: `page.tsx`, `login-form.tsx` (`useActionState`), `actions.ts` (`login`, `logout`)
- `src/proxy.ts`: optimistic cookie check. `/checkout` and `/orders/*` redirect to login; `/login` with a session redirects to `/`

**Test cases:** TC-1.1 to TC-1.12 (9 browser, 2 logic, 1 both)

**Extra work in this cycle: build the independent reviewer** (writing-skills RED → GREEN → REFACTOR)
1. With F1 finished, plant 3 defects:
   1. `safeNextPath` accepts `//evil.com`
   2. delete the TC-1.3 test
   3. an unknown email says "No account with this email"
2. **RED:** a plain `general-purpose` subagent reviews F1 (report only). Record what it misses.
3. Write:
   - `.claude/agents/feature-reviewer.md`
   - `.claude/skills/review-feature/SKILL.md` (`context: fork`, `agent: feature-reviewer`, `background: false`)
   - `.claude/hooks/review-fingerprint.sh`, `mark-reviewed.sh`, `require-review.sh`
4. **GREEN:** `review-feature F1` finds and fixes all 3 test-first and returns `FIXED`. A fresh run returns `PASS` (this review covers F0 too).
5. **REFACTOR** the skill wording if anything was missed.
6. Register the Stop hook in `.claude/settings.json` (via the update-config skill). Confirm it blocks once on an unreviewed `src/` edit.

**Results, 2026-09-11:**
- **RED baseline** (plain `general-purpose` subagent, report-only, no defect hints given): caught all 3 planted defects unprompted, correctly tied the missing TC-1.3 test to the wrong-message defect. No gaps to design around — the baseline was already thorough.
- **GREEN, round 1** (`feature-reviewer` via `/review-feature F0 F1`): found and fixed the same 3 defects, returned `FIXED`, correctly did not mark reviewed.
- **Round 2** (fresh `feature-reviewer` instance): found a 4th, unplanted defect — `authenticate.ts` skipped `bcrypt.compare` entirely for an unknown email, a timing side-channel that undermines the PRD's "identical message prevents enumeration" requirement even though the *text* was already identical. Fixed with a constant-time dummy-hash comparison. Returned `FIXED`.
- **Round 3** (fresh instance): `PASS`, nothing to fix. Ran `mark-reviewed.sh`.
- **REFACTOR:** nothing needed — no rationalization or ambiguity surfaced across 3 rounds, so the agent/skill wording was left as written.
- **Stop hook:** registered in `.claude/settings.json`. `require-review.sh` was pipe-tested directly (not just via a live Stop event, which can't be triggered mid-turn): blocks when the src/tests fingerprint doesn't match the last `mark-reviewed.sh` checkpoint, allows when it does. Confirmed both directions before wiring it in.

---

## F2: Restaurant discovery (P0-2)

**User value:** see every restaurant on the platform and find one by name, without logging in.

**Deliverables**
- `src/lib/restaurants.ts`: `listRestaurants(query?)`, a trimmed, case-insensitive name `contains`, ordered by name, returning a card DTO
- `src/app/(customer)/page.tsx`: GET search form (`?q=`), card grid, empty state with clear link
- `src/components/restaurant-card.tsx`, `restaurant-image.tsx` (initials placeholder)

**Test cases:** TC-2.1 to TC-2.7 (4 browser, 3 logic)

**Built and reviewed 2026-09-11.** One real bug caught before review: Prisma's `contains` compiles to Postgres `ILIKE`, so a literal `%` or `_` in a search term acted as a SQL wildcard instead of matching itself (verified empirically — searching `"%"` returned all 6 restaurants). Fixed with `escapeLikePattern()` in `restaurants.ts` (escapes `\`, `%`, `_`, in that order) before querying; TC-2.6 now genuinely exercises this. Reviewer: `PASS` on the first round — no defects.

---

## F3: Restaurant menu (P0-3)

**User value:** open a restaurant and see its menu with prices, veg/non-veg markers and availability.

**Deliverables**
- `getRestaurantMenu(slug)` in `src/lib/restaurants.ts`: sorted categories and items, empty categories dropped, `null` for an unknown slug
- `src/app/(customer)/restaurants/[slug]/page.tsx` + `not-found.tsx`
- `src/components/menu-item-row.tsx`, `veg-marker.tsx` (icon + screen-reader label), `add-to-basket-button.tsx` (disabled when unavailable)
- `src/lib/format.ts`: `formatInr(paise)`

**Test cases:** TC-3.1 to TC-3.7 (5 browser, 2 logic)

**Built and reviewed 2026-09-11.** `AddToBasketButton` is presentational only (enabled/disabled by availability, no click handler) — real basket wiring is F4's scope. Reviewer: `PASS` on the first round.

---

## F4: Basket (P0-4)

**User value:** build an order from one restaurant, edit quantities, and keep it across reloads.

**Deliverables**
- `src/lib/basket.ts` (pure):
  - reducer actions `add`, `increment`, `decrement`, `remove`, `replaceWith`, `clear`, `applyServerRefresh`
  - `MAX_QTY = 10`
  - `parseStoredBasket` (zod, empty fallback)
- `src/lib/pricing.ts` (pure): `calculateTotals`, `GST_RATE = 0.05`
- `src/components/basket-provider.tsx`: context + `useReducer` + `localStorage` sync
- Confirm dialog when adding from a different restaurant
- `src/app/(customer)/basket/page.tsx`: +/−, remove, totals, Checkout link, empty state

**Test cases:** TC-4.1 to TC-4.12 (5 browser, 6 logic, 1 both)

**Built and reviewed 2026-09-11.** Also wired `AddToBasketButton` (F3's presentational stub) to the real reducer, and added `BasketLink` in `SiteHeader` for the live item count — both explicitly deferred to F4 when built. Reviewer: `PASS` on the first round.

---

## F5: Checkout (P0-5)

**User value:** log in if needed, confirm the pickup location and total, and pay (simulated).

**Deliverables**
- `src/app/(customer)/checkout/page.tsx`: `requireUser("/checkout")`, then `<CheckoutView>` (client)
- `CheckoutView`:
  - empty basket → `/basket`
  - pickup block (name, address, "Pickup only" note)
  - lines and totals
  - mock payment panel (success/failure radio, "Pay ₹…" button disabled while pending)
- `src/lib/payments/types.ts` (`PaymentProvider`), `mock-provider.ts`

**Test cases:** TC-5.1 to TC-5.5 (5 browser)

---

## F6: Place order and confirmation (P0-6)

**User value:** a successful payment produces a confirmed pickup order with a reloadable confirmation page; a failed payment is recoverable.

**Deliverables**
- `src/lib/orders/place-order.ts`: `placeOrder(userId, input, provider)` with a strict zod input
  1. `ITEMS_UNAVAILABLE` check
  2. `PRICE_CHANGED` check
  3. transaction: PENDING_PAYMENT order + item snapshots
  4. charge, outside the transaction
  5. `PLACED` or `PAYMENT_FAILED`
- `src/app/(customer)/checkout/actions.ts`: `placeOrderAction` (`UNAUTHENTICATED` if no user)
- `CheckoutView` result handling: success → clear basket and go to `/orders/<id>`; failure banner; unavailable-item flags; price refresh; login redirect
- `src/lib/orders/get-order.ts`: `getPlacedOrderForUser` (PLACED and owned by that user only)
- `src/app/(customer)/orders/[orderId]/page.tsx`: shows order number, pickup name and address, ASAP, lines, totals, "Paid (simulated)" and time in IST. Uses `notFound()` otherwise.

**Test cases:** TC-6.1 to TC-6.16 (8 browser, 6 logic, 2 both) + **TC-J.1** end-to-end journey

**When F6 is Done:** the v1 customer journey is complete. Update README (setup, demo accounts, test and review commands) and CLAUDE.md (current state, Server Actions, Playwright-only testing, review gate).

---

## Change log

| Date | Change |
|---|---|
| 2026-09-11 | Tracker created. PRD approved. Plugins installed. F0 is next. |
| 2026-09-11 | F0 built and verified (deps, Prisma schema/migration/seed, Playwright tooling, layout shell). Awaiting owner sign-off. |
| 2026-09-11 | F0 signed off and committed. F1 (login/logout) started. |
| 2026-09-11 | F1 built. Independent reviewer (agent, skill, hooks) built and tested via RED→GREEN→PASS, catching 3 planted defects plus 1 real timing side-channel bug. Stop hook registered. Awaiting owner sign-off. |
| 2026-09-11 | F1 signed off and committed (commit cb14421). F2 (restaurant discovery) started. |
| 2026-09-11 | F2 built and reviewed (PASS, round 1). Caught and fixed a real LIKE-wildcard bug in search before review. Awaiting owner sign-off. |
| 2026-09-11 | F2 signed off and committed (commit 43f27d0). Owner asked not to be prompted for sign-off between features going forward — building F3-F6 continuously. |
| 2026-09-11 | F3 built and reviewed (PASS, round 1). |
| 2026-09-11 | F3 signed off and committed (commit c1e8045). F4 (basket) started. |
| 2026-09-11 | F4 built and reviewed (PASS, round 1). |
