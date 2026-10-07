import "server-only";

import type { StoreProduct } from "./domain";
import type { CatalogRepository } from "./ports";
import type { StoreLocale } from "./locale";
import { FixtureCatalogRepository } from "./repositories/fixture-catalog";
import { ShopifyCatalogRepository } from "./repositories/shopify-catalog";
import { SupabaseCatalogRepository } from "./repositories/supabase-catalog";
import { createClient } from "@/lib/supabase/server";
import { hasShopifyConfig } from "@/lib/shopify/storefront";

export function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

function withFallback(primary: CatalogRepository, fallback: CatalogRepository): CatalogRepository {
  return {
    async listProducts() {
      try {
        const products = await primary.listProducts();
        return products.length > 0 ? products : fallback.listProducts();
      } catch {
        return fallback.listProducts();
      }
    },
    async getProductBySlug(slug) {
      try {
        return await primary.getProductBySlug(slug) ?? fallback.getProductBySlug(slug);
      } catch {
        return fallback.getProductBySlug(slug);
      }
    },
  };
}

export async function getCatalog(
  countryCode: "US" | "DO" = "US",
  locale: StoreLocale = "en",
): Promise<CatalogRepository> {
  const provider = process.env.COMMERCE_PROVIDER ?? "supabase";
  if (provider === "fixtures") return new FixtureCatalogRepository();

  if (provider === "shopify") {
    if (!hasShopifyConfig()) throw new Error("Shopify catalog is not configured.");
    return new ShopifyCatalogRepository(countryCode, locale);
  }

  const fixtures = new FixtureCatalogRepository();
  return hasSupabaseConfig()
    ? withFallback(new SupabaseCatalogRepository(await createClient()), fixtures)
    : fixtures;
}

export async function listCatalogProducts(
  countryCode: "US" | "DO" = "US",
  locale: StoreLocale = "en",
): Promise<{ products: StoreProduct[]; unavailable: boolean }> {
  try {
    const catalog = await getCatalog(countryCode, locale);
    return { products: await catalog.listProducts(), unavailable: false };
  } catch (error) {
    console.error("Catalog request failed.", error);
    return { products: [], unavailable: true };
  }
}

export async function getCatalogProduct(
  slug: string,
  countryCode: "US" | "DO" = "US",
  locale: StoreLocale = "en",
): Promise<{ product: StoreProduct | null; unavailable: boolean }> {
  try {
    const catalog = await getCatalog(countryCode, locale);
    return { product: await catalog.getProductBySlug(slug), unavailable: false };
  } catch (error) {
    console.error("Catalog request failed.", error);
    return { product: null, unavailable: true };
  }
}
