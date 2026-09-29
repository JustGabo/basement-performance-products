import "server-only";

import type { CatalogRepository } from "./ports";
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

export async function getCatalog(countryCode: "US" | "DO" = "US"): Promise<CatalogRepository> {
  const fixtures = new FixtureCatalogRepository();
  const provider = process.env.COMMERCE_PROVIDER ?? "supabase";
  if (provider === "fixtures") return fixtures;

  const supabase = hasSupabaseConfig()
    ? withFallback(new SupabaseCatalogRepository(await createClient()), fixtures)
    : fixtures;

  if (provider === "shopify" && hasShopifyConfig()) {
    return withFallback(new ShopifyCatalogRepository(countryCode), supabase);
  }

  return supabase;
}
