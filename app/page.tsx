import { HomePage } from "@/components/home/HomePage";
import { listCatalogProducts } from "@/lib/commerce/server";
import { getHomepageContent } from "@/lib/home-content";
import { getMarketCountry } from "@/lib/commerce/market";
import { getStoreLocale } from "@/lib/commerce/locale";
import { shareMetadata, siteDescription, siteName } from "@/lib/seo";

export const metadata = shareMetadata({
  title: siteName,
  description: siteDescription,
  path: "/",
  absoluteTitle: true,
});

export default async function Home() {
  const [country, locale] = await Promise.all([
    getMarketCountry(),
    getStoreLocale(),
  ]);
  const [{ products, unavailable }, homepageContent] = await Promise.all([
    listCatalogProducts(country, locale),
    getHomepageContent(),
  ]);

  return <HomePage products={products} catalogUnavailable={unavailable} heroSlides={homepageContent.heroSlides} buildGallery={homepageContent.buildGallery} initialLocale={locale} />;
}
