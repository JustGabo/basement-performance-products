import "server-only";

import type { StoreProduct } from "../domain";
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
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
  shortDescription: { value: string } | null;
  compatibility: { value: string } | null;
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
  featuredImage { url altText }
  images(first: 10) { nodes { url altText } }
  shortDescription: metafield(namespace: "custom", key: "short_description") { value }
  compatibility: metafield(namespace: "custom", key: "compatibility") { value }
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

function toProduct(product: ShopifyProduct, countryCode: "US" | "DO"): StoreProduct | null {
  const variant = product.variants.nodes[0];
  if (!variant) return null;

  const image = product.featuredImage ?? product.images.nodes[0] ?? null;
  const priceCents = Math.round(Number(variant.price.amount) * 100);
  if (!Number.isFinite(priceCents)) return null;

  const dopRate = Number(process.env.NEXT_PUBLIC_DOP_PER_USD ?? "60");
  const displayInDop = countryCode === "DO" && variant.price.currencyCode === "USD" && Number.isFinite(dopRate) && dopRate > 0;

  return {
    id: product.id,
    merchandiseId: variant.id,
    slug: product.handle,
    sku: variant.sku ?? undefined,
    name: product.title,
    part: product.shortDescription?.value || product.productType || "Performance part",
    priceCents,
    currency: variant.price.currencyCode,
    displayPriceCents: displayInDop ? Math.round(priceCents * dopRate) : priceCents,
    displayCurrency: displayInDop ? "DOP" : variant.price.currencyCode,
    marketCountry: countryCode,
    inventoryQuantity: variant.availableForSale ? undefined : 0,
    description: product.description || undefined,
    compatibility: product.compatibility?.value || undefined,
    image: image?.url ?? "/images/performance-parts.png",
    objectPosition: product.objectPosition?.value || "center",
    images: product.images.nodes.map((item) => ({
      url: item.url,
      alt: item.altText || product.title,
    })),
  };
}

export class ShopifyCatalogRepository implements CatalogRepository {
  constructor(private readonly countryCode: "US" | "DO" = "US") {}

  async listProducts() {
    const data = await storefrontRequest<ProductConnection>(`
      query StorefrontProducts($country: CountryCode!) @inContext(country: $country) {
        products(first: 100, sortKey: CREATED_AT, reverse: true) {
          nodes { ${productFields} }
        }
      }
    `, { country: this.countryCode });

    return data.products.nodes.flatMap((product) => {
      const mapped = toProduct(product, this.countryCode);
      return mapped ? [mapped] : [];
    });
  }

  async getProductBySlug(slug: string) {
    const data = await storefrontRequest<ProductByHandle>(`
      query StorefrontProduct($handle: String!, $country: CountryCode!) @inContext(country: $country) {
        product(handle: $handle) { ${productFields} }
      }
    `, { handle: slug, country: this.countryCode });

    return data.product ? toProduct(data.product, this.countryCode) : null;
  }
}
