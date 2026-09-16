# Foodlicious Relaunch Implementation Plan

> **Execution note:** This plan is executed inline by the same session that wrote it, following this project's established per-feature workflow (see `docs/features.md`): implement → Playwright tests → `npm run lint`/`tsc`/`tc:check`/`build`/`test` → `/review-feature F<n>` to a clean PASS → update `docs/features.md` + memory → commit → next feature, without pausing for sign-off between features (owner's standing preference). No separate subagent-driven-development or worktree ceremony — same pattern as every prior feature in this project.

**Goal:** Ship all 12 items from the approved design spec as a sequence of F-numbered features.

**Architecture:** No architectural change — same Next.js App Router / Prisma / MUI stack. New Prisma fields/models (`Campaign`, `Order.paymentMethod`, `Order.scheduledFor`), a new theme palette, and new/changed components within the existing `(customer)` route group.

**Tech Stack:** Unchanged (Next.js 16, Prisma 7 + `@prisma/adapter-pg`, MUI 9, Playwright).

**Spec:** `docs/superpowers/specs/2026-09-16-foodlicious-relaunch-design.md`

## Global Constraints

- Every new user-visible behavior gets a Playwright test, title starting with its TC ID, per the project's existing convention. Pure restyle work (rebrand, theme, font) doesn't need new PRD test cases — same precedent as the 2026-09-14 MUI redesign.
- New PRD requirements go under **P0-8** (discovery: campaigns, hover-carousel, hero banner, search copy), **P0-9** (pre-order), **P0-10** (payment redesign + kitchen-cam). Update `docs/prd/customer-ordering.md`'s Requirements and Appendix B accordingly, same as every prior feature.
- Real restaurant names per the spec's table (§2) — do not invent additional real names beyond that list; the 10 restaurants and their assigned seed roles (pure-veg, no-photo) are fixed.
- Payments stay simulated (CLAUDE.md's non-negotiable scope decision) — "Pay later online" still only simulates success/failure, never a real gateway.
- Every feature runs `/review-feature F<n>` to a clean PASS before being marked Done in `docs/features.md`.

---

## F8: Rebrand, palette, and font

**Purpose:** Visual identity relaunch. No new PRD requirement (restyle only, matches the 2026-09-14 redesign precedent).

**Files:**
- Modify: `src/app/layout.tsx` — swap `title: "FoodStation"` → `"Foodlicious"`; add `Space_Grotesk` from `next/font/google` alongside existing `Geist`/`Geist_Mono`, expose as `--font-space-grotesk`.
- Modify: `src/theme.ts` — replace the bronze/white palette with:
  ```ts
  const TOMATO = "#C43A2F";       // primary/CTA — verify ≥4.5:1 on white before committing
  const TOMATO_DARK = "#8C2A22";
  const TOMATO_TINT = "#FBEAE7";
  const SUNSHINE = "#F4B400";     // ratings/highlight badges — background/icon fills only
  const FOREST = "#1B6B3A";       // success / vegetarian marker (existing semantic role)
  const KIWI = "#6BAA3C";         // secondary accent — promo badges, "new" tags
  const INK = "#1C1917";
  const INK_MUTED = "#6F6259";
  ```
  Wire `primary` = Tomato (main/light/dark as above), keep `secondary` = white (same rationale as before: MUI paints buttons/links/focus from `primary`), `success.main` = Forest, add `warning.main` = Sunshine (MUI already reserves `warning` for badge/highlight roles), and export a `brand` object with `kiwi` for one-off accent use (campaign marquee, "new" tags) since MUI's palette has no fifth slot that fits semantically.
  Set `typography.h1`/`h2`/`h3`.`fontFamily` to `"var(--font-space-grotesk), var(--font-geist-sans), system-ui, sans-serif"`; leave the base `typography.fontFamily` as Geist.
  **Before finalizing hex values:** run the same manual contrast check the existing file's comment documents (deepen Tomato/Forest/Kiwi if any interactive-text usage falls under 4.5:1 on white; Sunshine only ever needs 3:1 as a large-scale/non-text fill).
- Modify: `README.md`, `CLAUDE.md` — "FoodStation" → "Foodlicious" (all occurrences).
- Modify: `src/components/site-header.tsx` — wordmark text "Food" + `<Box component="span">Station</Box>` → "Food" + "licious".

**Testing:** No new Playwright specs (restyle only). Run the full existing suite — it pins exact strings/roles, not colors, so it should stay green; if MUI's default `warning`/`success` color roles are referenced anywhere in existing markup expecting the old values, fix those call sites, not the tests.

**Done when:** `lint`/`tsc`/`build` clean, full existing suite green, `/review-feature F8` PASS.

---

## F9: Real T Nagar restaurant data

**Purpose:** Replace the 6 fictional restaurants with the spec's 10 real ones. No new PRD requirement — same data shape, just different content (P0-2's discovery/search behavior is unaffected).

**Files:**
- Modify: `prisma/seed.ts` — replace the `restaurants` array entirely. For each of the 10 (see spec §2 table for names/cuisines/roles):
  - `slug`, `name`, real `cuisines[]`, a real T Nagar-area `address` string, `pickupMinutes`/`ratingAvg`/`reviewCount` (existing F7 fields — keep plausible values), `images[]` (keep existing photo-by-keyword assignment helper, just re-run it against the new cuisine keywords) — except **The Grand Sweets and Snacks** gets `images: []` (the no-photo TC-2.7 case).
  - Categories/items: real, standard dishes for that establishment (e.g. Saravana Bhavan → Ghee Roast, Rava Kesari, Filter Coffee at realistic ₹ prices from the search results; Dindigul Thalappakatti → Seeraga Samba Biryani variants; A2B/Grand Sweets → real sweet/snack names like Mysore Pak, Adhirasam). Keep at least one `isAvailable: false` item somewhere, and keep the `isRecommended` + F7 `imageUrl`-per-item conventions intact.
  - Saravana Bhavan is the pure-veg restaurant (every item `isVeg: true`).
- No schema change — this is data-only.

**Testing:** Existing TC-2.x/TC-3.x/TC-7.x specs reference specific restaurant/item names (e.g. "Usman Road Mess", "Ranganathan Street Biryani", "Chicken Biryani", "Burkit Road Bakes"). Update every such literal in:
- `tests/browser/restaurants.spec.ts`, `tests/browser/menu.spec.ts`, `tests/browser/ux.spec.ts`, `tests/browser/basket.spec.ts`, `tests/browser/checkout.spec.ts`, `tests/browser/journey.spec.ts`, `tests/browser/orders.spec.ts`
- `tests/logic/restaurants.spec.ts`, `tests/logic/menu.spec.ts`, `tests/logic/place-order.spec.ts`, `tests/logic/pricing.spec.ts`

to the new real names/items/prices. This is mechanical but touches most of the suite — go file by file, `grep -rn` the old names across `tests/` and `src/` first to find every reference before starting.

**Done when:** every old fictional name is gone from the repo (`grep -rn "Usman Road Mess\|Ranganathan Street\|Panagal Park\|Pondy Bazaar\|Burkit Road\|Thyagaraya Filter"` returns nothing outside this plan/spec/tracker's historical entries), full suite green, `/review-feature F9` PASS.

---

## F10: Discovery page UX (P0-8, part 1)

**Purpose:** Search bar copy/size, campaigns marquee, hover-to-slide carousel.

**Schema:**
- Add to `prisma/schema.prisma`:
  ```prisma
  model Campaign {
    id           String     @id @default(cuid())
    restaurantId String
    headline     String
    imageUrl     String?
    sortOrder    Int

    restaurant Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

    @@index([restaurantId])
  }
  ```
  Add `campaigns Campaign[]` to `Restaurant`. New migration (follow the existing `prisma migrate dev` flow this project uses).

**Files:**
- Modify: `prisma/seed.ts` — seed 4-6 `Campaign` rows across a subset of the 10 restaurants (e.g. "20% off today at Ratna Cafe", "New: Filter coffee combo — A2B").
- Create: `src/lib/campaigns.ts` — `listCampaigns()`: `db.campaign.findMany({ orderBy: [{ restaurantId: "asc" }, { sortOrder: "asc" }], include: { restaurant: { select: { name: true, slug: true } } } })`.
- Create: `src/components/campaign-marquee.tsx` (client component) — renders the list as a horizontally-scrolling CSS-animated strip (`@keyframes` translateX loop, duplicated content for seamless wrap), `animation-play-state: paused` on `:hover`/`:focus-within`.
- Modify: `src/app/(customer)/page.tsx` — shrink the search `TextField` (smaller `size`, reduced padding), placeholder → `"Search restaurants, items, cuisines..."`; render `<CampaignMarquee campaigns={campaigns} />` directly below the search form (`listCampaigns()` called alongside the existing `listRestaurants`/`listFavoriteRestaurantIds` `Promise.all`).
- Modify: `src/components/restaurant-carousel.tsx` — add `onMouseEnter`/`onMouseLeave` handlers that start/stop a `setInterval` advancing the photo index every 900ms while hovered; clear the interval on unmount and on leave. Keep the existing click/keyboard arrow behavior unchanged.

**Test cases (add to `docs/prd/customer-ordering.md` Appendix B under a new `### TC-8: Discovery UX (P0-8)` table, and to P0-8's Given/When/Then in Requirements):**
- `TC-8.1` (B): search placeholder reads exactly "Search restaurants, items, cuisines..."
- `TC-8.2` (B): the campaigns marquee is present on `/` and contains at least one seeded headline
- `TC-8.3` (B): hovering a card's carousel advances the photo without a click (assert the visible image/slide index changes after `page.waitForTimeout` past one interval tick, pointer still over the card)
- `TC-8.4` (B): the marquee's animation pauses on hover (assert computed `animation-play-state` via `page.evaluate`, or assert scroll position doesn't advance across two reads while hovered)

**Files touched by tests:** `tests/browser/ux.spec.ts` (extend) or a new `tests/browser/discovery-ux.spec.ts`.

**Done when:** `lint`/`tsc`/`tc:check -- 8`/`build`/full suite clean, `/review-feature F10` PASS.

---

## F11: Restaurant-page hero banner + menu layout audit (P0-8, part 2)

**Purpose:** Full-width auto-advancing cover banner reusing `Restaurant.images`; confirm the menu page otherwise already matches the UberEats-style pattern (sticky category nav, item rows — both already shipped in the 2026-09-14 redesign per `CLAUDE.md`).

**Files:**
- Create: `src/components/restaurant-hero-banner.tsx` (client component) — full-width `Box` (e.g. 280px tall, `objectFit: cover`), auto-advances through `images[]` every ~4s (`setInterval`, cleared on unmount, paused on hover matching the card carousel's pattern for consistency), dot indicators, no-photo restaurants render nothing (banner section omitted, not a placeholder — the restaurant page already has cuisines/rating/address as the identity header).
- Modify: `src/app/(customer)/restaurants/[slug]/page.tsx` — render `<RestaurantHeroBanner images={menu.images} name={menu.name} />` above the existing name/rating/address block, only when `images.length > 0`.
- Audit only (no changes expected unless found broken): sticky category chip nav and `MenuItemRow`'s photo/name/price/description/add-control layout against the spec's §11 description. If something's genuinely missing (not just differently styled), add it as a sub-task here — don't rebuild what already matches.

**Test cases (append to the P0-8 Appendix B table):**
- `TC-8.5` (B): a restaurant with photos shows the hero banner and it auto-advances (same waitForTimeout-based assertion pattern as TC-8.3)
- `TC-8.6` (B): a restaurant with no photos (The Grand Sweets and Snacks) renders no hero banner element and no broken image

**Done when:** `lint`/`tsc`/`tc:check -- 8`/`build`/full suite clean, `/review-feature F11` PASS.

---

## F12: Pre-order scheduling (P0-9)

**Purpose:** Let a customer schedule pickup for a future date/time instead of ASAP.

**Schema:**
- Modify `prisma/schema.prisma`'s `Order` model: add `scheduledFor DateTime?` (null = ASAP, the only behavior that existed before this feature).

**Files:**
- Modify: `src/lib/orders/place-order.ts` — `placeOrder`'s input schema (zod) gains an optional `scheduledFor: z.coerce.date().optional()`; validate it's in the future and within the next 7 days, and (using the date's local hour) between 9am and 10pm — reject outside that window with a new error code (`INVALID_SCHEDULE`, same error-shape pattern as the existing `ITEMS_UNAVAILABLE`/`PRICE_CHANGED` checks). Pass `scheduledFor` through to the `db.order.create` call.
- Modify: `src/app/(customer)/checkout/checkout-view.tsx` — add an ASAP/Schedule `ToggleButtonGroup`; when "Schedule" is selected, show a date picker (native `<input type="date">`/`<input type="time">` wrapped in MUI `TextField type="date"`/`type="time"` — no new dependency needed) constrained via `min`/`max` attributes to the 7-day, 9am-10pm window. Include the chosen value in the `placeOrderAction` call.
- Modify: `src/app/(customer)/checkout/actions.ts` — thread `scheduledFor` from form data into the `placeOrder` call.
- Modify: `src/app/(customer)/orders/[orderId]/page.tsx` — show "Pickup: <formatted scheduledFor>" when set, "Pickup: ASAP" otherwise (unchanged default).

**Test cases (new `### TC-9: Pre-order (P0-9)` Appendix B table):**
- `TC-9.1` (B): scheduling a valid future time places the order and the confirmation page shows that time
- `TC-9.2` (L): `placeOrder` rejects a past `scheduledFor` with `INVALID_SCHEDULE`
- `TC-9.3` (L): `placeOrder` rejects a time outside the 9am-10pm window with `INVALID_SCHEDULE`
- `TC-9.4` (B): default (no scheduling) still shows "Pickup: ASAP" — regression guard for existing TC-6.12 wording

**Files touched by tests:** `tests/logic/place-order.spec.ts` (extend), new `tests/browser/preorder.spec.ts`.

**Done when:** `lint`/`tsc`/`tc:check -- 9`/`build`/full suite clean, `/review-feature F12` PASS.

---

## F13: Payment redesign + simulated kitchen-cam (P0-10)

**Purpose:** Replace simulate-success/failure with Pay-in-cash / Pay-later-online; show a simulated live-feed card on the confirmation page.

**Schema:**
- Modify `prisma/schema.prisma`:
  ```prisma
  enum PaymentMethod {
    CASH
    ONLINE
  }
  ```
  Add `paymentMethod PaymentMethod` to `Order` (no default — every order must state one).

**Files:**
- Modify: `src/lib/payments/types.ts` / `mock-provider.ts` — no interface change needed; the mock provider is only invoked on the `ONLINE` path (unchanged simulate success/fail behavior).
- Modify: `src/lib/orders/place-order.ts` — `placeOrder`'s input gains `paymentMethod: z.enum(["CASH", "ONLINE"])`. Branch: `CASH` skips the payment-provider call entirely and goes straight to `PLACED` (no `PENDING_PAYMENT` transaction step needed for that path — still create the order row transactionally as today, just without a charge attempt). `ONLINE` keeps the exact current flow (`PENDING_PAYMENT` → provider charge → `PLACED`/`PAYMENT_FAILED`).
- Modify: `src/app/(customer)/checkout/checkout-view.tsx` — replace the "Simulate successful/failed payment" `RadioGroup` with two options: "Pay in cash" and "Pay later online" (`RadioGroup` or two `Button`/`ToggleButton`s). Selecting "Pay later online" reveals the *existing* success/fail sub-choice (still needed to demonstrate/test failure) nested under it; "Pay in cash" shows no sub-choice. Update the submit button label accordingly ("Place order" for cash since nothing is "paid" yet, vs the existing "Pay ₹X" for online).
- Modify: `src/app/(customer)/checkout/actions.ts` — thread `paymentMethod` (and the nested success/fail choice when online) into `placeOrder`.
- Modify: `src/app/(customer)/orders/[orderId]/page.tsx` — show "Paid online (simulated)" for `ONLINE` orders (existing copy) vs "Pay ₹X in cash at pickup" for `CASH` orders.
- Create: `src/components/kitchen-cam.tsx` — a card with an inline SVG scene (stove/pot outline, 2-3 `<circle>`/`<path>` "steam" shapes animated via CSS `@keyframes` opacity+translateY loop, a simple chef silhouette `<path>` with a subtle side-to-side CSS transform loop) and a pulsing "LIVE" `Chip` (CSS `@keyframes` opacity pulse). Label: "Simulated live view — <restaurant name>'s kitchen".
- Modify: `src/app/(customer)/orders/[orderId]/page.tsx` — render `<KitchenCam restaurantName={order.restaurantName} />` only when `order.status === "PLACED"` (not for `PAYMENT_FAILED`).

**Test cases (new `### TC-10: Payment and kitchen-cam (P0-10)` Appendix B table):**
- `TC-10.1` (B): checkout shows "Pay in cash" and "Pay later online", no more "Simulate successful/failed payment" radio
- `TC-10.2` (B): choosing cash places the order with no payment step; confirmation shows "Pay ₹X in cash at pickup"
- `TC-10.3` (L): `placeOrder` with `paymentMethod: "CASH"` always results in `PLACED`, `paymentMethod` persisted as `CASH`
- `TC-10.4` (B): choosing online still surfaces the success/fail sub-choice; failure still shows the existing failure banner and keeps the basket (regression guard for existing TC-6.10)
- `TC-10.5` (B): the confirmation page for a `PLACED` order shows the kitchen-cam card with a "LIVE" badge; a `PAYMENT_FAILED` order (via the URL-not-found path, existing TC-6.16) shows nothing (unreachable, unchanged)

**Files touched by tests:** `tests/logic/place-order.spec.ts` (extend), `tests/browser/checkout.spec.ts` + `tests/browser/orders.spec.ts` (extend existing specs — payment UI and confirmation page already have coverage to adapt, not just add to).

**Done when:** `lint`/`tsc`/`tc:check -- 10`/`build`/full suite clean, `/review-feature F13` PASS.

---

## Final step (after F13)

Update `docs/features.md`'s Status overview table (add F8-F13 rows) and Change log, same structure as every prior entry. Update the feature-tracker memory. Confirm the dev server (`npm run dev`) serves the finished app and hand the owner `http://localhost:3000`.
