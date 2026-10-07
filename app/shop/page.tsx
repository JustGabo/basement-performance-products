import type { Metadata } from "next";
import { CatalogMessage } from "@/components/shop/CatalogMessage";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { listCatalogProducts } from "@/lib/commerce/server";
import { getMarketCountry } from "@/lib/commerce/market";
import { getStoreLocale } from "@/lib/commerce/locale";
import { shareMetadata } from "@/lib/seo";

export const metadata: Metadata = shareMetadata({
  title: "Shop Carbon Fiber",
  description: "Shop fiberglass and carbon fiber performance parts for street, show and track builds.",
  path: "/shop",
});

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const params = await searchParams;
  const rawQuery = params.q;
  const initialQuery = typeof rawQuery === "string" ? rawQuery : "";
  const focusSearch = params.focus === "search";
  const [country, locale] = await Promise.all([
    getMarketCountry(),
    getStoreLocale(),
  ]);
  const { products, unavailable } = await listCatalogProducts(country, locale);
  if (unavailable || products.length === 0) {
    return <CatalogMessage locale={locale} kind={unavailable ? "unavailable" : "empty"} />;
  }

  return <ShopCatalog products={products} initialQuery={initialQuery} focusSearch={focusSearch} />;
}
