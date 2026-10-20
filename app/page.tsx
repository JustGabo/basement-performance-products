import { Suspense } from "react";
import { HomePage } from "@/components/home/HomePage";
import { listCatalogProducts } from "@/lib/commerce/server";
import { getHomepageContent } from "@/lib/home-content";
import { getMarketCountry } from "@/lib/commerce/market";
import { resolveStoreLocale } from "@/lib/commerce/locale";
import { generatePublicPageMetadata } from "@/lib/seo-page-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return generatePublicPageMetadata("home", "/", searchParams);
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const [country, locale] = await Promise.all([
    getMarketCountry(),
    resolveStoreLocale(query),
  ]);
  const [{ products, unavailable }, homepageContent] = await Promise.all([
    listCatalogProducts(country, locale),
    getHomepageContent(),
  ]);

  return (
    <Suspense fallback={null}>
      <HomePage
        products={products}
        catalogUnavailable={unavailable}
        heroSlides={homepageContent.heroSlides}
        buildGallery={homepageContent.buildGallery}
        initialLocale={locale}
      />
    </Suspense>
  );
}
