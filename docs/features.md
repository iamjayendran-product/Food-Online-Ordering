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
| F5 | Checkout | P0-5 | F1, F4 | TC-5.1–5.5 (5) | **Done** | PASS (round 1/1, reviewed with F6) | 2026-09-11 |
| F6 | Place order and confirmation | P0-6 | F5 | TC-6.1–6.16 (16) + TC-J.1 | **Done** | PASS (round 1/1, reviewed with F5) | 2026-09-11 |
| F7 | Discovery and menu experience | P0-7 | F2, F3 | TC-7.1–7.9 (9) | **Done** | PASS (round 2/2) | 2026-09-15 |
| F8 | Rebrand: Foodlicious, palette, font | (restyle, no new TCs) | F7 | n/a | **Done** | PASS (round 3/3, reviewed with F9) | 2026-09-16 |
| F9 | Real T Nagar restaurant data | (data only, no new TCs) | F2, F3, F7 | n/a | **Done** | PASS (round 3/3, reviewed with F8) | 2026-09-16 |
| F10 | Discovery page UX: search copy, campaigns marquee, hover carousel | P0-8 | F2, F7 | TC-8.1–8.4 (4) | **Done** | PASS (round 1/1, reviewed with F11) | 2026-09-16 |
| F11 | Restaurant hero banner + menu-layout audit | P0-8 | F3, F7 | TC-8.5–8.6 (2) | **Done** | PASS (round 1/1, reviewed with F10) | 2026-09-16 |
| F12 | Pre-order scheduling | P0-9 | F5, F6 | TC-9.1–9.4 (4) | **Done** | PASS (round 2/2) | 2026-09-16 |

**Build order:** F0 → F1 → F2 → F3 → F4 → F5 → F6, one feature per cycle. F7, the Material UI redesign, and the Foodlicious relaunch (F8 onward) followed as owner-requested work after v1 shipped — see `docs/superpowers/specs/2026-09-16-foodlicious-relaunch-design.md` and its plan.

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

**Built together with F6, 2026-09-11** (TC-5.5 needs a real order to exist to verify "exactly one order," which is F6's mechanism — see F6 notes below). Extended `Basket`/`NewBasketItem` (F4) with `restaurantAddress`, threaded from `AddToBasketButton` through `MenuItemRow`, so checkout can show the pickup address without a server round trip.

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

**Built 2026-09-11. Real bugs found and fixed during development (not planted — genuine issues), all caught before or independent of the reviewer:**
1. **Test-harness isolation gap (pre-existing since F0, only now surfaced):** `playwright.config.ts` only pointed the spawned dev-server *child process* at `TEST_DATABASE_URL`. Logic tests import `src/lib/db.ts` directly — no HTTP hop through that child process — so they'd been silently querying the **dev** database this whole time. F1–F4's logic tests never noticed because both databases carry identical seed data and no test compared row IDs. Fixed by setting `process.env.DATABASE_URL` in the config process itself, which Playwright's workers inherit.
2. **Hydration race in `CheckoutView`:** its "redirect to `/basket` if empty" effect is a *child* of `BasketProvider`, so on mount it runs *before* the provider's own hydration effect (child effects fire before parent effects) — it saw the still-empty initial state and redirected away before real basket data ever loaded. Fixed by exposing a `hydrated` flag from `BasketProvider` and gating the redirect (and the render) on it.
3. **Clearing the basket on a successful order raced its own success navigation:** `clear()` drops `lines.length` to 0 on the still-mounted checkout page, which the same "redirect if empty" effect would catch and win against `router.push('/orders/<id>')`. Fixed with a `hasPlacedOrderRef` guard.
4. **`proxy.ts`'s blanket redirect also caught Server Action requests**, not just page navigations. Clearing cookies mid-checkout and clicking Pay sent the *action's own* POST through the login redirect, and a plain HTTP redirect in front of a Server Action breaks Next's action client runtime ("unexpected response from the server") instead of reaching `placeOrderAction`'s own `UNAUTHENTICATED` handling. Fixed by skipping the redirect when the request carries Next's `next-action` header — every action here already re-checks auth itself, so this doesn't weaken protection.
5. **Double-submit guard needed a ref, not state:** a `pending` *state* check in `handlePay` isn't guaranteed to have committed before a second, near-simultaneous click reaches the handler (stale closure). Switched to a synchronous `payingRef`. TC-5.5 verifies this with two native `button.click()` calls dispatched back-to-back via `page.evaluate` (Playwright's own `.click()` can't stress this — it retries actionability against whatever page is current, which fights a click that triggers navigation).

Reviewer: `PASS` on the first round for both F5 and F6 — no additional defects found.

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
| 2026-09-11 | F4 signed off and committed (commit bc9fc80). F5 (checkout) started. |
| 2026-09-11 | F5+F6 built together (TC-5.5 depends on F6's order-placement mechanism). Fixed a pre-existing test-harness DB-isolation gap and several real races (basket hydration, proxy vs. Server Actions, double-submit). Reviewer PASS, round 1, both features. |
| 2026-09-11 | F6 signed off and committed (commit c7951f0). v1 customer journey (F0-F6) complete — README and CLAUDE.md updated. No feature queued. |
| 2026-09-14 | UI rebuilt on Material UI (white & bronze, UberEats-style); Tailwind removed. Reviewer round 1 FIXED (heading-hierarchy regression, h1→h3 skip), round 2 PASS. Committed (commit f6709a8). |
| 2026-09-14 | F7 (discovery and menu experience) built: FoodStation rename, store photo carousels, ratings, pickup times, veg markers, favourites, item photos, Recommended section. Not yet reviewed or committed at session end. |
| 2026-09-15 | F7 reviewed: round 1 FIXED an SSR/hydration mismatch (`Chip icon` prop) that was intermittently corrupting an unrelated test (TC-2.5) via a forced remount, plus a test-coverage gap in TC-7.8 ("only available dishes are recommended" was untested). Round 2 PASS. Tracker brought up to date and committed. |
| 2026-09-16 | Owner requested a 12-item relaunch (rename to Foodlicious, real restaurant data, campaigns, hover/hero carousels, new palette, new font, pre-order, cash/online payment redesign, simulated kitchen-cam, menu-layout audit). Brainstormed to an approved design spec and a 6-batch (F8-F13) implementation plan. |
| 2026-09-16 | F8 (rebrand/palette/font) + F9 (real T Nagar restaurant data) built together. Reviewer round 1 FIXED stale bronze hex values left in two components, a stale palette description in CLAUDE.md, and a missing disclaimer footer the design spec required. Round 2 FIXED stale PRD Appendix B rows (TC-2.1/TC-2.2) and an unexplained test deviation. Round 3 PASS — also confirmed via worktree bisection that an intermittent TC-7.5 flake is a pre-existing F7 bug, not a regression. Committed (commit 20f93cb). |
| 2026-09-16 | F10 (search copy, campaigns marquee, hover carousel) + F11 (restaurant hero banner reusing `Restaurant.images`; menu-layout audit found nothing to change) built together as new PRD requirement P0-8. Reviewer PASS, round 1. Committed (commit 4a9aa7d). |
| 2026-09-16 | F12 (pre-order scheduling) built as new PRD requirement P0-9. Reviewer round 1 FIXED a real timezone bug: the scheduled pickup instant was built in the browser's local timezone instead of IST, invisible in this session's tests only because the dev machine itself is IST. Round 2 PASS. Committed (commit 4bc645e). |

---

## UI redesign: Material UI, white & bronze (2026-09-14)

Not a PRD feature — a restyle of the existing F1–F6 surfaces, requested by the owner: "UberEats type of user experience with Material UI framework… White & Bronze as the brand colours for primary and secondary."

**Stack change**
- Added `@mui/material` 9.4.0, `@mui/icons-material`, `@mui/material-nextjs` (v16 App Router entry), `@emotion/react` / `styled` / `cache`.
- **Removed Tailwind** (`tailwindcss`, `@tailwindcss/postcss`, `postcss.config.mjs`). Running it alongside MUI would mean two CSS resets and competing layer order. `globals.css` is now base document rules only.
- New: `src/theme.ts` (palette, typography, component defaults), `src/components/theme-registry.tsx` (client `ThemeProvider` + `CssBaseline`), `src/components/next-link-mui.tsx`.

**Brand colours**
- White is the canvas (`background.default`, `background.paper`, the AppBar); bronze carries every interactive element.
- Interactive bronze is **#8C5A22 (5.83:1 on white)**. The classic brand bronze **#CD7F32 measures only 3.14:1**, failing WCAG AA for text and button fills, so it is used for gradients, borders and large accents.
- MUI `primary` = bronze, `secondary` = white. White as `primary` was not viable: MUI paints buttons, links and focus rings from `primary`, which would render white on white.

**UberEats-style surfaces**
Sticky white AppBar; bronze gradient hero with a pill search field; image-first restaurant cards that lift on hover; sticky category chips on the menu; sticky order-summary cards on basket and checkout; a success hero on the confirmation page.

**What constrained the markup**
The 64 Playwright tests pin the accessibility contract, so the rewrite had to preserve: menu/basket rows as `<li>`; totals as single strings (`Subtotal: ₹220`); the basket link named exactly `Basket` / `Basket (1)`; `role="img"` veg markers and image placeholder; the `alertdialog` named "Start a new basket?" (MUI `Dialog` accepts `role="alertdialog"`); no `<img>` for the no-image placeholder; and no sign-up or forgot-password links on login (TC-1.12).

**Real bug found and fixed during the redesign**
`component={NextLink}` and `sx` theme callbacks inside Server Components pass *functions* across the RSC boundary, which React rejects outright ("Functions cannot be passed directly to Client Components"). It 500'd the customer layout, so every page that renders `SiteHeader` failed and all 41 browser tests died against a broken page. Fixed with client-side pre-bound Link wrappers (`next-link-mui.tsx`) and literal `sx` values.

**Environment note:** a stale `next dev` server from an earlier session held the single-instance lock, so Playwright's own dev server exited right after binding the port. Playwright's `webServer` readiness uses `port`, which passes the moment the port opens — hence a run where every browser test failed on a dead server. Kill stray `next dev` processes before running the suite.

**Pre-existing issue, left alone:** `prisma/seed.ts` gives Thyagaraya Filter Kaapi an Unsplash URL that now returns HTTP 404, so that card shows a broken image. `imageUrl: null` would fall back to the bronze initials tile. Untouched because it is seed data, predates this work, and is the owner's call.

**Verification:** `tsc` clean · `eslint` clean · `next build` clean · **64/64 Playwright tests pass** · home, menu, basket and checkout visually checked at 1280×860.

**Independent review (2026-09-14)**
- **Round 1 — FIXED.** The reviewer caught a heading-hierarchy regression: `Typography variant="h3"` renders an `<h3>`, so basket, checkout and order confirmation jumped h1 → h3 where the Tailwind baseline had `<h2>`. No Appendix B case pins heading *level* on those pages, so the suite stayed green — precisely the gap an independent review exists to catch. Fixed with `component="h2"` in four places across three files, keeping `variant="h3"` so the visual size is unchanged.
- **Round 2 — PASS** from a fresh reviewer with no knowledge of round 1: no defects found, and `lint`, `tsc`, `tc:check`, `build` and 64/64 tests all clean.

---

## F7: Discovery and menu experience (2026-09-14)

Owner request: rename the app to **FoodStation**, add a photo carousel per store, dynamic pickup times, star ratings with review counts, vegetarian/non-vegetarian markers on discovery, a favourites control, menu item photos, and a Recommended section. Requirements are PRD **P0-7**; test cases are Appendix B **TC-7.1–TC-7.9**.

**Decisions taken with the owner**
- Carousel = photos **inside each store card**, not a hero banner.
- Ratings = **seeded aggregates** (`ratingAvg`, `reviewCount`), not a Review model with comment text.
- Favourites = **per user in the database**, so they follow the customer across devices and require login.
- Recommended = **a real section**, accepting that dishes appear twice and that existing tests needed rescoping.

**Schema**
- `Restaurant`: `imageUrl` replaced by `images String[]`; added `pickupMinutes`, `ratingAvg`, `reviewCount`.
- `MenuItem`: added `isRecommended`; its long-existing `imageUrl` is now actually populated.
- New `Favorite` model, unique on `(userId, restaurantId)`.
- Migration `20260914120000_ux_enhancements`.

**Vegetarian status is derived, not stored.** A restaurant counts as vegetarian when every one of its items is, so the badge cannot drift away from the dishes actually on sale.

**Imagery.** Every URL in the seed was checked for HTTP 200 before use, and photos are assigned by keyword rather than hand-mapped per dish, so a new item can't silently end up without one. This also replaced the dead Thyagaraya Filter Kaapi URL reported earlier. Burkit Road Bakes is deliberately left photo-less to keep TC-2.7 meaningful: a store with no photos must render the initials tile and no `<img>` at all.

**Markup constraints that shaped the components**
- The favourite control sits **outside** the card's link (it is its own action and must not navigate), while the carousel stays **inside** it, because TC-2.7 scopes to the link and expects the placeholder there. Carousel arrows are therefore `span[role="button"]` that cancel the click — a `<button>` inside an `<a>` is invalid markup.
- Recommended duplicates dishes, so the full menu is wrapped in `#menu-categories` and 12 menu-page locators across 5 spec files were scoped to it. TC-3.1 now expects four level-2 headings, Recommended first.

**Bug found while verifying:** scoping the `locator("li", …)` calls wasn't enough — `TC-3.2` also used a plain `getByText("Chicken Biryani")`, which began matching two elements once the dish appeared in both Recommended and its category. Its price assertion (`₹220`) would have failed for the same reason. Both fixed by scoping that test to `#menu-categories`.

**Verification (2026-09-14, at implementation time):** `tc:check` 69 cases · `tsc` clean · `eslint` clean · full Playwright suite · `next build`.

**Independent review (2026-09-15)**
- **Round 1 — FIXED**, two real defects:
  1. **SSR/hydration mismatch.** Both `restaurant-card.tsx` and the restaurant menu page passed a `<ScheduleIcon>` element into MUI `<Chip icon={...}>`. Confirmed by direct SSR HTML inspection that the icon never rendered server-side under `next dev` (a `next build && next start` pass was fine — the bug was dev-mode-specific, which matters because Playwright runs against `next dev`). This wasn't cosmetic: the hydration-triggered remount reset an unrelated uncontrolled `TextField`, making **TC-2.5 fail intermittently** (2 of 3 repeats) even though nothing in TC-2.5's own code had changed. Reproduced reliably with `--repeat-each=3`. Fixed by moving the icon out of `Chip`'s `icon` prop (which MUI clones via `React.cloneElement`) and into `label` as a sibling `Box`, in both files.
  2. **TC-7.8 didn't test its own claim.** The Expected column requires "only available dishes are recommended," and the implementation's filter (`isRecommended && isAvailable`) was already correct — but no seeded item was ever both recommended and unavailable, so the test would have passed even if that filter condition were deleted. Fixed by marking Gobi Manchurian (already `isAvailable: false`) as `isRecommended: true` and asserting it stays out of the Recommended rail.
  - Also strengthened TC-7.6 to check the `Favorite` row count directly (was: redirect only).
- **Round 2 — PASS** from a fresh reviewer: no defects found, `lint`/`tsc`/`tc:check`/`build`/73 tests all clean, no hydration errors in the webserver log.

This is the same hydration bug the owner independently reproduced and reported live during round 1's review — confirmed identical stack trace and fix.
