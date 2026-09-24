# Storefront flow audit

Audit date: 2026-09-22

## Current coverage

| Area | Route | Status | Notes |
| --- | --- | --- | --- |
| Landing/catalog | `/` | Partial | Catalog grid, categories, gallery and pagination exist. Product data can now come from Supabase. |
| Product detail | `/products/[slug]` | Functional | Responsive gallery, thumbnails, quantity and cart actions are connected. Final product copy and media come from Supabase. |
| Sign in | `/sign-in` | Partial | Email/password works. “Forgot password” has no flow. |
| Sign up | `/sign-up` | Functional | Supabase account creation works with email confirmation disabled. |
| Cart | `/cart` | Partial | Guest persistence and quantity editing work. No server synchronization or checkout yet. |
| Account overview | `/account` | Functional | Protected and backed by Supabase. |
| Order history | `/account/orders` | Partial | Lists orders, but has no order-detail route, tracking or invoice view. |
| Addresses | `/account/addresses` | Partial | Create/delete work. Editing and stronger validation are missing. |
| Favorites | `/account/favorites` | Partial | Reads Supabase favorites, but home-page heart buttons currently use local component state. |
| Profile/security | `/account/profile` | Functional | Profile and password update exist. User-facing success/error states should be improved. |
| Information pages | `/about`, `/contact`, `/shipping`, `/returns`, `/terms`, `/privacy` | Draft | Routes exist and footer links are not empty, but final bilingual copy is pending. |

## Required for a complete purchase flow — priority 0

1. **Checkout** — `/checkout`: customer contact, shipping address, billing choice, shipping method, complete summary and final consent.
2. **Trusted checkout action**: reload product prices and stock on the server, create/update the active cart, and create the payment order.
3. **PayPal integration endpoints**: create order, capture/verify payment, idempotency, webhook verification and order-status updates.
4. **Payment outcomes** — `/checkout/success` and `/checkout/cancel`: clear messaging and recovery without duplicating an order.
5. **Order detail** — `/account/orders/[id]`: line items, totals, addresses, payment status, fulfillment/tracking and status timeline.
6. **Password recovery** — `/forgot-password` and `/reset-password`, including the Supabase recovery callback.
7. **Cart synchronization**: merge guest cart into the authenticated customer cart and resolve changed prices or unavailable inventory.
8. **Operational states**: route-level `loading.tsx`, `error.tsx`, `not-found.tsx` and useful empty/error states around checkout.

## Required to operate the store — priority 1

1. **Admin access and authorization** with a protected admin layout.
2. **Products admin**: list, create, edit, archive, inventory, categories and images.
3. **Orders admin**: list, filter, detail, payment state, fulfillment, tracking and cancellation/refund notes.
4. **Build/gallery admin** for the community section and its media.
5. **Store settings**: currencies, shipping rules, contact details and tax configuration.
6. **Search and browse pages**: `/products`, category filtering and useful search results.
7. **Favorites mutations** connected to Supabase instead of temporary React state.
8. **Contact and newsletter submissions** persisted server-side with spam protection and feedback states.

## Quality and launch work — priority 2

- Complete Spanish localization for account, cart, validation messages and provider content.
- Product compatibility/fitment data and disclaimers.
- SEO metadata, product structured data, sitemap and social images.
- Accessibility pass for dialogs, menus, validation and focus management.
- Analytics and consent strategy.
- Transactional email for orders, shipping and password recovery.
- Shipping/tax policy implementation for Dominican Republic and United States.
- Database backup/restore check, logging, monitoring and rate limiting.

## Important risks found

- The cart contains product snapshots from the browser. These are useful for display but must never determine the charged amount.
- Order creation correctly has no public insert policy; it must remain a trusted server operation after payment verification.
- Several account pages query Supabase directly from Server Components. This is secure with RLS but should be moved behind customer/order repositories as those flows are expanded.
- The storefront currently falls back to fixture products when the Supabase catalog is empty or unavailable. Before launch, database failures should be logged and visibly monitored.
- The UI allows English/Spanish selection, but product mapping currently selects English fields. Locale-aware catalog mapping is still required.

## Recommended implementation sequence

1. Product listing/detail backed by Supabase.
2. Favorites and authenticated-cart repositories.
3. Checkout UI and authoritative server calculation.
4. PayPal sandbox create/capture/webhook flow.
5. Order detail and confirmation screens.
6. Password recovery and operational error states.
7. Minimum admin for products and orders.
