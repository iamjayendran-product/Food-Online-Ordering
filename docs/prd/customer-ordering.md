# PRD: Customer Pickup Ordering v1

| | |
|---|---|
| **Product** | Foodlicious (multi-restaurant pickup marketplace, T Nagar, Chennai) |
| **Scope** | Customer journey: log in → discover → menu → basket → checkout → order confirmation |
| **Status** | Approved (2026-09-11). Build progress: [features.md](../features.md) |
| **Owner** | Jay |
| **Last updated** | 2026-09-11 |

---

## Problem Statement

**People in T Nagar who want food from a busy local eatery have no single place to see what's on offer across restaurants and order ahead for counter pickup.** Today they have to walk in and queue, or phone each restaurant, just to check menus, prices and availability.

- **Primary persona: visitors.** Shoppers and office-goers on streets like Ranganathan Street and Pondy Bazaar usually have a short window, so they feel this most.
- **Secondary persona: residents.** People who live nearby and want takeaway without calling ahead.

Not solving it means lost time for customers and walk-away orders for restaurants during peak hours.

> **Evidence:** this is a portfolio project with no user research, support data or market metrics. The problem is stated as a **hypothesis** to be validated before any real launch.

---

## Goals

**User goals**
1. **Order ahead in under 2 minutes.** A visitor can go from the home page to a confirmed pickup order in under 2 minutes, measured by the end-to-end journey test (TC-J.1) and a manual walkthrough.
2. **Never charged a surprise amount.** A customer is never charged a total different from the one shown at checkout (0 occurrences; TC-6.6).
3. **A failed payment is recoverable.** A failed payment never creates a placed order and never loses the customer's basket (TC-6.3). **Note (2026-09-17, F18):** checkout no longer exposes a way for a customer to trigger a failed payment — online payment always succeeds via the UI. The mechanism itself (a `PAYMENT_FAILED` order is never shown as placed, and never blocks a retry) is still real and still verified at the data layer, just no longer customer-reachable.

**Project goals**

4. **Every requirement is verified.** 100% of P0 acceptance criteria are covered by passing automated Playwright tests (`npm run tc:check` reports 0 missing; `npm test` passes).

---

## Non-Goals

| Out of scope for v1 | Why |
|---|---|
| **Account creation and recovery:** sign-up, password reset, social login | Seeded demo accounts are enough to prove the ordering journey; recovery needs email infrastructure the project doesn't have. |
| **Restaurant-side operations:** menu management, receiving and accepting orders, status updates | A separate initiative for the Restaurant Admin role, with its own PRD. |
| **Post-order lifecycle:** order history, status tracking, cancellation, refunds | The obvious next customer PRD. In v1 the journey ends at the confirmation page. |
| **Delivery and scheduling:** delivery, scheduled pickup, opening hours | Pickup-only (ASAP) is a project-level scope decision; all restaurants are treated as always open. |
| **Richer discovery and menus:** cuisine or veg filters, ratings, item variants and add-ons, basket synced across devices | Premature for a small seeded catalogue; variants and add-ons significantly complicate basket and pricing. |
| **Real payments** | Payment is simulated by project scope; a real gateway is a P2 consideration. |

---

## User Stories

### Visitor (primary): a shopper or office-goer ordering ahead for pickup
1. As a visitor, I want to see all T Nagar restaurants on this platform so that I can choose where to eat without walking around.
2. As a visitor, I want to search restaurants by name so that I can quickly find a place I already know.
3. As a visitor, I want to open a restaurant's menu without logging in so that I can decide before committing to anything.
4. As a visitor, I want to see prices, veg/non-veg markers and which items are unavailable so that I don't pick something I can't eat or can't get.
5. As a visitor, I want to add items to a basket and change quantities so that I can build my order.
6. As a visitor, I want the app to warn me before replacing my basket with items from a different restaurant so that I don't lose my order by accident.
7. As a visitor, I want to log in only when I check out so that browsing stays quick.
8. As a returning customer, I want to log in with my email and password so that my order is tied to me.
9. As a customer, I want to see the pickup location, item list, GST and total before paying so that I know exactly what I'm paying and where to go.
10. As a customer, I want to pay and immediately see an order confirmation with an order number so that I can show it at the counter.
11. As a customer, I want to reopen my confirmation page later so that I still have it when I reach the restaurant.

**Edge and error cases**

12. As a customer whose payment failed, I want to be told I haven't been charged and keep my basket so that I can simply try again.
13. As a customer, I want to be told if an item became unavailable before I paid so that I can remove it instead of paying for something I won't get.
14. As a customer, I want to be told if prices changed since I added items so that I'm never charged a surprise total.
15. As a visitor whose search matches nothing, I want a clear "no results" message and a way to reset the search so that I'm not stuck.
16. As a visitor with an empty basket, I want a prompt to browse restaurants so that I know what to do next.
17. As a customer, I want a clear message when I enter the wrong email or password so that I can correct it.

### Resident (secondary): a local ordering takeaway
18. As a resident, I want my basket to still be there after I reload or come back to the page later on the same device so that I can build my order at my own pace.
19. As a resident, I want to see the restaurant's address on the checkout and confirmation pages so that I know exactly where to collect my order.
20. As a resident, I want to log out when I'm done so that others using my device can't order on my account.

---

## Requirements

Test case IDs in brackets refer to **Appendix B**. Each P0 requirement maps to one build feature (F1–F6).

### Must-Have (P0)

#### P0-1: Customer login and logout (F1)
Seeded customers log in with **email + password**. The session lasts 7 days; logout ends it. There is no sign-up.

- **Given** a seeded customer, **when** they submit the correct email and password, **then** they're signed in, returned to where they came from (or home), and the header shows their name and a Logout control. [TC-1.1]
- **Given** a wrong password *or* an unknown email, **when** submitted, **then** the same message "Invalid email or password" appears and no session is created. [TC-1.2, TC-1.3]
- Email matching ignores letter case and surrounding spaces. [TC-1.5]
- A malformed email or empty password shows field-level errors. [TC-1.4]
- The session survives reloads and new tabs; a tampered or invalid session is treated as logged out. [TC-1.6, TC-1.10]
- **Given** a signed-in customer, **when** they log out, **then** checkout and order pages require login again. [TC-1.7]
- A signed-in customer who opens the login page is sent home. [TC-1.8]
- After login the customer is only ever redirected to a page *within* the app, never an external site. [TC-1.9]
- Passwords are never stored in readable form. [TC-1.11]
- There is no sign-up or "forgot password" option. [TC-1.12]

*Technical considerations:* HTTP-only session cookie. The identical error message for wrong password and unknown email prevents account enumeration. *Dependencies:* seeded customer accounts.

#### P0-2: Restaurant discovery (F2)
Anyone, logged in or not, can see and search the restaurant list.

- **Given** any visitor, **when** they open the home page, **then** all restaurants **with a photo** appear alphabetically, each with name, cuisine tags and that photo. ~~or a placeholder when there's no image~~ **Superseded by F19 (2026-09-18):** a restaurant with no photos is excluded from discovery entirely rather than shown with a placeholder — see P0-7's note. [TC-2.1, TC-2.7]
- Search by name matches partial, case-insensitive text; a blank search shows everything; special characters are matched literally, not as wildcards. [TC-2.2, TC-2.3, TC-2.6]
- **When** a search matches nothing, **then** an empty state names the search term and offers a way to clear it. [TC-2.4]
- The search term is kept in the URL, so it survives a reload, and Back returns to the unfiltered list. [TC-2.5]

*Dependencies:* seeded restaurant data.

#### P0-3: Restaurant menu (F3)
Selecting a restaurant loads its menu.

- **Given** the restaurant list, **when** a visitor selects a restaurant, **then** its page shows name, cuisines, address and the menu grouped by category in a fixed order. Categories with no items are hidden. [TC-3.1, TC-3.5]
- Each item shows name, description, price in rupees (e.g. ₹250, ₹12.50) and a veg/non-veg marker with a text label for screen readers. [TC-3.2, TC-3.7]
- Unavailable items are shown as "Currently unavailable" and can't be added. [TC-3.3]
- An unknown restaurant address shows "Restaurant not found" with a link home. [TC-3.4]
- The menu is fully usable without logging in. [TC-3.6]

#### P0-4: Basket (F4)
- **When** a visitor (guest or signed in) adds an item, **then** the header basket count updates and the basket shows each line with quantity and line total, plus subtotal, GST and total. [TC-4.1]
- Adding the same item again increases its quantity. Quantities can be raised and lowered; lowering from 1 removes the line; the maximum is **10 per item**. [TC-4.2–TC-4.5]
- **A basket holds items from one restaurant only.** **Given** a basket from restaurant A, **when** the visitor adds an item from restaurant B, **then** they're asked to start a new basket. Cancel keeps basket A; confirm replaces it with the B item. [TC-4.6, TC-4.7]
- The basket persists across reloads and navigation on the same browser. A corrupted saved basket resets to empty without an error. [TC-4.8, TC-4.9]
- **Totals:** GST is 5% of the subtotal. For example ₹250 × 2 + ₹120 = ₹620 subtotal, ₹31 GST, ₹651 total, and ₹250 → ₹12.50 GST, ₹262.50 total. [TC-4.10, TC-4.11]
- An empty basket shows a prompt to browse restaurants and no checkout option. [TC-4.12]

*Technical considerations:* amounts are stored in paise to avoid rounding errors. The basket is stored in the browser; it isn't synced across devices (non-goal).

#### P0-5: Checkout (F5)
- **Given** a guest with items in the basket, **when** they go to checkout, **then** they're asked to log in and returned to checkout with the basket intact. [TC-5.1]
- Checkout shows the pickup restaurant's name and address, the note "Pickup only: collect at the counter", the items, subtotal, GST and a total identical to the basket's. [TC-5.2]
- Opening checkout with an empty basket sends the customer to the basket page. [TC-5.3]
- **Simulated payment:** ~~the customer chooses "Simulate successful payment" (default) or "Simulate failed payment"~~ **removed by F18 (2026-09-17), online payment always succeeds via the UI** — and the pay button shows the total, e.g. "Pay ₹651". [TC-5.4]
- While a payment is processing, the pay button can't be pressed again, so exactly one order attempt is made. [TC-5.5]

*Dependencies:* P0-1 (login) and P0-4 (basket).

#### P0-6: Place order and confirmation (F6)
- **Given** a valid basket, **when** simulated payment succeeds, **then** the order is placed using **current menu prices** (not prices sent by the browser), item names and prices are recorded as they were at order time, the basket is emptied, and the customer lands on the confirmation page. [TC-6.1, TC-6.12]
- ~~**When** simulated payment fails, **then** the customer sees "Payment failed. You have not been charged. Please try again.", stays on checkout with the basket intact, no placed order exists, and they can retry.~~ **Superseded by F18 (2026-09-17):** the checkout UI no longer offers a way to simulate a failed payment — online payment always succeeds. The failure-handling code path (`placeOrder`, `PaymentProvider`) is unchanged and still covered at the data layer. [TC-6.3]
- **Given** an item became unavailable before payment, **then** no order is placed, the affected item is flagged, and payment is blocked until it's removed. [TC-6.4, TC-6.5]
- **Given** the total shown differs from current prices, **then** no order is placed, the basket is refreshed to current prices, and the customer is told prices changed. [TC-6.6]
- Invalid orders are rejected with no order created: quantities outside 1–10, items from more than one restaurant, unknown items, or browser-supplied prices. [TC-6.2, TC-6.5, TC-6.7]
- If the session has expired when paying, the customer is sent to log in and no order is placed. [TC-6.8]
- The confirmation page shows:
  - "Order confirmed" and a unique, increasing order number
  - the pickup restaurant's name and address, and "Pickup: ASAP"
  - items, subtotal, GST and total
  - a payment line and the time placed (IST) — see P0-10 for its exact wording, which depends on the payment method chosen

  [TC-6.9, TC-6.12]
- A brief **confetti animation** plays around the confirmation checkmark on load (F28, 2026-09-18) — purely celebratory, no effect on order data. [TC-6.17]
- The confirmation has its own address. It can be reloaded, and only the customer who placed the order can see it. Other customers and failed orders get "not found"; a logged-out visitor is asked to log in and then returned to it. [TC-6.13–TC-6.16]

*Technical considerations:* the server is authoritative on price, availability and totals. Payment is behind a provider interface so a real gateway can replace the simulation. The charge happens outside the database transaction. *Dependencies:* P0-5.

#### P0-7: Discovery and menu experience (F7)
Presentation over the existing order flow. Nothing here changes pricing, availability or checkout.

- Each store card shows a **photo carousel**. **Given** a restaurant with several photos, **when** the customer uses the next or previous control, **then** the photo changes and the customer stays on the discovery page. ~~A restaurant with no photos shows a labelled initials tile and no image element at all.~~ **Superseded by F19 (2026-09-18):** `listRestaurants()` excludes any restaurant with no photos from discovery outright — every restaurant shown always has a real photo carousel. The initials-tile fallback (`RestaurantImage`) still exists in the component for defensiveness, but nothing in the seeded data can reach it any more. [TC-7.4, TC-2.7]
- Each store card shows that restaurant's own **pickup time in minutes**. [TC-7.2]
- Each store card shows a **star rating out of 5 with the number of reviews in brackets**, both per restaurant. [TC-7.1]
- Each store card marks the kitchen **vegetarian or non-vegetarian**, using the same symbol as menu items. A restaurant counts as vegetarian only when every dish on its menu is. [TC-7.3]
- Each store card carries a **favourite control**. **Given** a signed-in customer, **when** they favourite a restaurant, **then** it is still favourited after a reload, and only for that customer. A logged-out visitor is sent to log in instead. [TC-7.5, TC-7.6]
- Every **menu item shows a photo**. [TC-7.7]
- **Given** a menu item's photo fails to load, **then** it is removed entirely — no broken-image icon (F26, 2026-09-18). Fixes a real bug: a seeded photo URL can 200 and still be the wrong picture, as happened with Ratna Cafe's "Tea" resolving to an unrelated portrait photo — the underlying seed data is corrected, and this is the defensive runtime backstop for the next time a URL silently stops being right. [TC-7.10]
- ~~The menu opens with a **Recommended** section of the kitchen's picks, above the full menu.~~ **Removed by F16 (2026-09-17):** the Recommended section, `MenuItem.isRecommended`, and its test were deleted at the owner's request. The menu now opens directly on its categories.
- The application is named **Foodlicious**. [TC-7.9]

*Technical considerations:* pickup time, rating and review count are stored per restaurant and seeded; vegetarian status is derived from the menu rather than stored, so it cannot drift from the dishes on sale. Favourites are per user in the database, so they follow the customer across devices. The full menu sits inside a stable `#menu-categories` container that tests scope to (a leftover of when Recommended duplicated items above it — kept because tests already depend on it).

#### P0-8: Discovery page UX (F10, F11)
Presentation over the existing discovery flow. Nothing here changes search results, pricing or availability.

- The search field's placeholder reads **"Search restaurants, items, cuisines..."**. Search still matches restaurant name only — the wording sets expectations for a future search expansion, not a behavior change here. [TC-8.1]
- ~~Below the search field, a **campaigns marquee** auto-scrolls promotional headlines from a subset of restaurants. It pauses while hovered or focused.~~ **Superseded by P0-11 (2026-09-17):** the marquee was replaced by the promotional banner carousel, and the search field moved below it.
- **Given** a store card carousel with several photos, **when** the customer hovers over it, **then** it automatically advances through the photos without a click. The existing click/keyboard arrows still work for touch and non-hover access. [TC-8.3]
- **Given** a restaurant with photos, **when** its menu page loads, **then** a full-width hero banner above the name/rating/address block auto-advances through those photos. ~~A restaurant with no photos shows no hero banner.~~ **Superseded by F21 (2026-09-18):** the store name/rating/address moved onto the hero banner itself as a superimposed overlay (P0-15), so a photo-less restaurant now falls back to a solid brand-gradient banner instead of rendering nothing — the info panel still needs somewhere to sit. No photo `<img>` element renders in that case. [TC-8.5, TC-8.6]

*Technical considerations:* the hero banner reuses `Restaurant.images` — the same photos already shown on the discovery card, not a separate field. Campaigns are seeded, decorative promotional text (a new `Campaign` model), not a real discounts/promotions system.

#### P0-9: Pre-order (F12)
Checkout can schedule pickup for later instead of ASAP.

- **Given** the checkout page, **when** the customer picks "Schedule for later" and a valid date and time, **then** the order places for that pickup time and the confirmation page shows it. [TC-9.1]
- A scheduled time must be in the future, within the next 7 days, and between 9am and 10pm — outside that window is rejected with no order created. [TC-9.2, TC-9.3]
- Not scheduling (the default) still places the order for **ASAP** pickup, unchanged from before this feature. [TC-9.4]

*Technical considerations:* `Order.scheduledFor` is nullable — null means ASAP, the only behavior that existed before this feature. The pickup window is evaluated in IST regardless of server timezone, since pickup happens in Chennai.

#### P0-10: Payment method and kitchen view (F13)
Checkout offers a real choice of how the customer pays; the confirmation page adds a simulated view into the kitchen.

- **Given** the checkout page, **when** the customer views the Payment card, **then** they see two buttons, **"Pay in cash"** and **"Pay later online"**, ~~with online selected by default~~ **changed by F27 (2026-09-18): cash is selected by default** — pickup orders are commonly paid at the counter, and it removes a step for the common case. [TC-10.1]
- **Given** "Pay in cash" is selected, **when** the customer places the order, **then** no payment charge is attempted, the order is placed outright, the pay button reads "Place order", and the confirmation page shows "Payment: Pay ₹X in cash at pickup". [TC-10.2, TC-10.3]
- **Given** "Pay later online" is selected, **then** the pay button reads "Pay ₹X". The confirmation page shows "Payment: Paid online (simulated)". ~~The existing simulated success/failure sub-choice is shown~~ **Removed by F18 (2026-09-17)** — see P0-6's Goal 3 note. [TC-10.4]
- The confirmation page shows a **simulated kitchen view** — labelled "Simulated live view — `<restaurant name>`'s kitchen" with a "LIVE" badge — showing a real photo of a chef cooking with a subtle pan/zoom and steam overlay for motion. ~~an animated illustration, not a real feed~~ **Changed by F29 (2026-09-18):** the photo is a single image downloaded once and committed as a static asset (`/images/kitchen-chef.jpg`), not a live hotlink, so it can't rot or resolve to the wrong picture the way a seeded Unsplash URL can (see P0-7's F26 note) — it's still clearly labeled simulated, not a real feed. [TC-10.5, TC-10.6]

*Technical considerations:* `Order.paymentMethod` (`CASH` | `ONLINE`) is a real field, not a copy-only change — a cash order is created with `status: "PLACED"` directly, skipping the `PENDING_PAYMENT` step and the payment provider entirely, since there is nothing to charge. The kitchen view has no backing data or camera; it's a client-side component that takes only the restaurant's name and a static local photo — no external request at runtime.

#### P0-11: Discovery page redesign — promotional carousel, category browse, full photo coverage (F14)
Replaces the discovery page's static banner and campaigns marquee with a promotional carousel, adds a category browse strip, and gives every restaurant a real photo.

- The discovery hero is a full-width **promotional carousel** that auto-advances and pauses while hovered or focused. Its first slide reads **"Your first order in Foodlicious is 50% off"** in vibrant, animated styling; the remaining slides are the seeded campaigns, each showing a photo and its headline. [TC-11.1, TC-11.5]
- **Given** a campaign slide, **when** the customer clicks it, **then** they land on that campaign's restaurant. [TC-11.2]
- The search field sits **below the carousel**, unchanged otherwise (same accessible name and placeholder). [TC-11.3]
- Below the search field, a row of **category chips** (e.g. Biryani, Tiffin) lets a customer browse by cuisine, replacing the marquee's old position. **Given** a category chip, **when** clicked, **then** the restaurant grid filters to restaurants tagged with that cuisine; clicking the same chip again clears the filter; the filter combines with an active name search. [TC-11.6, TC-11.7, TC-11.8, TC-11.9]
- Every restaurant on discovery shows a **real photo**. No restaurant is deliberately photo-less anymore except the one card that still exercises the no-photo fallback rendering path. [TC-11.4]

*Technical considerations:* no new schema — this reuses `Campaign.imageUrl` (seeded but previously unused by the marquee) and the existing `Restaurant.cuisines` free-text tags (also already shown as chips on each card). `listRestaurants()` gains an optional cuisine filter alongside its existing name search. The Grand Sweets and Snacks now has real photos like every other restaurant. **Update (F15, 2026-09-17):** Pakwan also got real photos — Ponnusamy Hotel became the one restaurant seeded with no photos, so TC-2.7/TC-8.6 still had something real to test. **Update (F19, 2026-09-18):** that pattern is retired — Ponnusamy Hotel now has real photos too, `listRestaurants()` excludes any photo-less restaurant from discovery outright, and TC-2.7/TC-8.6 construct a temporary photo-less fixture via `testDb` instead of relying on a permanently-bare seeded restaurant.

#### P0-12: Discovery page polish (F15)
Small refinements to the F14 discovery redesign, on top of the same carousel/chip/card mechanisms — no new pages or data model.

- The promo slide's headline never wraps to a second line, and the carousel background carries a few small animated decorative shapes. [TC-12.1]
- **Given** an active category chip, **then** it shows a check mark, and a subtle **"Clear all"** link appears next to the chip row (only while a filter is active) that clears it. [TC-12.2, TC-12.3]
- Every store card shows a **"Pre-order available"** chip alongside its pickup-time chip — scheduling is already platform-wide (P0-9), so this is informational on every card, not a per-restaurant flag. [TC-12.4]
- **Sin & Tonic**'s card carries a **"Foodlicious exclusive"** badge, positioned opposite the favourite button. [TC-12.5]
- The banner carousel's auto-advance interval is 3 seconds (previously 5).

*Technical considerations:* the exclusive badge is a hardcoded slug check in `RestaurantCard` (`sin-and-tonic`) — a single-restaurant label isn't worth a new schema field. The doodle shapes and check mark are plain positioned/inline elements, not new dependencies; the check mark sits inside the chip's `label` (not MUI's `icon` prop), avoiding the SSR/hydration bug documented in F7.

#### P0-13: Menu page redesign (F16)
Reworks how the menu page presents items: no more Recommended shortcut, bigger and inspectable photos, and quantity control without leaving the page.

- ~~The menu opens with a Recommended section~~ **removed at the owner's request** — see P0-7's note. The menu now opens directly on its categories.
- **Given** a menu item's photo, **when** the customer clicks it, **then** it opens larger with a close control; the thumbnail itself is also bigger than before and no longer hidden on mobile. [TC-13.1]
- **Given** an item not yet in the basket, **when** the customer clicks Add, **then** a brief acknowledgement animation plays and the control becomes a **quantity stepper** (−/count/+) reflecting the live basket count for that item; decreasing to 0 reverts to an Add button. [TC-13.2]
- Each category heading is colored distinctly from its neighbours, cycling a small set of brand colors. [TC-13.3]

*Technical considerations:* `AddToBasketButton` now reads its own quantity from `useBasket()` instead of being a stateless one-shot button; the stepper reuses the exact control pattern already on the basket page (`increment`/`decrement`, same aria-label conventions). The photo lightbox is a small new client component (`MenuItemImage`) using a MUI `Dialog`, unmounted while closed so it never double-counts against `#menu-categories li img` assertions.

#### P0-14: Discovery and global visual polish (F19)
Removes a data gap in photo coverage and makes the brand color and interactive states actually read as branded rather than neutral-grey.

- A restaurant with no photos is **excluded from discovery entirely** — see P0-2's superseded bullet. [TC-2.7]
- Interactive hover, selected and focus states use a **tomato tint** instead of MUI's default grey, applied once at the theme level so it's consistent everywhere. [TC-14.1]
- The ASAP/Schedule-for-later and Cash/Online payment toggles fill **solid tomato** when selected, instead of a pale grey highlight. [TC-14.2]
- Menu item prices are colored in the brand tomato. [TC-14.3]

*Technical considerations:* `theme.ts`'s `palette.action.hover/selected/focus` are overridden from MUI's defaults to tomato-tinted rgba values, so every component using the default hover/selected mechanism (buttons, list items, menu items) picks it up without individual overrides. `MuiToggleButton`'s `&.Mui-selected` gets an explicit solid-tomato override since the intensity needed there (a primary either/or choice) is stronger than a generic hover tint.

#### P0-15: Menu page enhancements (F21)
Two additions to the restaurant menu page: reachability and visual hierarchy.

- **Given** a non-empty basket, **when** the customer is on a restaurant's menu page, **then** a floating basket button stays visible while scrolling, showing the item count and linking to `/basket`. [TC-15.1]
- The store's name, rating, address and info chips are **superimposed directly on the hero banner photos** with a dark-to-transparent gradient scrim for legibility, replacing the previous stacked banner-then-card layout. [TC-15.2]
- ~~Directly below the store info, a horizontally-scrollable row of short illustrated "reel" cards (looping CSS/SVG animations — a wok toss, a tandoor flame, a steamer, plating/garnish, a dessert drizzle) suggests item-prep/social content per cuisine.~~ **Removed by F23 (2026-09-18)** at the owner's request, same day it shipped. `menu-reels.tsx` and TC-15.3 were deleted.

*Technical considerations:* no new external assets or dependencies for either remaining item.

#### P0-16: Guest checkout (F24)
Anyone can place a pickup order without creating an account.

- **Given** the login page, **when** a visitor selects **"Continue as Guest"**, **then** a Name field replaces the email/password form. [TC-16.1]
- **Given** the guest form, **when** they enter a name and continue, **then** they're signed in — no email or password is collected — and returned to where they came from (checkout, if that's what sent them to log in, or home otherwise), the same as a registered login. [TC-16.2]
- A blank name is rejected with a field error; nothing is created. [TC-16.3]
- A guest can complete an entire checkout through to the order confirmation page exactly like a registered customer — basket, pricing, payment method and the confirmation page make no distinction. [TC-16.4]
- This is **not** a sign-up: a guest has no credentials and cannot log back in as that identity later. ~~There is no sign-up or "forgot password" option~~ (P0-1) still holds for *registered* accounts; guest checkout is a separate, parallel path that skips accounts entirely, not an exception to it.

*Technical considerations:* `User.email`/`User.passwordHash` become nullable and a new `User.isGuest` flag marks guest rows, so a guest is still a real row with a real id — every order needs a valid owner. `continueAsGuest` reuses the exact same session mechanism as `login` (`createSession(user.id)`), so every existing auth-gated code path (`requireUser`, `proxy.ts`'s route protection, order ownership checks) works unchanged for guests with no special-casing. *Dependencies:* P0-1 (extends the login page), P0-5 (checkout).

#### P0-17: Mobile responsiveness (F25)
A pass over the existing pages and components fixing layout that didn't hold up on narrow phone widths — no new pages, no behavior change.

- At phone widths (down to 320px), no page produces horizontal overflow — nothing requires a horizontal scrollbar or gets clipped off the right edge. [TC-17.1]
- The promotional banner headline (pinned to one line since P0-12) shrinks fluidly with viewport width instead of only at a few fixed breakpoints, so it always fits instead of being cut off at in-between widths. [TC-17.2]
- The header's signed-in greeting truncates with an ellipsis instead of wrapping mid-word or overflowing when the name is long. [TC-17.3]

*Technical considerations:* `BannerCarousel`'s headline font size uses `clamp()` instead of discrete `sx` breakpoint steps, so it scales continuously with `vw` rather than jumping between fixed sizes. `SiteHeader`'s greeting gets a bounded `maxWidth` with `text-overflow: ellipsis`. Checked empirically with a headless browser at 320/360/375/414px against the home, restaurant menu, basket and checkout pages, logged in and as a guest.

### Nice-to-Have (P1)
**None committed for v1.** The scope is deliberately tight. Anything proposed for v1 enters here only with a matching removal from P0 or an explicit timeline extension.

### Future Considerations (P2)

| Future capability | Design choice in v1 that keeps it cheap later |
|---|---|
| Sign-up and password reset | Customers are identified by unique email, so accounts can later be self-created and recovered by email. |
| Order history and live status | Orders carry a status (`PENDING_PAYMENT`, `PAYMENT_FAILED`, `PLACED`) that can grow into preparing/ready/collected. |
| Restaurant order inbox | Orders already belong to a restaurant and hold full item snapshots. |
| Real payment gateway (e.g. Razorpay) | Checkout depends on a payment-provider interface; amounts are in paise, as gateways expect. |
| Opening hours and pausing a restaurant | Ordering rules sit in one server-side placement step where an "is open" check can be added. |
| Item variants and add-ons | Order lines store their own name and price, so richer line items won't rewrite past orders. |
| Scheduled pickup for residents | Pickup is modelled as "ASAP" on the confirmation, leaving room for a chosen time. |

---

## Success Metrics

### Measured in this build (demo)

| Type | Metric | Success | Stretch | Method and when |
|---|---|---|---|---|
| Leading | **Journey completion:** guest → search → menu → basket → login → pay → confirmation | TC-J.1 passes on every run | Also passes in the reviewer's live browser check | Playwright, at every feature review and at release |
| Leading | **Requirement verification coverage** | 100% of TC IDs have tests; 100% pass | Same, with 0 flaky retries | `npm run tc:check` + `npm test`, per feature |
| Leading | **Time to order** (manual walkthrough, seeded account, home → confirmation) | < 2 min | < 1 min | Stopwatch walkthrough at release |
| Leading | **Error rate** | 0 unhandled errors in the full Playwright run | 0 browser console errors during the reviewer's live check | Playwright report + live check, per feature |

Lagging indicators aren't measurable in a local build with no real users.

### If launched (hypotheses, not measured in v1)
Targets are explicit hypotheses with no benchmark data behind them. Measuring them needs product analytics, which is out of scope for v1.

| Type | Metric | Success | Stretch | Method and window |
|---|---|---|---|---|
| Leading | **Checkout conversion:** baskets with ≥1 item → placed orders | 40% | 55% | Analytics funnel, first 30 days |
| Leading | **Payment-failure recovery:** failed-payment sessions that place an order within 15 min | 60% | 75% | Analytics funnel, first 30 days |
| Leading | **Median time to order:** app open → confirmation | < 2 min | < 90 s | Analytics timing, first 30 days |
| Lagging | **Repeat ordering:** customers placing a 2nd order within 30 days | 25% | 35% | Cohort analysis, 60 days post-launch |
| Lagging | **Order-accuracy complaints:** support contacts about wrong totals or unavailable items, per 100 orders | < 1 | < 0.5 | Support tagging, quarterly |

---

## Open Questions

| Question | Owner | Blocking? |
|---|---|---|
| ~~What is the app/brand name for the header and page titles?~~ **Resolved 2026-09-14: FoodStation; renamed again 2026-09-16: Foodlicious.** | Stakeholder | Closed |
| Where would real restaurant and dish images come from, and under what licence? v1 uses placeholders. | Design | Non-blocking |
| For a real launch, is a flat 5% GST on the subtotal correct, are menu prices GST-inclusive, and are packaging charges needed? | Legal / finance | Non-blocking (v1 assumes 5% on subtotal) |
| Do residents need scheduled pickup before a real launch, or is ASAP enough? | Stakeholder / research | Non-blocking |

---

## Timeline Considerations

- **Hard deadlines:** none. This is a learning and portfolio project.
- **Dependencies:** local PostgreSQL (Docker Compose); seeded restaurant, menu and customer data; the Playwright tooling used for automated tests and independent review. No external teams.
- **Phasing:** one feature per cycle. Each cycle ends with an independent review returning PASS and the owner's sign-off before the next begins.
  0. F0: foundation (data model, seed data, test tooling). Not user-facing.
  1. F1: login and logout (P0-1)
  2. F2: restaurant discovery (P0-2)
  3. F3: restaurant menu (P0-3)
  4. F4: basket (P0-4)
  5. F5: checkout (P0-5)
  6. F6: place order and confirmation (P0-6). **The v1 journey is complete here.**

---

## Appendix A: Decision Log

| # | Decision | Rationale / source |
|---|---|---|
| D1 | Login is **email + password** | Matches project scope; leaves room for email-based recovery later. |
| D2 | **No sign-up;** customer accounts are pre-seeded. No password reset. | Owner decision. |
| D3 | Customers can browse and build a basket as guests; **login is required at checkout** | Keeps browsing low-friction. |
| D4 | Restaurants and menus come from **seed data**; no restaurant-admin UI in v1 | Restaurant Admin is a separate PRD. |
| D5 | Discovery = full list + **search by name** | Small catalogue; filters are future scope. |
| D6 | **No opening hours;** every restaurant is always orderable | Owner decision. |
| D7 | Menu items: category, name, description, price, image, veg/non-veg, available flag. **No variants or add-ons.** | Keeps basket and pricing simple. |
| D8 | **A basket holds items from one restaurant only;** switching asks for confirmation | Pickup happens at a single counter. |
| D9 | **Simulated payment** with success and failure outcomes | Project scope; the failure path must be designed, not skipped. |
| D10 | Total = subtotal + **5% GST**; menu prices in whole rupees | Realistic without per-restaurant charges. |
| D11 | Journey ends at an order confirmation with its own URL; restaurant handling, history, status and cancellation are out of scope | Tight v1. |
| D12 | Basket is saved in the browser; no cross-device sync | Simplicity. |
| D13 | Pickup is **ASAP only** | No scheduling in v1. |
| D14 | Server is authoritative on price and availability; a mismatch rejects the order and refreshes the basket | Customers are never charged a surprise total. |
| D15 | Money stored as integer paise | Exact GST (5% of whole rupees is always exact paise). |
| D16 | Quantity 1–10 per item | Guards against accidental bulk orders. |
| D17 | Every test case is automated with **Playwright** | Owner decision. |
| D18 | Each feature is reviewed by an **independent agent** that may fix issues; a fresh review must then pass. Review runs automatically. | Owner decision. |

---

## Appendix B: Test Cases

All test cases are automated with Playwright. **B** = browser test; **L** = logic/database test that runs without a browser. `TC-n.x` verifies **P0-n**; `TC-J.1` verifies Goal 1. Every automated test title starts with its ID.

### TC-1: Login and logout (P0-1)
| ID | Type | Scenario | Expected |
|---|---|---|---|
| TC-1.1 | B | Log in as `priya@example.com` / `password123` | Redirected to `/`; header shows "Hi Priya" and Logout |
| TC-1.2 | B | Correct email, wrong password | "Invalid email or password"; no session cookie |
| TC-1.3 | B | Unknown email | Identical message to TC-1.2 |
| TC-1.4 | L | Login validation with malformed email or empty password | Field errors returned |
| TC-1.5 | B | `"  Priya@Example.COM "` with correct password | Login succeeds |
| TC-1.6 | B | Reload and open a new tab after login | Still logged in |
| TC-1.7 | B | Log out, then open `/checkout` | Header shows Login; redirected to `/login?next=/checkout` |
| TC-1.8 | B | Signed-in customer opens `/login` | Redirected to `/` |
| TC-1.9 | L+B | L: redirect-target check for `/checkout`, `https://evil.com`, `//evil.com`, `javascript:…`, empty. B: log in via `/login?next=//evil.com` | L: only `/checkout` accepted. B: lands on the app's home page |
| TC-1.10 | B | Garbage or tampered session cookie | Treated as logged out; `/checkout` redirects to login |
| TC-1.11 | L | Inspect seeded customers in the database | Stored password is a bcrypt hash, never the plaintext |
| TC-1.12 | B | View login page | No sign-up or forgot-password links |

### TC-2: Restaurant discovery (P0-2)
| ID | Type | Scenario | Expected |
|---|---|---|---|
| TC-2.1 | B | Open `/` logged out | All 10 restaurants, alphabetical, with name, cuisine tags, real photo |
| TC-2.2 | L | Search "thalappakatti" | Only "Dindigul Thalappakatti" |
| TC-2.3 | L | Search "   " and no search | All restaurants |
| TC-2.4 | B | Search "pizza" | Empty state naming the term; clear link restores the list |
| TC-2.5 | B | Search, reload, press Back | Search term kept on reload; Back shows the unfiltered list |
| TC-2.6 | L | Search `%`, `_`, `'` | No error; empty result |
| TC-2.7 | L | `listRestaurants` with a temporary photo-less restaurant fixture | Excluded from the results |

### TC-3: Restaurant menu (P0-3)
| ID | Type | Scenario | Expected |
|---|---|---|---|
| TC-3.1 | B | Select a restaurant | Restaurant page shows name, cuisines, address and categories in order |
| TC-3.2 | B | Inspect a menu item | Name, description, "₹250"-style price, veg/non-veg marker with accessible label |
| TC-3.3 | B | Unavailable item | "Currently unavailable"; Add disabled |
| TC-3.4 | B | Open `/restaurants/does-not-exist` | "Restaurant not found" with link home |
| TC-3.5 | L | Menu for a restaurant with an empty category; unknown restaurant | Empty category omitted; unknown returns nothing |
| TC-3.6 | B | View menu while logged out | Menu visible; Add works |
| TC-3.7 | L | Format 25000, 1250 and 0 paise | "₹250", "₹12.50", "₹0" |

### TC-4: Basket (P0-4)
| ID | Type | Scenario | Expected |
|---|---|---|---|
| TC-4.1 | B | Guest adds an item | Header count 1; basket shows line, qty 1, line total |
| TC-4.2 | L | Add the same item twice | One line, quantity 2 |
| TC-4.3 | L | Increase and decrease quantity; decrease at 1 | Quantity changes; line removed at 0 |
| TC-4.4 | L | Increase past 10 | Quantity stays 10 |
| TC-4.5 | L | Remove the last line | Basket empty; no restaurant |
| TC-4.6 | B | Basket from restaurant A, add from B, choose Cancel | Basket unchanged |
| TC-4.7 | B | Basket from restaurant A, add from B, choose Confirm | Basket holds only the B item |
| TC-4.8 | B | Add items, reload, navigate away and back | Basket intact |
| TC-4.9 | L+B | Corrupted saved basket | Empty basket; no crash or error screen |
| TC-4.10 | L | Totals for ₹250 × 2 + ₹120 | Subtotal ₹620, GST ₹31, total ₹651 |
| TC-4.11 | L | Totals for ₹250 × 1 | Subtotal ₹250, GST ₹12.50, total ₹262.50 |
| TC-4.12 | B | Open an empty basket | Empty state with "Browse restaurants"; no Checkout |

### TC-5: Checkout (P0-5)
| ID | Type | Scenario | Expected |
|---|---|---|---|
| TC-5.1 | B | Guest with a basket clicks Checkout | Sent to `/login?next=/checkout`; after login, on checkout with basket intact |
| TC-5.2 | B | Checkout contents | Restaurant name and address, "Pickup only", items, subtotal, GST 5%, total matching the basket |
| TC-5.3 | B | Open `/checkout` with an empty basket | Redirected to the basket page |
| TC-5.4 | B | Payment panel | Cash payment selected by default (F27); button reads "Place order" |
| TC-5.5 | B | Double-click Pay | Button disabled while processing; exactly one new order |

### TC-6: Place order and confirmation (P0-6)
| ID | Type | Scenario | Expected |
|---|---|---|---|
| TC-6.1 | L | Place a valid order with successful payment | Order placed; totals from current menu prices; item names and prices recorded; payment reference starts `mock_` |
| TC-6.2 | L | Order request includes browser-supplied prices | Rejected; no order |
| TC-6.3 | L | Place an order with failed payment | Order marked payment-failed; failure returned |
| TC-6.4 | L+B | An item becomes unavailable after it was added to the basket | L: rejected as unavailable; no order. B: item flagged; Pay blocked until removed |
| TC-6.5 | L | Items from two restaurants, or an unknown item | Rejected as unavailable; no order |
| TC-6.6 | L+B | Displayed total differs from current prices (B: saved basket price tampered to ₹1) | L: rejected as price changed; no order. B: notice shown and total corrected |
| TC-6.7 | L | Quantity 0, −1, 11 or 1.5; empty basket | Validation error; no order |
| TC-6.8 | B | Open checkout, clear cookies, click Pay | Sent to login; no new order |
| TC-6.9 | L | Place two successful orders | Order numbers unique and increasing |
| TC-6.12 | B | View confirmation | "Order confirmed", order number, pickup name and address, items, totals, "Paid online (simulated)"; basket count 0 |
| TC-6.13 | B | Reload the confirmation | Same page shown |
| TC-6.14 | B | Another customer (Arjun) opens Priya's confirmation | Not found |
| TC-6.15 | B | Logged-out visitor opens a confirmation URL | Asked to log in, then returned to the confirmation |
| TC-6.16 | B | Open the URL of a payment-failed order | Not found |
| TC-6.17 | B | View confirmation | A brief confetti animation plays around the checkmark |

### TC-7: Discovery and menu experience (P0-7)
| ID | Type | Scenario | Expected |
|---|---|---|---|
| TC-7.1 | B | Hotel Saravana Bhavan card | Rating labelled "Rated 4.7 out of 5 from 812 reviews", showing 4.7 and (812) |
| TC-7.2 | B | Pickup time on two different cards | Absolute Barbecues shows 28 mins; The Grand Sweets and Snacks shows 9 mins |
| TC-7.3 | B | Vegetarian and non-vegetarian kitchens | Hotel Saravana Bhavan marked Vegetarian; Dindigul Thalappakatti marked Non-vegetarian |
| TC-7.4 | B | Next and previous photo on a card carousel | Photo moves 1 → 2 and back; the page does not navigate away |
| TC-7.5 | B | Signed-in customer favourites a store, then reloads | Control reads "Remove … from favourites" and still does after reload |
| TC-7.6 | B | Logged-out visitor clicks favourite | Sent to the login page; nothing is favourited |
| TC-7.7 | B | Menu items | Every row inside `#menu-categories` has exactly one photo |
| TC-7.9 | B | Branding | Page title and header wordmark both read Foodlicious |
| TC-7.10 | B | A menu item's photo request fails to load | No broken-image icon; the photo control is removed entirely |

### TC-8: Discovery page UX (P0-8)
| ID | Type | Scenario | Expected |
|---|---|---|---|
| TC-8.1 | B | Home page search field | Placeholder reads "Search restaurants, items, cuisines..." |
| TC-8.3 | B | Hovering a card's carousel | The photo advances without a click, page stays put |
| TC-8.5 | B | Opening a restaurant with photos | A hero banner above the name/rating/address block auto-advances |
| TC-8.6 | B | Opening a restaurant with no photos | No banner photo `<img>` element, no broken image (gradient-fallback banner still hosts the store info) |

### TC-9: Pre-order (P0-9)
| ID | Type | Scenario | Expected |
|---|---|---|---|
| TC-9.1 | B | Schedule a valid future pickup time, pay | Order placed; confirmation shows that pickup time |
| TC-9.2 | L | `placeOrder` with a past `scheduledFor` | Rejected as `INVALID_SCHEDULE`; no order created |
| TC-9.3 | L | `placeOrder` with a time outside 9am-10pm, or more than 7 days out | Rejected as `INVALID_SCHEDULE`; no order created |
| TC-9.4 | B | Checkout without scheduling, pay | Confirmation shows "Pickup: ASAP" |

### TC-10: Payment method and kitchen view (P0-10)
| ID | Type | Scenario | Expected |
|---|---|---|---|
| TC-10.1 | B | Open checkout | Payment card shows "Pay in cash" and "Pay later online" buttons, cash selected by default |
| TC-10.2 | B | Select "Pay in cash", place order | Confirmation shows "Payment: Pay ₹273 in cash at pickup" |
| TC-10.3 | L | `placeOrder` with `paymentMethod: "CASH"` and `simulateSuccess: false` | Order placed outright (`PLACED`), no payment provider called, `paymentRef` null |
| TC-10.4 | B | Toggle between cash and online | Pay button label switches between "Place order" and "Pay ₹X" |
| TC-10.5 | B | View confirmation | "Kitchen view" heading, "LIVE" badge, "Simulated live view — `<restaurant>`'s kitchen" label |
| TC-10.6 | B | View confirmation | Kitchen view shows a photo (`<img>` element, `/images/kitchen-chef.jpg`), not just an illustration |

### TC-11: Discovery page redesign (P0-11)
| ID | Type | Scenario | Expected |
|---|---|---|---|
| TC-11.1 | B | Open `/` | Banner carousel's first slide reads "Your first order in Foodlicious is 50% off" |
| TC-11.2 | B | Click a campaign slide | Navigates to that campaign's restaurant |
| TC-11.3 | B | Home page layout | Search field sits below the banner carousel |
| TC-11.4 | B | The Grand Sweets and Snacks card | Shows a real photo, not the initials placeholder |
| TC-11.5 | B | Banner carousel over time, then hover | Auto-advances off the promo slide; hovering the current slide stops further advance |
| TC-11.6 | B | Click the "Tiffin" category chip | Grid filters to the 3 restaurants tagged Tiffin |
| TC-11.7 | B | Click the active category chip again | Filter clears; all 10 restaurants shown |
| TC-11.8 | B | Search "thalappakatti", then click "Biryani" | Both filters apply together; only Dindigul Thalappakatti shown |
| TC-11.9 | L | `listRestaurants` with a cuisine filter, alone and combined with a name search | Narrows correctly; combines as AND; no match returns empty |

### TC-12: Discovery page polish (P0-12)
| ID | Type | Scenario | Expected |
|---|---|---|---|
| TC-12.1 | B | Promo slide headline | CSS `white-space: nowrap` |
| TC-12.2 | B | A category filter is active | That chip shows a check mark |
| TC-12.3 | B | No filter active, then one active | "Clear all" hidden, then visible; clicking it clears the filter |
| TC-12.4 | B | Any store card | Shows a "Pre-order available" chip |
| TC-12.5 | B | Sin & Tonic's card | Shows a "Foodlicious exclusive" badge |

### TC-13: Menu page redesign (P0-13)
| ID | Type | Scenario | Expected |
|---|---|---|---|
| TC-13.1 | B | Click a menu item's photo, then Close | Larger photo opens; closes and removes the enlarged image |
| TC-13.2 | B | Click Add, then +/− | Becomes a quantity stepper reflecting the basket count; reverts to Add at 0 |
| TC-13.3 | B | A menu page with multiple categories | Category headings render in more than one distinct color |

### TC-14: Discovery and global visual polish (P0-14)
| ID | Type | Scenario | Expected |
|---|---|---|---|
| TC-14.1 | B | Hover an interactive element | Computed hover background is tomato-tinted, not MUI's default grey |
| TC-14.2 | B | Select a pickup-time or payment-method toggle option | Selected button has a solid tomato background |
| TC-14.3 | B | A menu item row | Price text is colored in the brand tomato |

### TC-15: Menu page enhancements (P0-15)
| ID | Type | Scenario | Expected |
|---|---|---|---|
| TC-15.1 | B | Add an item, scroll down the menu page | A floating basket button stays visible showing the item count, linking to `/basket` |
| TC-15.2 | B | Open a restaurant's menu page | Store name/rating/address render over the hero photo with a gradient scrim |

### TC-16: Guest checkout (P0-16)
| ID | Type | Scenario | Expected |
|---|---|---|---|
| TC-16.1 | B | Login page, click "Continue as Guest" | A Name field and its own submit button replace the email/password form |
| TC-16.2 | B | Enter a name, continue as guest, from `/login?next=/checkout` | Signed in; returned to `/checkout`; header shows a greeting |
| TC-16.3 | B | Submit the guest form with a blank name | Field error shown; no session created |
| TC-16.4 | B | Continue as guest, add an item, check out, pay | Reaches the order confirmation page with correct items and total |

### TC-17: Mobile responsiveness (P0-17)
| ID | Type | Scenario | Expected |
|---|---|---|---|
| TC-17.1 | B | Home, menu, basket and checkout pages at a 320px viewport | `document.documentElement.scrollWidth` does not exceed the viewport width on any of them |
| TC-17.2 | B | Promo banner headline at a 320px viewport | Its right edge does not exceed the viewport width |
| TC-17.3 | B | Signed in with a long single-word name, 320px viewport | Header row has no horizontal overflow; the greeting is truncated |

### TC-J: End-to-end journey (Goal 1)
| ID | Type | Scenario | Expected |
|---|---|---|---|
| TC-J.1 | B | Guest searches "tiffin", opens the restaurant, adds 2 items (one twice), opens basket, checks out, logs in, pays successfully | Confirmation shows the correct items, quantities and GST-inclusive total |

---

## Appendix C: Glossary

| Term | Meaning |
|---|---|
| **Restaurant** | A food business listed on the platform. The original requirements call this a *store*; the two words mean the same thing. |
| **Basket** | The customer's in-progress order for one restaurant, saved in their browser. |
| **Pickup** | The customer collects the order at the restaurant counter. There is no delivery. |
| **ASAP** | Pickup as soon as the order is ready; no time is chosen in v1. |
| **Seeded account** | A demo customer account created by the setup script (e.g. `priya@example.com`). |
| **Simulated payment** | A stand-in for a real payment gateway; the customer chooses whether it succeeds or fails. |
| **Paise** | 1/100 of a rupee; all amounts are stored in paise. |
| **P0 / P1 / P2** | Must-have for v1 / nice-to-have fast follow / future consideration. |
