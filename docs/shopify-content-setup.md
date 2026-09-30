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

## Vehicle builds gallery

Create another metaobject definition:

- Name: `Vehicle build`
- Type: `vehicle_build`
- Storefront access: enabled
- Translations: enabled (recommended)

Create these fields using the exact keys:

| Field | Key | Shopify type | Required |
| --- | --- | --- | --- |
| Cover image | `cover_image` | File (images only) | Yes |
| Gallery images | `gallery_images` | File (images only), list of values | No |
| Vehicle brand | `brand` | Single line text | Yes |
| Vehicle model | `model` | Single line text | No |
| Modification | `modification` | Single line text | Yes |
| Description | `description` | Multi-line text | No |
| Sort order | `sort_order` | Integer | Yes |
| Featured on homepage | `featured` | True or false | Yes |
| Active | `active` | True or false | Yes |

Each metaobject entry represents one car/build. Add all angles of that same car to `gallery_images`; do not create a separate entry for every photo. Shopify generates the entry handle used by the storefront URL (`/builds/entry-handle`).

The homepage shows the first four active entries with `featured` enabled. The `/builds` page shows every active entry, ordered by `sort_order`, and each detail page displays its cover plus up to 20 gallery images in a carousel. If no Shopify build entries exist yet, the four existing local builds remain visible as fallbacks.

## Daily workflow

The merchant manages:

- Products, collections, media, inventory and pricing in **Products**.
- Orders, fulfillment, refunds and customers in **Orders** and **Customers**.
- US and Dominican pricing in **Markets > Catalogs**.
- Hero slides and vehicle builds in **Content > Metaobjects**.

The former custom `/admin` routes redirect to the official Shopify Admin.

Official references:

- https://shopify.dev/docs/api/storefront/latest/queries/metaobjects
- https://help.shopify.com/en/manual/custom-data/metaobjects
