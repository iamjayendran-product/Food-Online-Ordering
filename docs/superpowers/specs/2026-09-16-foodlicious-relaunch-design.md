# Foodlicious relaunch — design

Approved by the owner 2026-09-16 after brainstorming. This is the record of what was agreed; implementation proceeds via a written plan (writing-plans skill) and the project's normal build-and-review cycle (one or more F-numbered features, `/review-feature` to PASS, tracker updated, committed).

## Scope

Twelve owner-requested changes, grouped into build order below. Nothing here touches payments-are-simulated or local-only-deployment as *scope* — "pay later online" still simulates, it doesn't integrate a real gateway.

## 1. Rebrand: FoodStation → Foodlicious

Mechanical rename: `<title>`/metadata, header wordmark, `README.md`, `CLAUDE.md`, any other literal "FoodStation" string.

## 2. Real T Nagar restaurants (10, real names + real menus)

Replace the 6 fictional restaurants with 10 real, currently-operating T Nagar-area establishments, researched via web search 2026-09-16:

| Restaurant | Real cuisine | Role in seed invariants |
|---|---|---|
| Hotel Saravana Bhavan | Pure veg South Indian tiffin | The pure-veg restaurant (was Usman Road Mess) |
| Ponnusamy Hotel | South Indian, non-veg thali | — |
| Dindigul Thalappakatti | Biryani (seeraga samba rice) | — |
| The Grand Sweets and Snacks | Sweets, snacks, South+North Indian veg | No-photo restaurant (was Burkit Road Bakes) — keeps TC-2.7 meaningful |
| Ratna Cafe | South Indian fast food (sambar-idli) | — |
| Murugan Idli Shop | South Indian tiffin, idli specialist | — |
| Adyar Ananda Bhavan (A2B) | Sweets, snacks, tiffin chain | — |
| Absolute Barbecues (AB's) | Barbecue/grill, buffet, non-veg | — |
| Pakwan | North Indian, Chinese, multi-cuisine | — |
| Sin & Tonic | Casual multi-cuisine | — |

Real dish names and realistic Chennai pricing per restaurant (verified pricing for Saravana Bhavan and Thalappakatti from search; other items are real, standard dishes for that cuisine/establishment type, not verbatim-scraped for all ~100 items — full menu-item-by-menu-item scraping of 10 live sites is out of scope). At least one item stays unavailable; addresses are real T Nagar streets.

**Disclaimer:** since real business names are used without their involvement, add a small footer note: "Foodlicious is a demo project. Restaurant names shown are for illustration only and are not affiliated with or endorsed by these businesses." (Owner did not ask for this to be dropped when flagged during brainstorming — implementing as a light footer line, not a blocking banner.)

## 3. Search bar

Discovery page hero search field shrinks (smaller `TextField`, less vertical padding); placeholder text becomes "Search restaurants, items, cuisines...".

## 4. Campaigns marquee

New `Campaign` model: `id, restaurantId, headline, imageUrl?, sortOrder`. Seeded with a handful of promo blurbs across a subset of restaurants (e.g. "20% off today", "New: Filter coffee combo"). Rendered as an auto-scrolling horizontal strip directly under the search bar — CSS animation, pauses on hover/focus for accessibility (not a real promotions/discount system; discount text is decorative, doesn't affect pricing).

## 5. Hover-to-slide card carousel

`RestaurantCarousel` gains hover behavior: while the pointer stays over the image, auto-advance one photo every ~900ms. Click/keyboard arrows remain for touch and non-hover access (existing TC-7.4 behavior unchanged).

## 6. Restaurant-page hero banner

No new field — reuse `Restaurant.images` (already populated per restaurant). Restaurant page renders it full-width as an auto-advancing cover banner above the menu; discovery cards keep the smaller hover-carousel treatment of the same array.

## 7. New palette

Replace bronze/white with four deliberate roles, contrast-checked against white the same way bronze was deepened (`#CD7F32` → `#8C5A22`):

- **Primary / CTA — Tomato Burst** (deep red-orange, checked for 4.5:1 text/button contrast on white)
- **Ratings / highlight badges — Sunshine** (yellow, background/icon fills only — yellow text fails AA, same constraint bronze had)
- **Success / vegetarian marker — Forest Green** (keeps the existing semantic role green already plays)
- **Secondary accent — Kiwi** (brighter green; promo badges, "new" tags, the campaign marquee)

Exact hex values picked and contrast-verified during implementation, following the same methodology `theme.ts`'s existing comment documents for bronze.

## 8. Font

Keep Geist Sans for body (already sleek/geometric/trending, zero-cost since it's already wired in). Add **Space Grotesk** (via `next/font/google`, same low-friction path as Geist) for headings (`h1`–`h3`) only — sharper, more distinct display font for the rebrand's personality.

## 9. Pre-order

Checkout gains an ASAP / Schedule toggle. Scheduling shows a date+time picker constrained to a pickup window (next 7 days, 9am–10pm daily — matches "ASAP is instant, scheduling is same general hours" rather than inventing per-restaurant hours, which don't exist in the schema and are out of scope per the PRD's own P0-2 Q7 decision "no opening hours"). `Order` gains `scheduledFor: DateTime?` (null = ASAP, unchanged existing behavior). Confirmation/order pages show the scheduled time when set, "Pickup: ASAP" otherwise (unchanged).

## 10. Simulated kitchen-cam

On the order confirmation page: a small card showing a looping **animated SVG/CSS illustration** (stove, rising steam, a moving chef silhouette) — not a real video file, no licensing/hosting needed. Labeled "Simulated live view" with a pulsing "LIVE" badge, consistent with the project's existing simulated-payment framing.

## 11. Menu page layout

No live reference available (UberEats blocks non-browser fetches, confirmed 403 during brainstorming) — built from the standard UberEats pattern instead: hero cover photo (→ shares #6's banner), sticky category nav (**already exists** per the 2026-09-14 redesign notes — audit and keep, don't rebuild), item rows with photo/name/price/description and a quick add control (**already exists** — `MenuItemRow`). Net new here is mostly the hero banner integration (#6) and re-theming (#7/#8); audit the current page against the pattern before writing new markup, since much may already match.

## 12. Payment redesign

Checkout's simulate-success/simulate-failure radio is replaced by two payment-method options:

- **Pay in cash** — no payment attempt. Order places immediately as `PLACED`, `paymentMethod: CASH`, confirmation shows "Pay ₹X in cash at pickup".
- **Pay later online** — keeps today's mock success/failure simulation exactly as-is (the only way to demonstrate/test a failed online payment), `paymentMethod: ONLINE`. Order still goes `PENDING_PAYMENT` → `PLACED` or `PAYMENT_FAILED`.

`Order` gains `paymentMethod: CASH | ONLINE` (Prisma enum). Existing P0-6 test cases (TC-6.1, 6.3, 6.10, etc.) map onto the online path; cash gets new, simpler test cases (always succeeds, no payment step, correct confirmation copy).

## Out of scope (unchanged)

Real payment gateway integration, real restaurant-admin control of the new data (campaigns, banners — still seed-only, same as menus today), delivery, per-restaurant opening hours, order history beyond what already exists, anything from the PRD's existing Non-Goals list.

## Testing

Every new user-visible behavior gets Playwright test cases in the same TC-numbered Appendix B convention (new PRD requirement(s) — likely P0-8 for the relaunch items that are genuinely new behavior; items that are pure restyle, like #3/#7/#8, don't need new acceptance criteria, same as the 2026-09-14 MUI redesign didn't). `docs/prd/customer-ordering.md` and `docs/features.md` get updated accordingly, per this project's existing convention.
