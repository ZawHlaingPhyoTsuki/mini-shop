# Roadmap

This roadmap prioritizes a working product-discovery and COD workflow before advanced engagement or monetization.

## Phase 0 — Foundation

- [x] Confirm the Next.js web / NestJS API boundary and deployment topology.
- [x] Confirm Prisma 7 schema and migration workflow.
- [x] Configure Neon Postgres for local, preview, and production environments.
- [x] Configure Better Auth and verify session handling.
- [x] Establish server-only database and S3 modules.
- [x] Add automated test runner and baseline tests.
- [x] Configure lint, formatting, type checking, and CI.
- [x] Record decisions about shop approval and inventory timing.

**Exit criteria:** App boots, database migrations work in a safe development environment, and authentication can be tested.

## Phase 1 — Public catalog and merchant onboarding

- [ ] Public marketplace homepage.
- [ ] Category browsing with English/Myanmar names.
- [ ] Product search and basic sorting.
- [ ] Product detail page with localized names and MMK/THB pricing.
- [ ] Public merchant storefront.
- [x] Merchant account/shop creation (one shop per user, submitted for admin review).
- [ ] Product create/edit/archive with explicit currency.
- [ ] Product image upload and display.
- [ ] Shop/product publication rules.
- [x] Minimal admin moderation (shop approval/rejection queue).

**Exit criteria:** A merchant can publish a shop and products; a visitor can find and share those products without logging in.

## Phase 2 — COD ordering

- [ ] Cart limited to one shop.
- [ ] Checkout form and server validation with explicit order currency.
- [ ] Delivery fee rules.
- [ ] Authoritative server-side price and currency calculation.
- [ ] Order/item snapshot creation.
- [ ] Concurrency-safe inventory policy.
- [ ] Merchant order inbox.
- [ ] Allowed status transitions.
- [ ] Guest order confirmation and safe tracking.
- [ ] Separate fulfillment and payment status.
- [ ] Cancellation/rejection and stock-release behavior.

**Exit criteria:** A customer can place a COD order and the merchant can fulfill it without leaking another customer's data.

## Phase 3 — Engagement and trust

- [ ] Customer account order history.
- [ ] Favorites.
- [ ] Product likes, if they provide useful signal.
- [ ] Verified-purchase reviews.
- [ ] Merchant verification workflow.
- [ ] Report listing/shop flow.
- [ ] Basic product-view and order analytics.

**Exit criteria:** Customers can save products and provide trustworthy feedback; merchants can see basic performance.

## Phase 4 — Growth and optimization

- [ ] Improved English/Myanmar/Shan search.
- [ ] Synonyms and typo tolerance.
- [ ] Better category and price filters.
- [ ] Product recommendations based on validated usage signals.
- [ ] Promotional listings, clearly labeled.
- [ ] Discount codes.
- [ ] Multi-shop cart if user research supports it.
- [ ] Delivery integrations if operationally justified.
- [ ] Premium merchant tools if willingness to pay is validated.

## Product validation alongside development

- Interview merchants already selling on TikTok.
- Ask how they currently share catalogs and handle repeat questions.
- Observe how they manage prices, variants, inventory, and COD.
- Test whether they will maintain a separate catalog.
- Test public shop links with real customers.
- Track listing completion and order conversion, not only registrations.

Do not expand scope solely because a feature is technically interesting. Prioritize based on whether it improves discovery, merchant adoption, or successful order fulfillment.
