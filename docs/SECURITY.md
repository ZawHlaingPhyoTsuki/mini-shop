# Security and Permissions

Security requirements apply even in the MVP. Client-side route guards are for UX, not authorization.

## 1. Authentication versus authorization

Better Auth establishes identity and sessions. Mini Shop must separately decide what each authenticated actor may do.

Suggested application roles:

- Customer (default authenticated user; may browse and place orders).
- Shop owner/member (can manage explicitly authorized shops).
- Platform admin (can perform platform-level moderation).

Do not trust a role or user ID sent in a request body. Resolve the current actor from the verified server session.

## 2. Authorization matrix

| Action                    |         Public visitor |      Customer |                           Authorized shop manager |                     Admin |
| ------------------------- | ---------------------: | ------------: | ------------------------------------------------: | ------------------------: |
| Browse published products |                    Yes |           Yes |                                               Yes |                       Yes |
| View eligible public shop |                    Yes |           Yes |                                               Yes |                       Yes |
| Create order              |    Yes, guest checkout |           Yes |                                               Yes |                       Yes |
| View own order            | With safe verification |           Yes | If managing the shop, limited to fulfillment need |   As required for support |
| Create/edit shop          |                     No | Eligible user |                                     Yes, own shop | Yes, where policy permits |
| Create/edit product       |                     No |            No |                                     Yes, own shop |       Yes, for moderation |
| View shop orders          |                     No |            No |                                Yes, own shop only |               As required |
| Moderate any listing      |                     No |            No |                                                No |                       Yes |
| Manage categories         |                     No |            No |                                                No |                       Yes |

Review guest-order verification and admin access carefully before production.

## 3. Input validation

- Validate every server mutation with Zod or equivalent runtime validation.
- Validate IDs, slugs, quantities, prices, text lengths, image metadata, and status transitions.
- Treat query parameters and uploaded file metadata as untrusted.
- Use database constraints as a second line of defense.
- Return safe error messages without SQL details, secrets, or sensitive personal data.

## 4. Shop and order isolation

- Every merchant query must scope by the authorized shop ID.
- Do not fetch an order by ID and assume the current merchant can access it.
- Validate product ownership and shop membership on every write.
- Public product queries must filter out unpublished, hidden, archived, or ineligible listings.
- A shop suspension must prevent its listings from appearing publicly and should prevent new orders.

## 5. Price and inventory integrity

- Never trust client-supplied price, currency, subtotal, delivery fee, discount, or total.
- Load authoritative product/variant data on the server.
- Use a database transaction for order and item creation.
- Use atomic/concurrency-safe inventory changes.
- Enforce positive quantities and valid amount ranges.

## 6. Guest checkout

Collect only information needed to fulfill the order. Use a non-guessable public reference and an additional verification mechanism before exposing guest order details. Rate-limit order creation and verification attempts where supported.

## 7. File upload security

- Generate object keys on the server.
- Limit file size and allowed content types.
- Verify that the uploader is authorized to attach the image to the target shop/product.
- Do not permit arbitrary object keys or arbitrary bucket URLs from the client.
- Keep storage credentials server-side.
- Consider malware scanning or image re-encoding if the risk and scale justify it.
- Clean up orphaned objects safely.

## 8. Abuse prevention and moderation

- Rate-limit authentication, guest checkout, order tracking, and other abuse-prone endpoints.
- Provide a way to report suspicious listings.
- Record moderation actions.
- Avoid allowing merchants to self-assign a verified badge.
- Do not accept reviews from ineligible purchasers.

## 9. Privacy and logging

- Do not log session tokens, passwords, secrets, full addresses, or full phone numbers.
- Keep customer contact and delivery data available only to authorized fulfillment actors.
- Define data retention and deletion policies before public launch.
- Use secure production cookies and correct origin/CSRF protections according to Better Auth and TanStack Start deployment guidance.
- Configure production CORS, trusted origins, HTTPS, and security headers for the actual deployment topology.

## 10. Operational safety

- Keep development and production environment variables separate.
- Never commit secrets.
- Review generated migrations before applying them.
- Back up production data and test recovery procedures.
- Avoid destructive operations against shared databases without explicit confirmation.
