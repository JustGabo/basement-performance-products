# Commerce architecture

## Decision

Supabase is the current infrastructure provider. Storefront code must depend on commerce contracts, not on Supabase tables or SDK response shapes. A future Medusa migration should replace adapters rather than pages and components.

## Boundaries

```text
Next.js pages and components
        |
        v
Commerce application contracts
  - CatalogRepository
  - CartRepository
  - OrderRepository
  - PaymentGateway
        |
        v
Provider adapters
  - Supabase (current)
  - Browser storage (guest cart)
  - PayPal (planned)
  - Medusa (future)
```

The provider-neutral models live in `lib/commerce/domain.ts`, and the contracts live in `lib/commerce/ports.ts`. Server-only provider selection belongs in `lib/commerce/server.ts`.

## Current implementation

- The home page is a Server Component that obtains products through `CatalogRepository` and passes sanitized commerce models to the interactive storefront.
- `SupabaseCatalogRepository` maps Supabase column names into provider-neutral `StoreProduct` objects.
- `FixtureCatalogRepository` keeps the current visual catalog available while the Supabase product table is empty or unavailable.
- Customer authentication is called through `CustomerAuthClient`; the React form does not import the Supabase SDK.
- Guest cart persistence is isolated behind `BrowserCartStorage` and includes migration from the previous local-storage key.
- Monetary amounts use integer cents. The checkout server must always reload products and calculate totals from authoritative database prices.

## Migration to Medusa

When migration is justified, implement `MedusaCatalogRepository`, `MedusaCartRepository`, `MedusaOrderRepository`, and a Medusa-backed customer adapter. Change provider composition on the server; do not change storefront components.

Supabase Auth can initially remain the identity provider while Medusa owns commerce. If customer identity is later moved too, introduce an explicit account-link table and migrate users separately from orders.

## Rules for new work

1. Do not import Supabase inside visual components.
2. Keep secrets and privileged clients in server-only modules.
3. Server Actions and route handlers must authenticate and authorize every mutation.
4. Never accept prices, totals, inventory, order ownership, or payment status from the browser.
5. Store provider IDs only at adapter boundaries or in explicit integration fields.
6. Return narrow domain objects to Client Components instead of raw database rows.
