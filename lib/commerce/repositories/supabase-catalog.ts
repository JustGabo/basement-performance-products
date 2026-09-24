import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { StoreProduct } from "../domain";
import type { CatalogRepository } from "../ports";

type ProductRow = {
  id: string;
  slug: string;
  sku: string;
  name_en: string;
  description_en: string | null;
  short_description_en: string | null;
  price_cents: number;
  currency: string;
  inventory_quantity: number;
  primary_image_url: string | null;
  metadata: Record<string, unknown> | null;
  product_images: Array<{ image_url: string; alt_en: string | null; sort_order: number }> | null;
};

function toProduct(row: ProductRow): StoreProduct {
  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name: row.name_en,
    part: row.short_description_en ?? "Performance part",
    priceCents: Number(row.price_cents),
    currency: row.currency,
    inventoryQuantity: row.inventory_quantity,
    description: row.description_en ?? undefined,
    compatibility: typeof row.metadata?.compatibility === "string" ? row.metadata.compatibility : undefined,
    image: row.primary_image_url ?? "/images/performance-parts.png",
    objectPosition: typeof row.metadata?.object_position === "string" ? row.metadata.object_position : "center",
    images: row.product_images
      ?.sort((a, b) => a.sort_order - b.sort_order)
      .map((image) => ({ url: image.image_url, alt: image.alt_en ?? row.name_en })),
  };
}

const selection = "id, slug, sku, name_en, description_en, short_description_en, price_cents, currency, inventory_quantity, primary_image_url, metadata, product_images(image_url, alt_en, sort_order)";

export class SupabaseCatalogRepository implements CatalogRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listProducts() {
    const { data, error } = await this.client.from("products").select(selection).eq("status", "active").order("created_at", { ascending: false });
    if (error) throw new Error(`Could not load catalog: ${error.message}`);
    return (data as ProductRow[]).map(toProduct);
  }

  async getProductBySlug(slug: string) {
    const { data, error } = await this.client.from("products").select(selection).eq("slug", slug).eq("status", "active").maybeSingle();
    if (error) throw new Error(`Could not load product: ${error.message}`);
    return data ? toProduct(data as ProductRow) : null;
  }
}
