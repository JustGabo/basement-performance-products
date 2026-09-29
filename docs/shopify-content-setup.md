# Shopify-managed homepage content

The storefront reads the homepage hero and **Built in the Basement** gallery from Shopify metaobjects. Until entries are published, the existing local images remain visible as fallbacks.

## Storefront API permission

In **Sales channels > Headless > API Storefront > Manage**, enable the Storefront API permission for reading metaobjects (`unauthenticated_read_metaobjects`).

## Hero slides

In **Settings > Custom data > Metaobjects**, create a definition with:

- Name: `Homepage hero slide`
- Type: `homepage_hero_slide`
- Storefront access: enabled

Create these fields using the exact keys:

| Field | Key | Shopify type | Required |
| --- | --- | --- | --- |
| Image | `image` | File (images only) | Yes |
| Alternative text | `alt_text` | Single line text | No |
| Object position | `object_position` | Single line text | No |
| Sort order | `sort_order` | Integer | Yes |
| Active | `active` | True or false | Yes |

Use `center` for the object position initially. CSS values such as `65% center` are also supported. The storefront displays at most 10 active slides and rotates them every five seconds.

## Featured builds gallery

Create another metaobject definition:

- Name: `Featured build`
- Type: `featured_build`
- Storefront access: enabled

Create these fields using the exact keys:

| Field | Key | Shopify type | Required |
| --- | --- | --- | --- |
| Image | `image` | File (images only) | Yes |
| Vehicle brand | `brand` | Single line text | Yes |
| Modification | `modification` | Single line text | Yes |
| Link | `link` | URL | No |
| Sort order | `sort_order` | Integer | Yes |
| Active | `active` | True or false | Yes |

The storefront displays at most 12 active builds. Entries are ordered by `sort_order`.

## Daily workflow

The merchant manages:

- Products, collections, media, inventory and pricing in **Products**.
- Orders, fulfillment, refunds and customers in **Orders** and **Customers**.
- US and Dominican pricing in **Markets > Catalogs**.
- Hero slides and featured builds in **Content > Metaobjects**.

The former custom `/admin` routes redirect to the official Shopify Admin.

Official references:

- https://shopify.dev/docs/api/storefront/latest/queries/metaobjects
- https://help.shopify.com/en/manual/custom-data/metaobjects
