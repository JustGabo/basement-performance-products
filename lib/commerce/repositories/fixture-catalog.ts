import { products } from "@/lib/products";
import type { CatalogRepository } from "../ports";

export class FixtureCatalogRepository implements CatalogRepository {
  async listProducts() {
    return products;
  }

  async getProductBySlug(slug: string) {
    return products.find((product) => product.slug === slug) ?? null;
  }
}
