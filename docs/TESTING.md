# Testing Strategy

Vitest is the test runner. Tests live next to the code they cover and run with:

```bash
bun run test        # one run
bun run test:watch  # watch mode
```

`bun run check:ci` checks linting and formatting without rewriting files.
`bun run check-types` builds the app and runs TypeScript.

## Unit tests

Prioritize pure business rules:

- Price and total calculations in whole integer units.
- MMK/THB formatting and currency validation.
- Order transition validation.
- Localized-name validation and English fallback.
- Slug and quantity validation.
- Shop ownership authorization helpers.

Current baseline tests cover money, locales, slugs/quantities, fulfillment
transitions, and shop ownership.

## Database integration tests

Use the local Docker Postgres service:

```bash
bun run db:start
```

Run integration tests against a separate test database, not the development or
production Neon branch. The test setup must refuse a database whose host is not
local. Add an integration test setup only when the first domain table with real
queries lands; do not make every unit test depend on Postgres.

Cover:

- Shop ownership checks.
- Public catalog excludes hidden/unpublished products and suspended shops.
- Product and variant constraints.
- Order creation and immutable snapshots.
- Concurrent attempts to purchase the final unit.
- Merchant cannot access another shop's orders.
- Customer cannot access another customer's orders.
- Cancellation/rejection inventory release.

## Route/UI tests

Cover:

- Empty and populated catalog.
- Search/filter URL state.
- Product form validation.
- Checkout validation and error handling.
- Order status controls for permitted roles.
- Accessible labels and keyboard interactions.

Use `environment: "node"` by default. Add a per-file
`// @vitest-environment jsdom` comment only for files that render React.

## Security tests

- Unauthenticated user cannot mutate merchant resources.
- Authenticated non-owner cannot mutate another shop.
- Client-supplied price, currency, and total are ignored.
- Invalid status transitions are rejected.
- Public order reference does not expose guest order data without the required verification.
- Uploaded object keys cannot be forged to access another merchant's media.

## Manual release checklist

- Test at a narrow mobile viewport.
- Verify product/shop links open correctly from social apps.
- Verify English, Myanmar, and future Shan text rendering and fallback.
- Verify MMK and THB amounts both show no decimals.
- Verify slow network, upload failure, checkout retry, and duplicate submission.
- Verify COD totals and delivery fees are clear before submission.
- Verify suspended shops and hidden listings disappear from public discovery.
