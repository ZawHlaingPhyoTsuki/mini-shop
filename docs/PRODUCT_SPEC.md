# Product Specification

## 1. Overview

Mini Shop is a searchable marketplace and storefront platform for merchants who currently sell through TikTok and other social channels. It supports Myanmar Kyat (`MMK`) and Thai Baht (`THB`), with English and Myanmar names initially and Shan names planned. It organizes scattered product posts into structured listings and gives each merchant a shareable shop page.

## 2. Problem statement

Products shared through short-form videos, livestreams, comments, and social posts can be difficult to rediscover. Customers may have to message a seller to ask for prices, options, availability, or other products. Merchants repeatedly answer the same questions and lack a central catalog and lightweight order-management workflow.

## 3. Goals

- Let customers discover products across participating merchants.
- Let customers explore all products belonging to one merchant.
- Make product details, localized names, price in MMK or THB, variants, and availability clear.
- Give merchants an easy way to publish and maintain listings.
- Support a simple COD order lifecycle.
- Build a foundation for trust, reviews, and useful merchant analytics.

## 4. Non-goals for the MVP

- Processing digital payments.
- Operating a delivery fleet.
- Live shipping-rate integrations.
- Cross-merchant checkout.
- TikTok scraping or automatic imports.
- A video-first social feed.
- AI-based recommendations.
- Paid advertisements or subscriptions.

## 5. Personas

### Customer

Wants to find, compare, and order products without searching through many social posts or contacting a seller just to learn basic information.

### Merchant

Already sells through social media and wants a structured catalog, a shareable storefront, and a simple way to manage COD orders.

### Administrator

Maintains marketplace quality, reviews reports, manages categories, and can take action against fraudulent or inappropriate listings.

## 6. Customer requirements

### Discovery

- Browse published products from active shops.
- Search by product name and relevant keywords.
- Browse by category.
- Filter and sort listings.
- Open a product's public detail page.
- Open a merchant's public storefront.
- Share product and shop links.
- Use the public marketplace without signing in.

### Product detail

- Show the product name in the selected locale, images, description, price with its currency, and availability.
- Show variants and selection requirements where applicable.
- Show merchant identity and a link to the shop.
- Show delivery and COD information.
- Do not display fabricated ratings, likes, stock, or verification indicators.

### Checkout

- The initial checkout contains products from one shop only.
- Collect the minimum information needed to fulfill a COD order, such as customer name, phone number, and delivery address.
- Allow guest checkout; do not force account creation solely to place an order.
- Recalculate price, currency, variant availability, stock, and delivery charges on the server.
- Show an order confirmation and a safe way to retrieve order status.
- Avoid exposing sequential order identifiers as authorization tokens.

### Account features

Customer accounts, saved favorites, and convenient order history can be introduced without making sign-in mandatory for public browsing. If favorites require an account, explain that requirement in the UI.

## 7. Merchant requirements

### Shop setup

- Authenticated user can create a shop.
- Shop has a unique public slug.
- Shop has a name, localized description (English and Myanmar initially), optional logo/banner, and contact/social links.
- Shop publication or approval state is explicit.
- A new shop is submitted for admin review (`PENDING_REVIEW`); only an admin may activate it.
- A rejected shop returns to `DRAFT` with a review note so the owner can edit and resubmit.
- Only authorized shop members can edit the shop.

### Product management

- Create, edit, publish, unpublish, and archive products.
- Store localized product names, slug, description, category, price, currency, and publication state.
- Support one or more images.
- Support basic stock management.
- Support variants when required by product type.
- Validate price, currency, stock, image ownership, and publication eligibility on the server.
- A product must not be publicly discoverable if it is unpublished, archived, out of policy, or belongs to an inactive shop.

### Order management

- View orders belonging to the merchant's shop only.
- Review customer-provided delivery information only when needed to fulfill the order.
- Confirm or reject a new order.
- Update fulfillment status through allowed transitions.
- Track COD payment state separately from fulfillment.
- Preserve order-item snapshots if product data later changes.

### Analytics (later phase)

- Product views.
- Likes/favorites.
- Order counts and status breakdown.
- Completed order value, clearly distinguished from gross order value.
- Top products over a selected period.

## 8. Admin requirements

- Manage categories.
- View and moderate shops and products.
- Suspend shops or hide listings where policy permits.
- Review user reports.
- Record moderation actions where appropriate.
- Restrict admin operations to explicitly authorized roles.

## 9. Initial product states

### Shop

Implemented states: `DRAFT`, `PENDING_REVIEW`, `ACTIVE`, `SUSPENDED`, `CLOSED`.

Approval is mandatory for the MVP (D-022). A shop starts in `PENDING_REVIEW` when created, becomes `ACTIVE` only through an admin approval, and returns to `DRAFT` on rejection. Owners may resubmit a draft; the NestJS shops module owns the allowed transitions.

### Product

Suggested states: `draft`, `published`, `archived`, `hidden`.

A published product must still pass shop-status, stock/availability, and moderation checks before being shown publicly.

## 10. Success measures

- Merchant setup completion rate.
- Percentage of shops publishing at least one product.
- Active shops and active listings.
- Searches that lead to product views.
- Product views that lead to orders.
- Order confirmation and delivery completion rates.
- Merchant retention.
- Customer repeat usage.

Avoid optimizing only for registrations or raw views.

## 11. MVP acceptance criteria

- A visitor can browse and search public products without signing in.
- A visitor can open a product and navigate to its shop.
- A merchant can create and maintain listings only for shops they manage.
- A customer can place a COD order for products from one shop.
- The server calculates the final order amount in the listing currency and validates stock.
- Order items preserve the purchased localized name, variant, price, and currency.
- Merchants can access and update only their own shop's orders.
- Fulfillment and payment statuses are distinct.
- Invalid or unauthorized requests are rejected server-side.
- English and Myanmar names are available in the current schema. Adding another locale requires a deliberate schema migration.
- Prices display the correct currency symbol and no decimals.
- Basic administration and listing moderation are available before broad public launch.
