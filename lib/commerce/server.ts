import "server-only";

import type { CatalogRepository } from "./ports";
import { FixtureCatalogRepository } from "./repositories/fixture-catalog";
import { SupabaseCatalogRepository } from "./repositories/supabase-catalog";
import { createClient } from "@/lib/supabase/server";

export function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

export async function getCatalog(): Promise<CatalogRepository> {
  const fallback = new FixtureCatalogRepository();
  const provider = process.env.COMMERCE_PROVIDER ?? "supabase";
  if (provider === "fixtures" || !hasSupabaseConfig()) return fallback;

  const repository = new SupabaseCatalogRepository(await createClient());

  return {
    async listProducts() {
      try {
        const products = await repository.listProducts();
        return products.length > 0 ? products : fallback.listProducts();
      } catch {
        return fallback.listProducts();
      }
    },
    async getProductBySlug(slug) {
      try {
        return await repository.getProductBySlug(slug) ?? fallback.getProductBySlug(slug);
      } catch {
        return fallback.getProductBySlug(slug);
      }
    },
  };
}
