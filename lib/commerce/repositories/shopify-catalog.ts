import "server-only";

import type { StoreProduct } from "../domain";
import type { StoreLocale } from "../locale";
import type { CatalogRepository } from "../ports";
import { storefrontRequest } from "@/lib/shopify/storefront";

type Money = {
  amount: string;
  currencyCode: string;
};

type ShopifyImage = {
  url: string;
  altText: string | null;
};

type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  collections: { nodes: Array<{ handle: string; title: string }> };
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
  shortDescription: { value: string } | null;
  vehicleMake: { value: string; type: string } | null;
  compatibility: { value: string } | null;
  material: { value: string; type: string } | null;
  finish: { value: string; type: string } | null;
  objectPosition: { value: string } | null;
  variants: {
    nodes: Array<{
      id: string;
      sku: string | null;
      availableForSale: boolean;
      price: Money;
    }>;
  };
};

type ProductConnection = {
  products: {
    nodes: ShopifyProduct[];
  };
};

type ProductByHandle = {
  product: ShopifyProduct | null;
};

const productFields = `
  id
  handle
  title
  description
  productType
  collections(first: 10) { nodes { handle title } }
  featuredImage { url altText }
  images(first: 10) { nodes { url altText } }
  shortDescription: metafield(namespace: "custom", key: "short_description") { value }
  vehicleMake: metafield(namespace: "custom", key: "vehicle_make") { value type }
  compatibility: metafield(namespace: "custom", key: "fitment") { value }
  material: metafield(namespace: "custom", key: "material") { value type }
  finish: metafield(namespace: "custom", key: "finish") { value type }
  objectPosition: metafield(namespace: "custom", key: "object_position") { value }
  variants(first: 1) {
    nodes {
      id
      sku
      availableForSale
      price { amount currencyCode }
    }
  }
`;

function metafieldTextList(metafield: { value: string; type: string } | null) {
  if (!metafield?.value) return undefined;
  if (metafield.type.startsWith("list.")) {
    try {
      const values = JSON.parse(metafield.value);
      if (Array.isArray(values)) {
        return values
          .filter((value): value is string => typeof value === "string")
          .map((value) => value.trim())
          .filter(Boolean);
      }
    } catch {
      return undefined;
    }
  }
  const value = metafield.value.trim();
  return value ? [value] : undefined;
}

function toProduct(product: ShopifyProduct, countryCode: "US" | "DO"): StoreProduct | null {
  const variant = product.variants.nodes[0];
  if (!variant) return null;

  const image = product.featuredImage ?? product.images.nodes[0] ?? null;
  const priceCents = Math.round(Number(variant.price.amount) * 100);
  if (!Number.isFinite(priceCents)) return null;

  return {
    id: product.id,
    merchandiseId: variant.id,
    slug: product.handle,
    sku: variant.sku ?? undefined,
    name: product.title,
    part: product.shortDescription?.value || product.productType || "Performance part",
    priceCents,
    currency: variant.price.currencyCode,
    displayPriceCents: priceCents,
    displayCurrency: variant.price.currencyCode,
    marketCountry: countryCode,
    inventoryQuantity: variant.availableForSale ? undefined : 0,
    description: product.description || undefined,
    productType: product.productType || undefined,
    vehicleMakes: metafieldTextList(product.vehicleMake),
    compatibility: product.compatibility?.value || undefined,
    material: metafieldTextList(product.material),
    finish: metafieldTextList(product.finish),
    image: image?.url ?? "/images/performance-parts.png",
    objectPosition: product.objectPosition?.value || "center",
    images: product.images.nodes.map((item) => ({
      url: item.url,
      alt: item.altText || product.title,
    })),
    categories: product.collections.nodes,
  };
}

export class ShopifyCatalogRepository implements CatalogRepository {
  constructor(
    private readonly countryCode: "US" | "DO" = "US",
    private readonly locale: StoreLocale = "en",
  ) {}

  async listProducts() {
    const data = await storefrontRequest<ProductConnection>(`
      query StorefrontProducts($country: CountryCode!, $language: LanguageCode!) @inContext(country: $country, language: $language) {
        products(first: 100, sortKey: CREATED_AT, reverse: true) {
          nodes { ${productFields} }
        }
      }
    `, { country: this.countryCode, language: this.locale.toUpperCase() });

    return data.products.nodes.flatMap((product) => {
      const mapped = toProduct(product, this.countryCode);
      return mapped ? [mapped] : [];
    });
  }

  async getProductBySlug(slug: string) {
    const data = await storefrontRequest<ProductByHandle>(`
      query StorefrontProduct($handle: String!, $country: CountryCode!, $language: LanguageCode!) @inContext(country: $country, language: $language) {
        product(handle: $handle) { ${productFields} }
      }
    `, {
      handle: slug,
      country: this.countryCode,
      language: this.locale.toUpperCase(),
    });

    return data.product ? toProduct(data.product, this.countryCode) : null;
  }
}
