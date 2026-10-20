import { CatalogMessage } from "@/components/shop/CatalogMessage";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { listCatalogProducts } from "@/lib/commerce/server";
import { getMarketCountry } from "@/lib/commerce/market";
import { getStoreLocale } from "@/lib/commerce/locale";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl, itemListJsonLd } from "@/lib/seo";
import { generatePublicPageMetadata } from "@/lib/seo-page-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return generatePublicPageMetadata("shop", "/shop", searchParams);
}

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

  const listSchema = itemListJsonLd(
    products.slice(0, 48).map((product) => ({
      name: product.name,
      url: absoluteUrl(`/products/${product.slug}`),
    })),
  );

  return (
    <>
      <JsonLd data={listSchema} />
      <ShopCatalog products={products} initialQuery={initialQuery} focusSearch={focusSearch} />
    </>
  );
}
