import { HomePage } from "@/components/home/HomePage";
import { getCatalog } from "@/lib/commerce/server";
import { getHomepageContent } from "@/lib/home-content";
import { getMarketCountry } from "@/lib/commerce/market";

export default async function Home() {
  const country = await getMarketCountry();
  const catalog = await getCatalog(country);
  const [products, homepageContent] = await Promise.all([catalog.listProducts(), getHomepageContent()]);

  return <HomePage products={products} heroSlides={homepageContent.heroSlides} buildGallery={homepageContent.buildGallery} />;
}
